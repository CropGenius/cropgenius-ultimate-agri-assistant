// WhatsApp notification edge function
// This is a skeleton implementation that would be connected to WhatsApp Business API or Twilio
// in a production environment

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  phone: string;
  message: string;
  userId: string;
  insightType: 'weather' | 'market' | 'pest' | 'fertilizer';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract the request data
    const { phone, message, userId, insightType } =
      (await req.json()) as WhatsAppMessage;

    console.log(`Sending WhatsApp message to ${phone} for user ${userId}`);
    console.log(`Message type: ${insightType}`);
    console.log(`Message: ${message}`);

    // Check if user has WhatsApp notifications enabled
    const { data: userData, error: userError } = await supabase
      .from('user_memory')
      .select('memory_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found or error retrieving user data');
    }

    const userMemory = userData.memory_data;

    // Check if user has opted in to WhatsApp notifications
    if (!userMemory.whatsappOptIn) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User has not opted in to WhatsApp notifications',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // In a production environment, this would integrate with WhatsApp Business API or Twilio
    // For now, we'll just simulate a successful message

    // Simulate API call (in production this would be an actual API call)
    const success = true;

    if (success) {
      // Log the message in a messages table
      const { error: msgError } = await supabase
        .from('whatsapp_messages')
        .insert({
          user_id: userId,
          phone_number: phone,
          message_type: insightType,
          message_content: message,
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

      if (msgError) {
        console.error('Error logging WhatsApp message:', msgError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'WhatsApp message sent successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      throw new Error('Failed to send WhatsApp message');
    }
  } catch (error) {
    console.error('Error in whatsapp-notification function:', error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
