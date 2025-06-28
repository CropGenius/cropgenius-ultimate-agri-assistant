import { supabase } from '@/lib/supabase';
import { OnboardingData, OnboardingResponse } from '@/types/onboarding';

/**
 * Validates the onboarding data before submission
 */
const validateOnboardingData = (data: Partial<OnboardingData>): string | null => {
  if (!data.farmName?.trim()) {
    return 'Farm name is required';
  }
  
  if (!data.crops?.length) {
    return 'At least one crop is required';
  }
  
  if (data.totalArea && (isNaN(Number(data.totalArea)) || Number(data.totalArea) <= 0)) {
    return 'Total area must be a positive number';
  }
  
  return null;
};

/**
 * Normalizes the crops data to ensure it's in the correct format
 */
const normalizeCrops = (crops: any): string[] => {
  if (!crops) return [];
  
  // If it's already an array of strings, return it
  if (Array.isArray(crops) && crops.every(item => typeof item === 'string')) {
    return crops;
  }
  
  // If it's a string, try to parse it as JSON or split by comma
  if (typeof crops === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(crops);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
      return [String(parsed)];
    } catch (e) {
      // If not valid JSON, try splitting by comma
      return crops.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }
  
  // If it's a single value, wrap it in an array
  return [String(crops)];
};

/**
 * Normalizes a date to ISO string format
 */
const normalizeDate = (date: Date | string | null | undefined, fallback: Date): string => {
  if (!date) return fallback.toISOString();
  const dateObj = date instanceof Date ? date : new Date(date);
  return isNaN(dateObj.getTime()) ? fallback.toISOString() : dateObj.toISOString();
};

export const completeOnboarding = async (data: OnboardingData): Promise<OnboardingResponse> => {
  
  try {
    // Validate required fields
    const validationError = validateOnboardingData(data);
    if (validationError) {
      throw { 
        message: validationError, 
        code: 'VALIDATION_ERROR',
        details: 'Invalid form data'
      };
    }

    // Normalize and prepare the payload
    const now = new Date();
    const defaultHarvestDate = new Date();
    defaultHarvestDate.setDate(now.getDate() + 120); // 120 days from now
    
    const normalizedCrops = normalizeCrops(data.crops);
    
    // Postgres expects array literals in the form "{item1,item2}" for text[] inputs
    const postgresArrayLiteral = `{${normalizedCrops.join(',')}}`;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw {
        message: 'User not authenticated',
        code: 'AUTH_ERROR',
        details: 'Cannot complete onboarding without a logged-in user'
      };
    }

    const payload = {
      farm_name: data.farmName.trim(),
      total_area: Number(data.totalArea) || 1,
      crops: postgresArrayLiteral, // Proper array literal to satisfy RPC expectations
      planting_date: normalizeDate(data.plantingDate, now),
      harvest_date: normalizeDate(data.harvestDate, defaultHarvestDate),
      primary_goal: data.primaryGoal || 'increase_yield',
      primary_pain_point: data.primaryPainPoint || 'pests',
      has_irrigation: Boolean(data.hasIrrigation),
      has_machinery: Boolean(data.hasMachinery),
      has_soil_test: Boolean(data.hasSoilTest),
      budget_band: data.budgetBand || 'medium',
      preferred_language: data.preferredLanguage || 'en',
      whatsapp_number: data.whatsappNumber?.trim() || null,
    };

    console.debug('Sending onboarding payload:', payload);

    // Make the RPC call
    const { data: response, error } = await supabase.rpc('complete_onboarding', payload);

    if (error) {
      console.error('RPC Error:', error);
      throw {
        message: error.message || 'Failed to complete onboarding',
        code: error.code || 'RPC_ERROR',
        details: error.details || 'An error occurred during the RPC call'
      };
    }

    // The RPC should return a JSON object with success, user_id, and farm_id
    if (!response || typeof response !== 'object' || !('success' in response)) {
      throw { 
        message: 'Invalid response from server', 
        code: 'INVALID_RESPONSE',
        details: 'The server returned an unexpected response format'
      };
    }

    // Type assertion to handle the response shape
    const result = response as { success: boolean; user_id?: string; farm_id?: string };
    
    if (!result.success) {
      throw {
        message: 'Failed to complete onboarding',
        code: 'ONBOARDING_FAILED',
        details: 'The server indicated that onboarding was not successful'
      };
    }

    return {
      success: true,
      message: 'Onboarding completed successfully',
      user_id: result.user_id || '',
      farm_id: result.farm_id || ''
    };
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    
    // If it's already an OnboardingError, just rethrow it
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    
    // Otherwise, create a new error object
    throw {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error instanceof Error ? error.stack : String(error)
    };
  }
};

// Add any additional onboarding-related functions here
export const onboardingService = {
  completeOnboarding,
};
