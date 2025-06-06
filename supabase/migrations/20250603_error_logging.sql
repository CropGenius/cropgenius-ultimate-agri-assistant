-- Error Logging Schema for CropGenius
-- Run this in Supabase SQL Editor to create the error logging infrastructure

-- Create error_logs table for production monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_name TEXT,
  error_stack TEXT,
  component_stack TEXT,
  component TEXT,
  user_id UUID REFERENCES auth.users(id),
  browser_info TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  app_version TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  environment TEXT DEFAULT 'production'
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON public.error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);

-- Add RLS policies for error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Admins can see all error logs
CREATE POLICY admin_all_error_logs ON public.error_logs 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'app_metadata' ? 'is_admin');

-- Users can insert their own errors but not view them
CREATE POLICY user_insert_error_logs ON public.error_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create a view for error analytics
CREATE OR REPLACE VIEW error_analytics AS
SELECT 
  date_trunc('day', timestamp) AS day,
  component,
  error_name,
  COUNT(*) AS error_count,
  COUNT(DISTINCT user_id) AS affected_users
FROM public.error_logs
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

-- Function to mark errors as resolved
CREATE OR REPLACE FUNCTION resolve_error(
  error_id UUID,
  notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE public.error_logs
  SET 
    resolved = TRUE,
    resolution_notes = notes
  WHERE id = error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
