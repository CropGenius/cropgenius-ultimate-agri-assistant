import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StepOneFarmVitals from './steps/StepOneFarmVitals';
import StepTwoCropSeasons from './steps/StepTwoCropSeasons';
import StepThreeGoals from './steps/StepThreeGoals';
import StepFourResources from './steps/StepFourResources';
import StepFiveProfile from './steps/StepFiveProfile';
import StepSixGeniusPlan from './steps/StepSixGeniusPlan';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const ONBOARDING_FORM_DATA_KEY = 'onboardingFormData';
const ONBOARDING_STEP_KEY = 'onboardingStep';

const steps = [
  { id: 1, component: StepOneFarmVitals },
  { id: 2, component: StepTwoCropSeasons },
  { id: 3, component: StepThreeGoals },
  { id: 4, component: StepFourResources },
  { id: 5, component: StepFiveProfile },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(ONBOARDING_FORM_DATA_KEY);
      const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);

      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      if (savedStep) {
        const parsedStep = parseInt(savedStep, 10);
        if (parsedStep > steps.length) {
          setIsFinishing(true);
        } else {
          setStep(parsedStep);
        }
      }
    } catch (error) {
      console.error("Failed to load onboarding state from localStorage", error);
      localStorage.removeItem(ONBOARDING_FORM_DATA_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
  }, []);

  const handleNext = useCallback((data: any) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    localStorage.setItem(ONBOARDING_FORM_DATA_KEY, JSON.stringify(newFormData));

    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString());
    } else {
      setIsFinishing(true);
      localStorage.setItem(ONBOARDING_STEP_KEY, (steps.length + 1).toString());
    }
  }, [formData, step]);

  const handleFinalSubmit = useCallback(async () => {
    console.log('Final onboarding data:', formData);
    try {
      const { error } = await supabase.rpc('complete_onboarding', {
        farm_name: formData.farmName,
        total_area: formData.totalArea,
        crops: formData.crops,
        planting_date: formData.plantingDate,
        harvest_date: formData.harvestDate,
        primary_goal: formData.primaryGoal,
        primary_pain_point: formData.primaryPainPoint,
        has_irrigation: formData.hasIrrigation,
        has_machinery: formData.hasMachinery,
        has_soil_test: formData.hasSoilTest,
        budget_band: formData.budgetBand,
        preferred_language: formData.preferredLanguage,
        whatsapp_number: formData.whatsappNumber,
      });

      if (error) throw error;

      toast.success("Welcome to CropGenius! Your plan is ready.");
      localStorage.removeItem(ONBOARDING_FORM_DATA_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
      
      await refreshProfile();
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(`Onboarding failed: ${error.message}. Please try again or contact support.`);
    }
  }, [formData, navigate, refreshProfile]);

  const CurrentStepComponent = steps.find((s) => s.id === step)?.component;

  if (isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <StepSixGeniusPlan onFinish={handleFinalSubmit} formData={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {CurrentStepComponent && <CurrentStepComponent key={step} onNext={handleNext} defaultValues={formData} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
