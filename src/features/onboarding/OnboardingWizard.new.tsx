import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingData } from '@/types/onboarding';

// Import step components
import StepOneFarmVitals from './steps/StepOneFarmVitals';
import StepTwoCropSeasons from './steps/StepTwoCropSeasons';
import StepThreeGoals from './steps/StepThreeGoals';
import StepFourResources from './steps/StepFourResources';
import StepFiveProfile from './steps/StepFiveProfile';
import StepSixGeniusPlan from './steps/StepSixGeniusPlan';

// Constants
const ONBOARDING_FORM_DATA_KEY = 'onboardingFormData';
const ONBOARDING_STEP_KEY = 'onboardingStep';

const STEPS = [
  { id: 'farm-vitals', component: StepOneFarmVitals },
  { id: 'crop-seasons', component: StepTwoCropSeasons },
  { id: 'goals', component: StepThreeGoals },
  { id: 'resources', component: StepFourResources },
  { id: 'profile', component: StepFiveProfile },
] as const;

type StepId = typeof STEPS[number]['id'];

const STEP_ORDER = STEPS.map(step => step.id);

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<StepId>(STEP_ORDER[0]);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const { completeOnboarding, isLoading } = useOnboarding();
  const navigate = useNavigate();

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(ONBOARDING_FORM_DATA_KEY);
      const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);

      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      
      if (savedStep && STEP_ORDER.includes(savedStep as StepId)) {
        setCurrentStep(savedStep as StepId);
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      clearOnboardingState();
    }
  }, []);

  const clearOnboardingState = useCallback(() => {
    localStorage.removeItem(ONBOARDING_FORM_DATA_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
  }, []);

  const goToNextStep = useCallback((data: Partial<OnboardingData>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    // Save to localStorage
    localStorage.setItem(ONBOARDING_FORM_DATA_KEY, JSON.stringify(newFormData));

    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      setCurrentStep(nextStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, nextStep);
    } else {
      setIsFinishing(true);
    }
  }, [currentStep, formData]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = STEP_ORDER[currentIndex - 1];
      setCurrentStep(prevStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, prevStep);
    }
  }, [currentStep]);

  const handleFinalSubmit = useCallback(async () => {
    if (isLoading) return;

    try {
      // Prepare the final data
      const finalData: OnboardingData = {
        farmName: formData.farmName || 'My Farm',
        totalArea: Number(formData.totalArea) || 1,
        crops: Array.isArray(formData.crops) 
          ? formData.crops.map(String) 
          : formData.crops 
            ? [String(formData.crops)] 
            : ['Maize'],
        plantingDate: formData.plantingDate ? new Date(formData.plantingDate) : new Date(),
        harvestDate: formData.harvestDate 
          ? new Date(formData.harvestDate) 
          : new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        primaryGoal: formData.primaryGoal || 'increase_yield',
        primaryPainPoint: formData.primaryPainPoint || 'pests',
        hasIrrigation: Boolean(formData.hasIrrigation),
        hasMachinery: Boolean(formData.hasMachinery),
        hasSoilTest: Boolean(formData.hasSoilTest),
        budgetBand: formData.budgetBand || 'medium',
        preferredLanguage: formData.preferredLanguage || 'en',
        whatsappNumber: formData.whatsappNumber || undefined,
      };

      // Submit the data
      const success = await completeOnboarding(finalData);
      
      if (success) {
        // Clear state and redirect on success
        clearOnboardingState();
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error in onboarding submission:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  }, [formData, completeOnboarding, isLoading, navigate, clearOnboardingState]);

  // Get current step component
  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component;
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / (STEP_ORDER.length + 1)) * 100;

  // Render the final step if finishing
  if (isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-2xl">
          <StepSixGeniusPlan 
            onFinish={handleFinalSubmit} 
            formData={formData}
            isLoading={isLoading}
            onBack={() => {
              setIsFinishing(false);
              setCurrentStep(STEP_ORDER[STEP_ORDER.length - 1]);
            }}
          />
        </div>
      </div>
    );
  }

  // Render the current step
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Current step content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <AnimatePresence mode="wait">
            {CurrentStepComponent && (
              <CurrentStepComponent 
                key={currentStep}
                onNext={goToNextStep}
                onBack={currentStepIndex > 0 ? goToPreviousStep : undefined}
                defaultValues={formData}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Step indicator */}
        <div className="text-center text-sm text-gray-500">
          Step {currentStepIndex + 1} of {STEP_ORDER.length}
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
