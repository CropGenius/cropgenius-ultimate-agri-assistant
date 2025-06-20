-- Create table to log all growth-related events
CREATE TABLE IF NOT EXISTS public.growth_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.growth_log ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own growth logs
CREATE POLICY "Allow users to read their own growth logs"
ON public.growth_log
FOR SELECT
USING (auth.uid() = user_id); 