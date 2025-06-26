import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { onboardingService } from '@/services/onboardingService';
import { OnboardingData, OnboardingResponse } from '@/types/onboarding';
import { useAuth } from '@/context/AuthContext';

interface OnboardingError {
  message: string;
  code?: string;
  details?: string;
}

export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onboardingService.completeOnboarding(data, user?.id || '');
      
      if (result.success) {
        toast.success('Onboarding completed successfully!');
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 1500);
        return true;
      }
      
      throw {
        message: 'Failed to complete onboarding',
        code: 'ONBOARDING_FAILED',
        details: 'The server indicated that onboarding was not successful'
      } as OnboardingError;
    } catch (err) {
      console.error('Onboarding error:', err);
      
      const errorMessage = err.message || 'An error occurred during onboarding';
      setError({
        message: errorMessage,
        code: err.code,
        details: err.details
      });
      
      toast.error(errorMessage, {
        description: err.details || 'Please try again',
        duration: 5000,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return {
    completeOnboarding,
    isLoading,
    error,
  };
};
