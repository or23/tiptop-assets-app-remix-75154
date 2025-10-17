-- Create user_events table for behavior tracking
CREATE TABLE public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'click', 'form_submit', 'interaction')),
  event_target text NOT NULL,
  page_url text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_events_timestamp ON public.user_events(timestamp DESC);
CREATE INDEX idx_user_events_session ON public.user_events(session_id);
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_type ON public.user_events(event_type);

-- Enable Row Level Security
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert events (for tracking before auth)
CREATE POLICY "Allow anonymous event tracking"
  ON public.user_events
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view all events"
  ON public.user_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Enable Realtime for live updates
ALTER TABLE public.user_events REPLICA IDENTITY FULL;