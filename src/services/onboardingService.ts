import { supabase } from '@/lib/supabase';
import { OnboardingData, OnboardingResponse, OnboardingError } from '@/types/onboarding';

export const completeOnboarding = async (data: OnboardingData): Promise<OnboardingResponse> => {
  try {
    // Validate required fields
    if (!data.farmName?.trim()) {
      throw { message: 'Farm name is required', code: 'VALIDATION_ERROR' };
    }
    
    if (!data.crops?.length) {
      throw { message: 'At least one crop is required', code: 'VALIDATION_ERROR' };
    }

    // Prepare the payload
    const payload = {
      farm_name: data.farmName.trim(),
      total_area: Number(data.totalArea) || 1,
      crops: data.crops,
      planting_date: (() => {
        if (!data.plantingDate) return new Date().toISOString();
        const dateVal = typeof data.plantingDate === 'string' ? new Date(data.plantingDate) : data.plantingDate;
        return dateVal.toISOString();
      })(),
      harvest_date: (() => {
        if (!data.harvestDate) {
          return new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString();
        }
        const dateVal = typeof data.harvestDate === 'string' ? new Date(data.harvestDate) : data.harvestDate;
        return dateVal.toISOString();
      })(),
      primary_goal: data.primaryGoal || 'increase_yield',
      primary_pain_point: data.primaryPainPoint || 'pests',
      has_irrigation: Boolean(data.hasIrrigation),
      has_machinery: Boolean(data.hasMachinery),
      has_soil_test: Boolean(data.hasSoilTest),
      budget_band: data.budgetBand || 'medium',
      preferred_language: data.preferredLanguage || 'en',
      whatsapp_number: data.whatsappNumber?.trim() || null,
    };

    // Log the payload for debugging (remove in production)
    console.debug('Sending onboarding payload:', JSON.stringify(payload, null, 2));

    // Make the RPC call
    const { data: response, error } = await supabase
      .rpc('complete_onboarding', payload)
      .select()
      .single();

    if (error) {
      console.error('RPC Error:', error);
      throw {
        message: error.message || 'Failed to complete onboarding',
        code: error.code,
        details: error.details
      };
    }

    // Ensure we got a valid response
    if (!response) {
      throw { message: 'No response received from server', code: 'NO_RESPONSE' };
    }

    return {
      success: true,
      message: 'Onboarding completed successfully',
      user_id: response.user_id || '',
      farm_id: response.farm_id || ''
    };
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    throw {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details
    };
  }
};

// Add any additional onboarding-related functions here
export const onboardingService = {
  completeOnboarding,
};
