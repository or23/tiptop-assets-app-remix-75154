-- Add CRM fields to leads table for status tracking and communication history
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS contacted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS report_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_contact_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS contact_method text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS assigned_to uuid,
ADD COLUMN IF NOT EXISTS property_analysis_id uuid,
ADD COLUMN IF NOT EXISTS communication_history jsonb DEFAULT '[]'::jsonb;

-- Add check constraint for status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_status_check'
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'report_sent', 'follow_up', 'converted', 'not_interested'));
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_property_analysis ON public.leads(property_analysis_id);

-- Update existing RLS policy for admins to update leads
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create a function to add communication history entries
CREATE OR REPLACE FUNCTION add_lead_communication(
  p_lead_id uuid,
  p_method text,
  p_message text,
  p_sent_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE leads
  SET 
    communication_history = communication_history || jsonb_build_object(
      'timestamp', now(),
      'method', p_method,
      'message', p_message,
      'sent_by', p_sent_by
    ),
    last_contact_at = now(),
    contact_method = p_method
  WHERE id = p_lead_id;
END;
$$;