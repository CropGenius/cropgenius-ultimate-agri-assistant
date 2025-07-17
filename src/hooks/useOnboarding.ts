/**
 * Onboarding Hook
 * Custom hook for managing onboarding state and navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';
import { 
  getOnboardingStep, 
  updateOnboardingStep, 
  getOnboardingProgress,
  OnboardingStep,
  OnboardingProgress
} from '@/api/onboardingApi';

export const useOnboarding = () => {
  const { session, user } = useAuthContext();
  const queryClient = useQueryClient();
  const [currentStepId, setCurrentStepId] = useState<number>(1);
  
  // Get onboarding progress
  const {
    data: progressData,
    isLoading: isLoadingProgress,
    error: progressError,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ['onboarding', 'progress', user?.id],
    queryFn: () => getOnboardingProgress(user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
  
  // Get current step data
  const {
    data: stepData,
    isLoading: isLoadingStep,
    error: stepError,
    refetch: refetchStep
  } = useQuery({
    queryKey: ['onboarding', 'step', currentStepId, user?.id],
    queryFn: () => getOnboardingStep(currentStepId, user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
  
  // Update step data mutation
  const updateStepMutation = useMutation({
    mutationFn: (fieldValues: Record<string, any>) => 
      updateOnboardingStep(currentStepId, user?.id!, fieldValues),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Step updated successfully');
        queryClient.invalidateQueries({ queryKey: ['onboarding', 'step'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding', 'progress'] });
        
        // If next button is enabled, move to next step
        if (!data.data?.next_button_disabled) {
          // Check if this was the last step
          const progress = progressData?.data;
          if (progress && currentStepId >= progress.total_steps) {
            toast.success('Onboarding complete!');
          }
        }
      } else {
        if (data.details?.validation_errors) {
          toast.error('Please fix the validation errors');
        } else {
          toast.error(data.error || 'Failed to update step');
        }
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Failed to update step'}`);
    }
  });
  
  // Set current step based on progress
  useEffect(() => {
    if (progressData?.data) {
      setCurrentStepId(progressData.data.current_step);
    }
  }, [progressData]);
  
  // Navigate to a specific step
  const goToStep = useCallback((stepId: number) => {
    const progress = progressData?.data;
    
    // Only allow navigation to completed steps or the current step
    if (progress && (
      progress.completed_steps.includes(stepId) || 
      stepId === progress.current_step
    )) {
      setCurrentStepId(stepId);
    } else {
      toast.error('You cannot skip ahead in the onboarding process');
    }
  }, [progressData]);
  
  // Go to next step
  const goToNextStep = useCallback(() => {
    const step = stepData?.data;
    const progress = progressData?.data;
    
    if (!step || !progress) return;
    
    // Check if next button is disabled
    if (step.next_button_disabled) {
      toast.error('Please complete all required fields before continuing');
      return;
    }
    
    // Check if this is the last step
    if (currentStepId >= progress.total_steps) {
      toast.success('Onboarding complete!');
      return;
    }
    
    // Go to next step
    setCurrentStepId(currentStepId + 1);
  }, [currentStepId, stepData, progressData]);
  
  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStepId > 1) {
      setCurrentStepId(currentStepId - 1);
    }
  }, [currentStepId]);
  
  // Update field values
  const updateFields = useCallback((fieldValues: Record<string, any>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    updateStepMutation.mutate(fieldValues);
  }, [user, updateStepMutation]);
  
  // Check if a step is completed
  const isStepCompleted = useCallback((stepId: number) => {
    const progress = progressData?.data;
    return progress ? progress.completed_steps.includes(stepId) : false;
  }, [progressData]);
  
  // Refresh data
  const refreshData = useCallback(() => {
    refetchProgress();
    refetchStep();
  }, [refetchProgress, refetchStep]);
  
  return {
    // Step data
    currentStepId,
    step: stepData?.data,
    isLoadingStep,
    stepError,
    
    // Progress data
    progress: progressData?.data,
    isLoadingProgress,
    progressError,
    
    // Navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isStepCompleted,
    
    // Field updates
    updateFields,
    isUpdating: updateStepMutation.isPending,
    validationErrors: stepData?.details?.validation_errors,
    
    // Refresh
    refreshData
  };
};