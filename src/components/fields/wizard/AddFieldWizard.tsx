import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, MapPin, ArrowRight, Circle, CheckCircle, Sparkles, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { Field } from '@/types/field';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import FieldMapperStep from './steps/FieldMapperStep';
import { sanitizeFieldData, isOnline } from '@/utils/fieldSanitizer';
import { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useCreateField } from '@/features/fields/hooks/useCreateField';

interface AddFieldWizardProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: { lat: number; lng: number };
}

export default function AddFieldWizard({ onSuccess, onCancel, defaultLocation }: AddFieldWizardProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('AddFieldWizard');
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [farmContext, setFarmContext] = useState<{ id: string; name: string } | null>(null);
  const [fieldData, setFieldData] = useState({
    name: '',
    boundary: null,
    location: defaultLocation || null,
    size: undefined as number | undefined,
    size_unit: 'hectares',
    crop_type: '',
    planting_date: null as Date | null,
    soil_type: '',
    irrigation_type: '',
    location_description: '',
  });
  
  // Progress steps
  const totalSteps = 6; // Increased to 6 to include field mapper step
  
  // Use the mutation hook
  const { mutate: createField, isPending: isSubmitting } = useCreateField();
  
  // Get farm context - but NEVER block the flow
  useEffect(() => {
    const loadFarmContext = async () => {
      try {
        setIsLoading(true);
        
        // If no user is logged in yet, don't block
        if (!user?.id) {
          console.log("⚠️ [AddFieldWizard] No user authenticated yet. Proceeding anyway.");
          setIsLoading(false);
          return;
        }
        
        // Get user's farms
        const { data: farms, error } = await supabase
          .from('farms')
          .select('id, name')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("❌ [AddFieldWizard] Error fetching farms:", error);
          // Don't block, show warning toast
          toast.warning("Some information couldn't be loaded", { 
            description: "You can continue adding your field" 
          });
        }
        
        // Try to use the selected farm
        if (farms && farms.some(farm => farm.id === farms[0].id)) {
          const selectedFarm = farms.find(farm => farm.id === farms[0].id);
          setFarmContext(selectedFarm || null);
          console.log("✅ [AddFieldWizard] Using selected farm:", selectedFarm);
        } 
        // Or use the first available farm
        else if (farms && farms.length > 0) {
          setFarmContext(farms[0]);
          console.log("⚠️ [AddFieldWizard] Selected farm not found. Using first farm:", farms[0]);
          
          // Show info toast
          toast.info("Using default farm", {
            description: `Your field will be added to "${farms[0].name}"`,
          });
        }
        // If no farms exist, create a default one
        else if (user.id) {
          try {
            const { data: newFarm, error } = await supabase
              .from('farms')
              .insert({
                name: 'My Farm',
                user_id: user.id
              })
              .select()
              .single();
              
            if (error) throw error;
            
            setFarmContext(newFarm);
            console.log("✅ [AddFieldWizard] Created default farm:", newFarm);
            
            // Show success toast
            toast.success("Default farm created", {
              description: "Your field will be added to 'My Farm'",
            });
          } catch (err) {
            console.error("❌ [AddFieldWizard] Error creating default farm:", err);
            // Don't block the flow
          }
        }
      } catch (error) {
        // Log but never block
        console.error("❌ [AddFieldWizard] Error in farm context:", error);
        logError(error as Error, { context: 'farmContextLoading' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFarmContext();
  }, [user?.id, logError]);
  
  const updateFieldData = (partialData: Partial<typeof fieldData>) => {
    setFieldData(prev => ({ ...prev, ...partialData }));
  };
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      
      // Play a subtle success sound
      try {
        const audio = new Audio('data:audio/wav;base64,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');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play prevented by browser'));
      } catch (error) {
        console.log('Audio playback not supported');
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    handleNext();
  };
  
  const handleSubmit = () => {
    if (!farmContext?.id) {
      toast.error("No farm selected", { description: "Cannot create a field without a farm." });
      return;
    }
    
    // The useCreateField hook handles the rest (user, etc.)
    createField({
        ...fieldData,
      farm_id: farmContext.id,
    }, {
      onSuccess: (createdField) => {
        if (onSuccess) {
          onSuccess(createdField);
        }
        navigate(`/fields/${createdField.id}`);
      },
    });
  };
  
  // Function to create confetti effect
  const createConfetti = () => {
    const container = document.querySelector('.dialog-content');
    if (!container) return;
    
    const colors = ['#26de81', '#fd9644', '#a55eea', '#778ca3', '#2e86de'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 30}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      container.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }
  };
  
  // Animation variants for page transitions
  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };
  
  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Preparing field creation...</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <motion.div 
              key={idx}
              className={`rounded-full ${idx < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} 
                         ${idx === currentStep - 1 ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}
              initial={{ scale: idx === currentStep - 1 ? 0.8 : 1 }}
              animate={{ scale: idx === currentStep - 1 ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        
        {/* Current step indicator text */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Step {currentStep}</span> of {totalSteps}
        </div>
        
        {/* Farm context indicator */}
        {farmContext && (
          <div className="text-center text-xs text-muted-foreground">
            Adding field to farm: <span className="font-medium">{farmContext.name}</span>
          </div>
        )}
        
        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-[30vh]"
          >
            {currentStep === 1 && (
              <StepOne 
                fieldName={fieldData.name}
                onFieldNameChange={(name) => updateFieldData({ name })}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 2 && (
              <FieldMapperStep 
                defaultLocation={fieldData.location || undefined}
                initialBoundary={fieldData.boundary}
                initialName={fieldData.name}
                onNext={(data) => {
                  updateFieldData({ 
                    boundary: data.boundary,
                    location: data.location,
                    name: data.name || fieldData.name
                  });
                  handleNext();
                }}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}
            
            {currentStep === 3 && (
              <StepTwo
                location={fieldData.location}
                boundary={fieldData.boundary}
                onLocationChange={(location) => updateFieldData({ location })}
                onBoundaryChange={(boundary) => updateFieldData({ boundary })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}
            
            {currentStep === 4 && (
              <StepThree 
                cropType={fieldData.crop_type}
                onCropTypeChange={(crop_type) => updateFieldData({ crop_type })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}
            
            {currentStep === 5 && (
              <StepFour
                size={fieldData.size}
                sizeUnit={fieldData.size_unit}
                onSizeChange={(size) => updateFieldData({ size })}
                onSizeUnitChange={(size_unit) => updateFieldData({ size_unit })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}
            
            {currentStep === 6 && (
              <StepFive
                plantingDate={fieldData.planting_date}
                onPlantingDateChange={(planting_date) => updateFieldData({ planting_date })}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onSkip={() => handleSubmit()}
              />
            )}
            
            {currentStep === totalSteps + 1 && (
              <motion.div 
                className="text-center py-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <motion.div 
                  className="mx-auto w-16 h-16 mb-4 bg-primary/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-muted-foreground">
                  Your field has been added successfully.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
