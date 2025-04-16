
-- This migration would set up a CRON job to run the check-ai-insights function
-- In a production environment, this would run periodically to check for insights and send WhatsApp messages

-- First, make sure we have the necessary tables for insights and WhatsApp messages
CREATE TABLE IF NOT EXISTS public.farm_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  field_id UUID REFERENCES public.fields NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_taken BOOLEAN DEFAULT FALSE
);

-- Table to track WhatsApp messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  response TEXT
);

-- Add necessary indices
CREATE INDEX IF NOT EXISTS farm_insights_user_id_idx ON public.farm_insights(user_id);
CREATE INDEX IF NOT EXISTS farm_insights_field_id_idx ON public.farm_insights(field_id);
CREATE INDEX IF NOT EXISTS whatsapp_messages_user_id_idx ON public.whatsapp_messages(user_id);

-- Add RLS policies
ALTER TABLE public.farm_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Users can only view their own insights
CREATE POLICY farm_insights_select_policy
  ON public.farm_insights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only view their own WhatsApp messages
CREATE POLICY whatsapp_messages_select_policy
  ON public.whatsapp_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert into WhatsApp messages
CREATE POLICY whatsapp_messages_insert_policy
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (true); -- Only callable by service role in edge functions

-- Only service role can insert into farm insights
CREATE POLICY farm_insights_insert_policy
  ON public.farm_insights
  FOR INSERT
  WITH CHECK (true); -- Only callable by service role in edge functions

-- Users can mark their own insights as read
CREATE POLICY farm_insights_update_policy
  ON public.farm_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

-- In a production environment, we would add a CRON job here:
/*
-- Enable the pg_cron extension
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add a job to run the check-ai-insights function every 6 hours
-- SELECT cron.schedule(
--   'check_ai_insights',
--   '0 */6 * * *', -- Every 6 hours
--   $$
--   SELECT http_post(
--     'https://bapqlyvfwxsichlyjxpd.functions.supabase.co/check-ai-insights',
--     '{}',
--     'application/json',
--     ARRAY[
--       ('Authorization', 'Bearer ' || current_setting('app.settings.anon_key'))::http_header
--     ]
--   );
--   $$
-- );
*/

-- Note: For now, we'll trigger this manually or via application logic
-- The code above is a template for setting up CRON when needed
