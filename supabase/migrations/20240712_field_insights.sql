
-- Create table for storing AI-generated field insights
CREATE TABLE IF NOT EXISTS public.field_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS field_insights_field_id_idx ON public.field_insights(field_id);
CREATE INDEX IF NOT EXISTS field_insights_user_id_idx ON public.field_insights(user_id);

-- Enable Row Level Security
ALTER TABLE public.field_insights ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own field insights
CREATE POLICY "Users can view their own field insights" 
  ON public.field_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own field insights
CREATE POLICY "Users can insert their own field insights" 
  ON public.field_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
