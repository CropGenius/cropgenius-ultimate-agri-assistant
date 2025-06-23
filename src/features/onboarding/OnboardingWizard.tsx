import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/context/AuthContext';
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import StepOneFarmVitals from './steps/StepOneFarmVitals';
import StepTwoCropSeasons from './steps/StepTwoCropSeasons';
import StepThreeGoals from './steps/StepThreeGoals';
import StepFourResources from './steps/StepFourResources';
import StepFiveProfile from './steps/StepFiveProfile';
import StepSixGeniusPlan from './steps/StepSixGeniusPlan';

type StepOneProps = React.ComponentProps<typeof StepOneFarmVitals>;
type StepTwoProps = React.ComponentProps<typeof StepTwoCropSeasons>;
type StepThreeProps = React.ComponentProps<typeof StepThreeGoals>;
type StepFourProps = React.ComponentProps<typeof StepFourResources>;
type StepFiveProps = React.ComponentProps<typeof StepFiveProfile>;
type StepSixProps = React.ComponentProps<typeof StepSixGeniusPlan>;

type StepComponentProps = StepOneProps | StepTwoProps | StepThreeProps | StepFourProps | StepFiveProps | StepSixProps;
type StepComponent = React.FC<StepComponentProps & {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isLastStep: boolean;
  // Optional props used by the final Genius Plan step
  onFinish?: () => Promise<void>;
  isLoading?: boolean;
}>;

const ONBOARDING_FORM_DATA_KEY = 'onboardingFormData';
const ONBOARDING_STEP_KEY = 'onboardingStep';

const steps: { id: number; component: StepComponent }[] = [
  { id: 1, component: StepOneFarmVitals as unknown as StepComponent },
  { id: 2, component: StepTwoCropSeasons as unknown as StepComponent },
  { id: 3, component: StepThreeGoals as unknown as StepComponent },
  { id: 4, component: StepFourResources as unknown as StepComponent },
  { id: 5, component: StepFiveProfile as unknown as StepComponent },
  { id: 6, component: StepSixGeniusPlan as unknown as StepComponent },
];

export function OnboardingWizard() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  
  // Load saved form data and step from localStorage on mount
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem(ONBOARDING_FORM_DATA_KEY);
      const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);

      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          
          // Ensure required fields have defaults
          const withDefaults = {
            farmName: '',
            totalArea: 1,
            crops: [],
            primaryGoal: 'increase_yield',
            hasIrrigation: false,
            hasMachinery: false,
            hasSoilTest: false,
            budgetBand: 'medium',
            preferredLanguage: 'en',
            whatsappNumber: '',
            ...parsedData
          };
          
          setFormData(withDefaults);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
          // Clear corrupted data
          localStorage.removeItem(ONBOARDING_FORM_DATA_KEY);
        }
      }

      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= steps.length) {
          setStep(stepNum);
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  const handleNext = useCallback((data: Partial<OnboardingData>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    localStorage.setItem(ONBOARDING_FORM_DATA_KEY, JSON.stringify(newFormData));

    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString());
      
      // Scroll to top when navigating to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formData, step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, prevStep.toString());
      setSubmitError(null);
      
      // Scroll to top when going back
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting || !user?.id) {
      toast.error('Please sign in to continue');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the submission data with proper types
      const submissionData: OnboardingData = {
        ...formData,
        farmName: formData.farmName || 'My Farm',
        totalArea: Number(formData.totalArea) || 1,
        crops: formData.crops || [],
        primaryGoal: formData.primaryGoal || 'increase_yield',
        primaryPainPoint: formData.primaryPainPoint || 'pests',
        hasIrrigation: Boolean(formData.hasIrrigation),
        hasMachinery: Boolean(formData.hasMachinery),
        hasSoilTest: Boolean(formData.hasSoilTest),
        budgetBand: formData.budgetBand || 'medium',
        preferredLanguage: formData.preferredLanguage || 'en',
        whatsappNumber: formData.whatsappNumber || '',
        plantingDate: formData.plantingDate || new Date(),
        harvestDate: formData.harvestDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      };

      console.log('Submitting onboarding data:', submissionData);

      // Call the onboarding service
      const result = await completeOnboarding(submissionData);
      
      console.log('Onboarding completed successfully:', result);
      
      // Refresh user profile to get updated onboarding status
      if (refreshProfile) {
        await refreshProfile();
      }
      
      // Clear form data from localStorage
      localStorage.removeItem(ONBOARDING_FORM_DATA_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
      
      // Show success message
      toast.success('Onboarding completed successfully!');
      
      // Navigate to dashboard after a short delay to show success state
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error in onboarding submission:', error);
      const errorMessage = error?.message || 'An unknown error occurred';
      const errorDetails = error?.details || error?.toString() || 'No additional details';
      
      console.error('Error details:', errorDetails);
      setSubmitError(`Error: ${errorMessage}`);
      
      toast.error(`Failed to save: ${errorMessage}`, {
        description: errorDetails,
        duration: 5000,
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user?.id, navigate, refreshProfile, completeOnboarding, isSubmitting]);

  // Get the current step component
  const CurrentStep = steps[step - 1]?.component;

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Preparing Your Farm Genius Plan</h2>
          <p className="text-gray-600 max-w-md">We're analyzing your farm details to create a personalized plan. This may take a moment...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-6">
            {submitError}
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => setSubmitError(null)}
              className="w-full"
              variant="outline"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show the current step
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {step} of {steps.length}</span>
            <span>{Math.round((step / steps.length) * 100)}% Complete</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {(() => {
              const StepComponent = steps[step - 1]?.component;
              if (!StepComponent) return null;

              // If this is the final step (Genius Plan), provide onFinish and loading state
              const isFinalStep = step === steps.length;

              return (
                <StepComponent
                  {...formData as any}
                  // Generic wizard props
                  onNext={handleNext}
                  onBack={handleBack}
                  isLastStep={isFinalStep}
                  // Finalize props – StepSixGeniusPlan will pick these up if available
                  {...(isFinalStep ? { onFinish: handleFinalSubmit, isLoading: isSubmitting } : {})}
                />
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Provide default export for compatibility with older imports
export default OnboardingWizard;
