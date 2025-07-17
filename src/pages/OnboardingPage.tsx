/**
 * OnboardingPage Component
 * Main page for user onboarding process
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuthContext();
  const {
    currentStepId,
    step,
    isLoadingStep,
    stepError,
    progress,
    isLoadingProgress,
    progressError,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isStepCompleted,
    updateFields,
    isUpdating,
    validationErrors,
    refreshData
  } = useOnboarding();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, isLoadingAuth, navigate]);
  
  // Redirect to home if onboarding is complete
  useEffect(() => {
    if (progress && currentStepId > progress.total_steps) {
      navigate('/', { replace: true });
    }
  }, [progress, currentStepId, navigate]);
  
  // Handle errors
  if (stepError || progressError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="font-medium text-destructive">Error loading onboarding data</p>
          </div>
          <p className="text-sm text-destructive/80 mt-1">
            {stepError instanceof Error ? stepError.message : 
             progressError instanceof Error ? progressError.message : 
             'An unknown error occurred'}
          </p>
          <Button 
            onClick={refreshData}
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to CropGenius</h1>
        
        <OnboardingProgress
          progress={progress?.data}
          isLoading={isLoadingProgress}
          onStepClick={goToStep}
        />
      </div>
      
      <OnboardingStep
        step={step?.data!}
        isLoading={isLoadingStep}
        isUpdating={isUpdating}
        validationErrors={validationErrors}
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
        onUpdate={updateFields}
        isFirstStep={currentStepId === 1}
        isLastStep={progress?.data ? currentStepId === progress.data.total_steps : false}
      />
    </div>
  );
};

export default OnboardingPage;