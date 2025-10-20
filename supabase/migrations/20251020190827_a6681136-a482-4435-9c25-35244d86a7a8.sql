-- Create a function to get visitor sessions with user emails in a single query
CREATE OR REPLACE FUNCTION get_visitor_sessions_with_users()
RETURNS TABLE (
  id uuid,
  session_id text,
  landing_page text,
  referrer text,
  user_agent text,
  current_step text,
  started_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz,
  total_time_seconds integer,
  conversion_type text,
  extra_data jsonb,
  user_id uuid,
  user_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    vs.id,
    vs.session_id,
    vs.landing_page,
    vs.referrer,
    vs.user_agent,
    vs.current_step,
    vs.started_at,
    vs.updated_at,
    vs.completed_at,
    vs.total_time_seconds,
    vs.conversion_type,
    vs.extra_data,
    vs.user_id,
    au.email as user_email
  FROM visitor_sessions vs
  LEFT JOIN auth.users au ON vs.user_id = au.id
  ORDER BY vs.started_at DESC;
$$;