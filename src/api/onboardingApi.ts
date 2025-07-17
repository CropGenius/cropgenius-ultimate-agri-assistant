/**
 * Onboarding API
 * Handles API requests for user onboarding
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponseHandler } from '@/utils/apiResponse';
import { handleSupabaseResponse } from '@/utils/supabaseResponseHandler';

/**
 * Interface for onboarding step data
 */
export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  fields: OnboardingField[];
  next_button_disabled: boolean;
  validation_errors?: Record<string, string>;
}

/**
 * Interface for onboarding field data
 */
export interface OnboardingField {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'date' | 'location';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  value?: any;
  error?: string;
}

/**
 * Interface for onboarding progress data
 */
export interface OnboardingProgress {
  current_step: number;
  total_steps: number;
  completed_steps: number[];
  user_id: string;
}

/**
 * Get onboarding step data
 * @param stepId The step ID to fetch
 * @param userId The user ID
 */
export const getOnboardingStep = async (
  stepId: number,
  userId: string
): Promise<{ success: boolean; data?: OnboardingStep; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!stepId || stepId < 1) {
      return ApiResponseHandler.error('Invalid step ID', 400);
    }
    
    if (!userId) {
      return ApiResponseHandler.error('User ID is required', 400);
    }
    
    // Get onboarding step from database
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('id', stepId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponseHandler.error(`Onboarding step ${stepId} not found`, 404);
      }
      return ApiResponseHandler.error(`Failed to fetch onboarding step: ${error.message}`, 500);
    }
    
    if (!data) {
      return ApiResponseHandler.error(`Onboarding step ${stepId} not found`, 404);
    }
    
    // Get user's progress
    const { data: progressData, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get field values from user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Determine if next button should be disabled
    let nextButtonDisabled = false;
    
    // If this is beyond the user's current step, disable next button
    if (progressData && stepId > progressData.current_step) {
      nextButtonDisabled = true;
    }
    
    // If required fields are missing values, disable next button
    if (data.fields) {
      const requiredFields = data.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => {
        const fieldValue = userData?.[field.id];
        return fieldValue === undefined || fieldValue === null || fieldValue === '';
      });
      
      if (missingFields.length > 0) {
        nextButtonDisabled = true;
      }
    }
    
    // Prepare response
    const step: OnboardingStep = {
      ...data,
      next_button_disabled: nextButtonDisabled
    };
    
    // If user data exists, populate field values
    if (userData) {
      step.fields = step.fields.map(field => ({
        ...field,
        value: userData[field.id] !== undefined ? userData[field.id] : field.value
      }));
    }
    
    return ApiResponseHandler.success(step);
  } catch (error) {
    console.error('Error in getOnboardingStep:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Update onboarding step data
 * @param stepId The step ID to update
 * @param userId The user ID
 * @param fieldValues The field values to update
 */
export const updateOnboardingStep = async (
  stepId: number,
  userId: string,
  fieldValues: Record<string, any>
): Promise<{ success: boolean; data?: OnboardingStep; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!stepId || stepId < 1) {
      return ApiResponseHandler.error('Invalid step ID', 400);
    }
    
    if (!userId) {
      return ApiResponseHandler.error('User ID is required', 400);
    }
    
    if (!fieldValues || Object.keys(fieldValues).length === 0) {
      return ApiResponseHandler.error('No field values provided', 400);
    }
    
    // Get onboarding step to validate fields
    const { data: stepData, error: stepError } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('id', stepId)
      .single();
    
    if (stepError) {
      if (stepError.code === 'PGRST116') {
        return ApiResponseHandler.error(`Onboarding step ${stepId} not found`, 404);
      }
      return ApiResponseHandler.error(`Failed to fetch onboarding step: ${stepError.message}`, 500);
    }
    
    // Validate field values
    const validationErrors: Record<string, string> = {};
    
    stepData.fields.forEach(field => {
      const value = fieldValues[field.id];
      
      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        validationErrors[field.id] = 'This field is required';
      }
      
      // Additional validation based on field type
      switch (field.type) {
        case 'text':
          // Validate text fields (e.g., email format)
          if (field.id === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            validationErrors[field.id] = 'Invalid email format';
          }
          break;
          
        case 'date':
          // Validate date fields
          if (value && isNaN(Date.parse(value))) {
            validationErrors[field.id] = 'Invalid date format';
          }
          break;
          
        case 'location':
          // Validate location fields
          if (value && (!value.lat || !value.lng)) {
            validationErrors[field.id] = 'Invalid location format';
          }
          break;
      }
    });
    
    // If validation errors exist, return them
    if (Object.keys(validationErrors).length > 0) {
      return ApiResponseHandler.error('Validation failed', 400, {
        validation_errors: validationErrors
      });
    }
    
    // Update user profile with field values
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update(fieldValues)
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      return ApiResponseHandler.error(`Failed to update profile: ${updateError.message}`, 500);
    }
    
    // Update onboarding progress
    const { data: progressData, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error fetching onboarding progress:', progressError);
    }
    
    // If progress exists, update it
    if (progressData) {
      // Add this step to completed steps if not already there
      const completedSteps = progressData.completed_steps || [];
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }
      
      // Update current step if this is the current step
      const currentStep = progressData.current_step === stepId
        ? stepId + 1
        : progressData.current_step;
      
      await supabase
        .from('onboarding_progress')
        .update({
          completed_steps: completedSteps,
          current_step: currentStep
        })
        .eq('user_id', userId);
    } else {
      // Create new progress record
      await supabase
        .from('onboarding_progress')
        .insert({
          user_id: userId,
          current_step: stepId + 1,
          completed_steps: [stepId],
          total_steps: 6 // Hardcoded for now, could be dynamic
        });
    }
    
    // Get updated step data
    return getOnboardingStep(stepId, userId);
  } catch (error) {
    console.error('Error in updateOnboardingStep:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Get onboarding progress
 * @param userId The user ID
 */
export const getOnboardingProgress = async (
  userId: string
): Promise<{ success: boolean; data?: OnboardingProgress; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!userId) {
      return ApiResponseHandler.error('User ID is required', 400);
    }
    
    // Get onboarding progress from database
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No progress found, return default progress
        return ApiResponseHandler.success({
          current_step: 1,
          total_steps: 6, // Hardcoded for now, could be dynamic
          completed_steps: [],
          user_id: userId
        });
      }
      
      return ApiResponseHandler.error(`Failed to fetch onboarding progress: ${error.message}`, 500);
    }
    
    return ApiResponseHandler.success(data);
  } catch (error) {
    console.error('Error in getOnboardingProgress:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};