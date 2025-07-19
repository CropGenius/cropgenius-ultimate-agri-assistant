/**
 * 🛰️ SATELLITE WHATSAPP ALERT SERVICE
 * Send precision agriculture alerts via WhatsApp for maximum farmer reach
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppAlertRequest {
  user_id: string;
  field_id: string;
  alert_type: 'water_stress' | 'nutrient_deficiency' | 'harvest_timing' | 'variable_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  coordinates?: { lat: number; lng: number }[];
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      user_id,
      field_id,
      alert_type,
      severity,
      message,
      coordinates,
      language = 'en'
    }: WhatsAppAlertRequest = await req.json()

    // Get user profile and WhatsApp number
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('phone_number, preferred_language, whatsapp_notifications')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has WhatsApp notifications enabled
    if (!profile.whatsapp_notifications) {
      return new Response(
        JSON.stringify({ message: 'WhatsApp notifications disabled for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile.phone_number) {
      return new Response(
        JSON.stringify({ error: 'No phone number registered' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get field information
    const { data: field, error: fieldError } = await supabaseClient
      .from('fields')
      .select('name, crop_type, size, size_unit')
      .eq('id', field_id)
      .single();

    // Format WhatsApp message based on alert type and language
    const whatsappMessage = formatWhatsAppMessage(
      alert_type,
      severity,
      message,
      field?.name || 'Your Field',
      field?.crop_type || 'crop',
      profile.preferred_language || language
    );

    // Send WhatsApp message
    const whatsappResponse = await sendWhatsAppMessage(
      profile.phone_number,
      whatsappMessage
    );

    if (!whatsappResponse.success) {
      throw new Error(`WhatsApp send failed: ${whatsappResponse.error}`);
    }

    // Log the alert
    await supabaseClient
      .from('whatsapp_alerts_log')
      .insert({
        user_id,
        field_id,
        alert_type,
        severity,
        phone_number: profile.phone_number,
        message: whatsappMessage,
        sent_at: new Date().toISOString(),
        delivery_status: 'sent'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp alert sent successfully',
        whatsapp_id: whatsappResponse.message_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('WhatsApp alert error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send WhatsApp alert',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Format WhatsApp message based on alert type and language
 */
function formatWhatsAppMessage(
  alertType: string,
  severity: string,
  originalMessage: string,
  fieldName: string,
  cropType: string,
  language: string
): string {
  const templates = {
    en: {
      water_stress: {
        critical: `🚨 *URGENT WATER ALERT* 🚨\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n💧 *CRITICAL WATER STRESS DETECTED*\n\nYour crops need immediate irrigation within 24 hours to prevent failure.\n\n*Action Required:*\n• Start irrigation immediately\n• Check irrigation system\n• Monitor soil moisture daily\n\n*CropGenius Satellite Analysis*\n📡 Powered by real satellite data`,
        high: `⚠️ *WATER STRESS ALERT* ⚠️\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n💧 *HIGH WATER STRESS*\n\nIncrease irrigation frequency by 30% and monitor soil moisture daily.\n\n*Recommended Actions:*\n• Increase watering schedule\n• Check for irrigation leaks\n• Consider mulching\n\n*CropGenius Satellite Analysis*\n📡 Real-time field monitoring`
      },
      nutrient_deficiency: {
        high: `🌱 *NUTRIENT ALERT* 🌱\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n*NUTRIENT DEFICIENCY DETECTED*\n\nSatellite analysis shows low vegetation health indicating nutrient deficiency.\n\n*Recommended Actions:*\n• Conduct soil testing\n• Apply balanced fertilizer\n• Consider foliar feeding\n\n*CropGenius Satellite Analysis*\n📡 NDVI-based detection`
      },
      harvest_timing: {
        medium: `🌾 *HARVEST READY* 🌾\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n*OPTIMAL HARVEST WINDOW*\n\nSatellite data indicates your crop is ready for harvest within 1-2 weeks for maximum yield.\n\n*Action Required:*\n• Prepare harvesting equipment\n• Check market prices\n• Plan logistics\n\n*CropGenius Satellite Analysis*\n📡 Precision timing for maximum profit`,
        high: `⏰ *URGENT HARVEST* ⏰\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n*LATE HARVEST ALERT*\n\nHarvest immediately to prevent yield loss. Crop is over-mature.\n\n*Action Required:*\n• Harvest today if possible\n• Prioritize this field\n• Check for quality issues\n\n*CropGenius Satellite Analysis*\n📡 Preventing yield loss`
      }
    },
    sw: {
      water_stress: {
        critical: `🚨 *ONYO LA MAJI WA HARAKA* 🚨\n\n*Shamba:* ${fieldName}\n*Mazao:* ${cropType}\n\n💧 *UHABA WA MAJI MKUBWA*\n\nMazao yako yanahitaji umwagiliaji wa haraka ndani ya masaa 24 ili kuzuia uharibifu.\n\n*Hatua Zinazohitajika:*\n• Anza umwagiliaji mara moja\n• Kagua mfumo wa umwagiliaji\n• Fuatilia unyevu wa udongo kila siku\n\n*Uchambuzi wa CropGenius*\n📡 Kutoka data ya anga`,
        high: `⚠️ *ONYO LA MAJI* ⚠️\n\n*Shamba:* ${fieldName}\n*Mazao:* ${cropType}\n\n💧 *UHABA WA MAJI*\n\nOngeza umwagiliaji kwa asilimia 30 na fuatilia unyevu wa udongo kila siku.\n\n*CropGenius Satellite*\n📡 Ufuatiliaji wa wakati halisi`
      }
    }
  };

  const langTemplates = templates[language as keyof typeof templates] || templates.en;
  const alertTemplates = langTemplates[alertType as keyof typeof langTemplates];
  
  if (alertTemplates && alertTemplates[severity as keyof typeof alertTemplates]) {
    return alertTemplates[severity as keyof typeof alertTemplates];
  }

  // Fallback to original message with formatting
  return `🛰️ *CropGenius Alert*\n\n*Field:* ${fieldName}\n*Crop:* ${cropType}\n\n${originalMessage}\n\n📡 *Satellite Analysis*\nReal-time field monitoring`;
}

/**
 * Send WhatsApp message via WhatsApp Business API
 */
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<{
  success: boolean;
  message_id?: string;
  error?: string;
}> {
  const whatsappToken = Deno.env.get('VITE_WHATSAPP_ACCESS_TOKEN');
  const whatsappPhoneId = Deno.env.get('VITE_WHATSAPP_PHONE_NUMBER_ID');

  if (!whatsappToken || !whatsappPhoneId) {
    return {
      success: false,
      error: 'WhatsApp credentials not configured'
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: `WhatsApp API error: ${errorData.error?.message || response.statusText}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message_id: responseData.messages?.[0]?.id
    };

  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
}