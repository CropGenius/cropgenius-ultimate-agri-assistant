
import { supabase } from '@/integrations/supabase/client';

// Base URL for Supabase edge functions
const SUPABASE_URL = 'https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1';

export interface WhatsAppNotificationPayload {
  phone: string;
  message: string;
  userId: string;
  insightType: 'weather' | 'market' | 'pest' | 'fertilizer';
}

/**
 * Send a WhatsApp notification via the Supabase edge function
 */
export const sendWhatsAppNotification = async (payload: WhatsAppNotificationPayload) => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-notification', {
      body: payload
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    throw error;
  }
};

/**
 * Check for new AI insights for a specific field
 */
export const checkFieldInsights = async (fieldId: string, userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('check-ai-insights', {
      body: { fieldId, userId }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error checking field insights:", error);
    throw error;
  }
};

/**
 * Process a field image to detect crop health issues
 */
export const scanCropImage = async (fieldId: string, imageUrl: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('crop-scan', {
      body: { fieldId, imageUrl }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error scanning crop image:", error);
    throw error;
  }
};

/**
 * Check if user is eligible for Pro
 */
export const checkProEligibility = async (userId: string) => {
  try {
    // Here we would call a Supabase function in production
    // For now, simulate API response
    return {
      isEligible: true,
      trialDaysLeft: 7,
      referralsCount: 2
    };
  } catch (error) {
    console.error("Error checking Pro eligibility:", error);
    throw error;
  }
};
