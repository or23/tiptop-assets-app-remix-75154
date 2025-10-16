-- Phase 1: Provider Commission Tracking
CREATE TABLE provider_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  
  -- Commission rates (must sum to 1.0)
  tiptop_commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  user_earning_rate NUMERIC NOT NULL DEFAULT 0.80,
  
  -- Revenue model
  payment_model TEXT NOT NULL DEFAULT 'revenue_share',
  fixed_fee_amount NUMERIC DEFAULT 0,
  
  -- API configuration
  has_api BOOLEAN DEFAULT false,
  api_endpoint TEXT,
  api_key_required BOOLEAN DEFAULT false,
  
  -- Tracking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_rates CHECK (
    tiptop_commission_rate + user_earning_rate = 1.0
  ),
  CONSTRAINT valid_commission CHECK (
    tiptop_commission_rate >= 0 AND tiptop_commission_rate <= 1
  )
);

-- Insert initial commission data for existing providers
INSERT INTO provider_commissions (provider_name, has_api, api_endpoint) VALUES
  ('FlexOffers', true, 'https://api.flexoffers.com'),
  ('SpotHero', true, 'https://api.spothero.com'),
  ('Neighbor.com', true, 'https://api.neighbor.com'),
  ('ChargePoint', true, 'https://api.chargepoint.com'),
  ('Eventbrite', true, 'https://www.eventbriteapi.com'),
  ('Honeygain', true, 'https://dashboard.honeygain.com/api'),
  ('Swimply', false, NULL),
  ('Peerspace', false, NULL),
  ('Instacart', false, NULL),
  ('Airbnb', false, NULL),
  ('Grass', false, NULL);

-- Phase 2: Enhance affiliate_earnings table
ALTER TABLE affiliate_earnings
ADD COLUMN IF NOT EXISTS user_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiptop_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0.20,
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Backfill existing earnings data (80/20 split)
UPDATE affiliate_earnings
SET 
  user_earnings = COALESCE(earnings_amount, 0) * 0.80,
  tiptop_revenue = COALESCE(earnings_amount, 0) * 0.20,
  commission_rate = 0.20,
  is_verified = true
WHERE user_earnings IS NULL OR user_earnings = 0;

-- Phase 3: Create admin revenue views
CREATE MATERIALIZED VIEW admin_revenue_by_provider AS
SELECT 
  ae.provider_name,
  COUNT(DISTINCT ae.user_id) as active_users,
  COUNT(*) as total_transactions,
  SUM(ae.user_earnings) as total_user_earnings,
  SUM(ae.tiptop_revenue) as total_tiptop_revenue,
  SUM(COALESCE(ae.earnings_amount, 0)) as total_gross_revenue,
  AVG(ae.commission_rate) as avg_commission_rate,
  MAX(ae.updated_at) as last_transaction,
  pc.has_api,
  pc.payment_model
FROM affiliate_earnings ae
LEFT JOIN provider_commissions pc ON pc.provider_name = ae.provider_name
WHERE ae.status != 'failed'
GROUP BY ae.provider_name, pc.has_api, pc.payment_model
ORDER BY total_tiptop_revenue DESC;

CREATE MATERIALIZED VIEW admin_revenue_timeline AS
SELECT 
  DATE_TRUNC('day', ae.created_at) as date,
  ae.provider_name,
  SUM(ae.tiptop_revenue) as daily_tiptop_revenue,
  SUM(ae.user_earnings) as daily_user_earnings,
  COUNT(DISTINCT ae.user_id) as active_users,
  COUNT(*) as transactions
FROM affiliate_earnings ae
WHERE ae.created_at >= NOW() - INTERVAL '90 days'
  AND ae.status != 'failed'
GROUP BY DATE_TRUNC('day', ae.created_at), ae.provider_name
ORDER BY date DESC;

CREATE MATERIALIZED VIEW admin_user_ltv AS
SELECT 
  ae.user_id,
  COUNT(DISTINCT ae.provider_name) as providers_count,
  SUM(ae.user_earnings) as total_user_earnings,
  SUM(ae.tiptop_revenue) as total_tiptop_revenue,
  MIN(ae.created_at) as first_earning_date,
  MAX(ae.updated_at) as last_earning_date,
  ROUND(
    (SUM(ae.tiptop_revenue) / NULLIF(EXTRACT(EPOCH FROM (MAX(ae.updated_at) - MIN(ae.created_at)))/2592000, 0))::NUMERIC,
    2
  ) as avg_monthly_tiptop_revenue
FROM affiliate_earnings ae
WHERE ae.status != 'failed'
GROUP BY ae.user_id
ORDER BY total_tiptop_revenue DESC;

-- RLS Policies
ALTER TABLE provider_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view commissions"
  ON provider_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage commissions"
  ON provider_commissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_admin_revenue_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW admin_revenue_by_provider;
  REFRESH MATERIALIZED VIEW admin_revenue_timeline;
  REFRESH MATERIALIZED VIEW admin_user_ltv;
END;
$$;

-- Grant permissions
GRANT SELECT ON admin_revenue_by_provider TO authenticated;
GRANT SELECT ON admin_revenue_timeline TO authenticated;
GRANT SELECT ON admin_user_ltv TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_admin_revenue_views() TO authenticated;