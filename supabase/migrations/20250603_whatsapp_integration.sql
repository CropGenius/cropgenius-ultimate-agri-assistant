-- WhatsApp Integration Schema for CropGenius
-- Run this in Supabase SQL Editor to create the required tables and functions

-- Create WhatsApp messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  user_id UUID REFERENCES auth.users(id),
  has_media BOOLEAN DEFAULT false,
  message_sid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT true,
  -- Add fields for analytics and tracking
  message_type TEXT, -- 'command', 'chat', 'alert', etc.
  response_time_ms INTEGER, -- track response time for performance metrics
  processing_status TEXT DEFAULT 'completed' -- 'pending', 'processing', 'completed', 'failed'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);

-- Add RLS policies for WhatsApp messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Admins can see all messages
CREATE POLICY admin_all_whatsapp_messages ON public.whatsapp_messages 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'app_metadata' ? 'is_admin');

-- Users can only see their own messages
CREATE POLICY user_own_whatsapp_messages ON public.whatsapp_messages 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a view for analytics
CREATE OR REPLACE VIEW whatsapp_analytics AS
SELECT 
  date_trunc('day', created_at) AS day,
  direction,
  message_type,
  COUNT(*) AS message_count,
  AVG(response_time_ms) AS avg_response_time_ms
FROM public.whatsapp_messages
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

-- Create user profile field for WhatsApp preferences
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_verification_code TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_alert_preferences JSONB DEFAULT '{"weather": true, "tasks": true, "market": true, "system": true}';

-- Function to process incoming WhatsApp messages (skeleton for edge function)
CREATE OR REPLACE FUNCTION process_incoming_whatsapp(
  phone_number TEXT,
  message_content TEXT,
  message_sid TEXT,
  has_media BOOLEAN DEFAULT FALSE
) RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_response TEXT;
BEGIN
  -- Look up user by phone number
  SELECT user_id INTO v_user_id FROM public.user_profiles WHERE phone_number = phone_number LIMIT 1;
  
  -- Log the message
  INSERT INTO public.whatsapp_messages (
    phone_number,
    message_content,
    message_sid,
    direction,
    user_id,
    has_media,
    processed,
    message_type
  ) VALUES (
    phone_number,
    message_content,
    message_sid,
    'inbound',
    v_user_id,
    has_media,
    TRUE,
    CASE 
      WHEN message_content ILIKE 'weather%' THEN 'weather'
      WHEN message_content ILIKE 'task%' THEN 'task'
      WHEN message_content ILIKE 'market%' THEN 'market'
      WHEN message_content ILIKE 'help%' THEN 'help'
      ELSE 'chat'
    END
  );
  
  -- Return success
  RETURN 'Message processed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment: This SQL script sets up the infrastructure for the WhatsApp integration
-- The actual message processing logic will be handled by the WhatsApp assistant in the app
-- and potential edge functions for webhook handling
