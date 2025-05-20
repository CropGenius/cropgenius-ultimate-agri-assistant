import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, MapPin, ArrowRight, Circle, CheckCircle, Sparkles, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { Field, Boundary, Coordinates } from '@/types/field';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import FieldMapperStep from './steps/FieldMapperStep';
import SoilIrrigationStep from './steps/SoilIrrigationStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';
import { sanitizeFieldData, isOnline } from '@/utils/fieldSanitizer';
import { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

interface AddFieldWizardProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: Coordinates;
}

// Type for tracking submission status
type SubmissionStatus = 'idle' | 'validating' | 'processing' | 'saving' | 'syncing' | 'success' | 'error';

// Define interface for field form data
interface FieldFormData {
  name: string;
  boundary: Boundary | null;
  location: Coordinates | null;
  size: number | undefined;
  size_unit: string;
  crop_type: string;
  planting_date: Date | null;
  soil_type: string;
  irrigation_type: string;
  location_description: string;
}

export default function AddFieldWizard({ onSuccess, onCancel, defaultLocation }: AddFieldWizardProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('AddFieldWizard');
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [farmContext, setFarmContext] = useState<{ id: string; name: string } | null>(null);
  
  // Form data state
  const [fieldData, setFieldData] = useState<FieldFormData>({
    name: '',
    boundary: null,
    location: defaultLocation || null,
    size: undefined,
    size_unit: 'hectares',
    crop_type: '', 
    planting_date: null,
    soil_type: '',
    irrigation_type: '',
    location_description: '',
  });
  
  // Submission tracking states
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionStatusMessage, setSubmissionStatusMessage] = useState<string | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  // Circuit breaker pattern
  const [circuitOpen, setCircuitOpen] = useState(false);
  const circuitResetTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Advanced rate limiting for API calls
  const lastApiCallRef = useRef<number>(0);
  const consecutiveCallsRef = useRef<number>(0);
  const API_RATE_LIMIT_MS = 1000; // Base minimum time between API calls
  const MAX_CONSECUTIVE_CALLS = 5; // Maximum number of consecutive calls before increasing delay
  const API_RATE_LIMIT_BACKOFF_FACTOR = 1.5; // Exponential backoff factor
  
  // Function to handle API rate limiting with adaptive throttling
  const getRateLimitDelay = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    
    // Reset consecutive calls counter if it's been a while since the last call
    if (timeSinceLastCall > API_RATE_LIMIT_MS * 5) {
      consecutiveCallsRef.current = 0;
      return 0;
    }
    
    // Increment consecutive calls counter
    consecutiveCallsRef.current++;
    
    // Calculate adaptive delay based on consecutive calls
    if (consecutiveCallsRef.current > MAX_CONSECUTIVE_CALLS) {
      const backoffFactor = Math.min(
        Math.pow(API_RATE_LIMIT_BACKOFF_FACTOR, consecutiveCallsRef.current - MAX_CONSECUTIVE_CALLS),
        10 // Cap at 10x normal rate limit
      );
      const adaptiveDelay = API_RATE_LIMIT_MS * backoffFactor - timeSinceLastCall;
      return Math.max(0, adaptiveDelay);
    }
    
    // Standard rate limiting
    return Math.max(0, API_RATE_LIMIT_MS - timeSinceLastCall);
  }, [])
  
  // Progress steps
  const totalSteps = 8; // Increased to 8 to include field mapper step
  
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
        if (farmId && farms && farms.some(farm => farm.id === farmId)) {
          const selectedFarm = farms.find(farm => farm.id === farmId);
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
        } else if (user.id) {
          try {
            const { data: newFarm, error } = await supabase
              .from('farms')
              .insert({
                name: 'My Farm',
                user_id: user.id,
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
  }, [user?.id, farmId, logError]);

  // State for tracking validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Network status tracking
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(isOnline());

  // Track network status
  useEffect(() => {
    const handleOnline = () => setIsNetworkAvailable(true);
    const handleOffline = () => setIsNetworkAvailable(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryWithBackoff = useCallback(<T,>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> => {
    // Internal execution function that handles retries recursively
    const execute = async (): Promise<T> => {
      // Track retry count for analytics
      if (retryCount > 0) {
        setRetryCount(retryCount + 1);
      }

      try {
        // Check if circuit breaker is open
        if (circuitOpen) {
          throw new Error("Circuit breaker is open. Using fallback method.");
        }

        // Apply adaptive rate limiting
        const waitTime = getRateLimitDelay();
        if (waitTime > 0) {
          // Log when significant throttling occurs
          if (waitTime > API_RATE_LIMIT_MS * 2) {
            console.warn(`🚦 [AddFieldWizard] Heavy throttling: Waiting ${Math.round(waitTime)}ms before API call`);
          }
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Update last API call time
        lastApiCallRef.current = Date.now();

        return await fn();
      } catch (error) {
        console.warn(`Retry attempt ${retryCount + 1}/${MAX_RETRIES} failed:`, error);
        
        // Increment retry count for next attempt
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        if (nextRetryCount >= MAX_RETRIES) {
          // Open circuit breaker if max retries reached
          setCircuitOpen(true);
          
          // Reset circuit breaker after 30 seconds
          circuitResetTimeout.current = setTimeout(() => {
            setCircuitOpen(false);
            setRetryCount(0);
          }, 30000);
          
          throw error; // Propagate error after max retries
        }
        
        // Calculate exponential backoff delay with jitter
        const delay = Math.min(
          1000 * Math.pow(2, nextRetryCount) + Math.random() * 1000,
          10000 // Maximum 10 second delay
        );
        
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try again recursively
        return execute();
      }
    };

    return execute();
  }, [MAX_RETRIES, circuitOpen, getRateLimitDelay, retryCount]);

  // Clean up circuit breaker timeout on unmount
  useEffect(() => {
    return () => {
      if (circuitResetTimeout.current) {
        clearTimeout(circuitResetTimeout.current);
      }
    };
  }, []);

  // Utility function to estimate area size from boundary coordinates
  const calculateAreaSize = useCallback((boundary: Boundary): number => {
    // Skip if not a polygon or if too few points
    if (boundary.type !== 'polygon' || boundary.coordinates.length < 3) {
      return 0;
    }

    try {
      // Simple implementation of the Shoelace formula to calculate polygon area
      let area = 0;
      const coords = boundary.coordinates;
      
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i].lat * coords[j].lng;
        area -= coords[j].lat * coords[i].lng;
      }
      
      // Convert to hectares (simplified - in a real app would use proper geo calculations)
      // This is a very simplified approximation and should be replaced with proper geospatial calculations
      const areaInSquareMeters = Math.abs(area) * 111319.9 * 111319.9 / 2;
      const areaInHectares = areaInSquareMeters / 10000;
      
      return Math.round(areaInHectares * 100) / 100; // Round to 2 decimal places
    } catch (e) {
      console.error('Error calculating field area:', e);
      return 0;
    }
  }, []);

  // Memoized field data update function to prevent unnecessary re-renders
  const updateFieldData = useCallback((partialData: Partial<FieldFormData>) => {
    setFieldData(prev => {
      const updated = { ...prev, ...partialData };

      // Clear validation errors for updated fields
      if (partialData) {
        const updatedFields = Object.keys(partialData);
        if (updatedFields.length > 0) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            updatedFields.forEach(field => {
              delete newErrors[field];
            });
            return newErrors;
          });
        }
      }

      return updated;
    });

    // Save progress to localStorage for recovery
    try {
      const saveTimer = setTimeout(() => {
        localStorage.setItem('cropgenius_field_progress', JSON.stringify({
          step: currentStep,
          data: fieldData,
          timestamp: new Date().toISOString(),
        }));
      }, 1000);

      return () => clearTimeout(saveTimer);
    } catch (e) {
      // Silent fail - not critical
      console.warn("Could not save field progress to localStorage", e);
    }
  }, [currentStep, fieldData]);

  // Validation function with step-specific rules
  const validateCurrentStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Step-specific validation rules
    switch (currentStep) {
      case 1: // Field name
        if (!fieldData.name.trim()) {
          errors.name = "Field name is required";
          isValid = false;
        } else if (fieldData.name.trim().length < 3) {
          errors.name = "Field name must be at least 3 characters";
          isValid = false;
        } else if (fieldData.name.trim().length > 50) {
          errors.name = "Field name must be less than 50 characters";
          isValid = false;
        }
        break;

      case 2: // Map/boundary
        // Field mapper has its own validation
        break;

      case 3: // Location validation
        if (!fieldData.location && !fieldData.boundary) {
          errors.location = "Please set a location or boundary for your field";
          isValid = false;
        }
        break;

      case 4: // Crop type
        // Optional, no validation required
        break;

      case 5: // Size
        if (fieldData.size !== undefined) {
          if (isNaN(fieldData.size) || fieldData.size <= 0) {
            errors.size = "Please enter a valid field size greater than zero";
            isValid = false;
          } else if (fieldData.size > 10000) {
            errors.size = "Field size seems unusually large. Please verify";
            isValid = false;
          }
        }
        break;

      case 6: // Planting date
        if (fieldData.planting_date !== null) {
          const date = new Date(fieldData.planting_date);
          if (isNaN(date.getTime())) {
            errors.planting_date = "Please enter a valid date";
            isValid = false;
          }
        }
        break;

      case 7: // Soil type & irrigation
        // Optional, no validation required
        break;
      case 8: // Review & Submit
        // No specific validation here, final check before submit
        break;
    }

    setValidationErrors(errors);
    return isValid;
  }, [currentStep, fieldData]);

  const handleNext = useCallback(() => {
    // Run validation for current step
    if (!validateCurrentStep()) {
      // Provide haptic feedback on mobile if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Show toast with first validation error
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error("Please fix the errors before proceeding", {
          description: firstError,
        });
      }
      return;
    }

    // Advance to next step
    setCurrentStep(prev => Math.min(prev + 1, totalSteps + 1));

    // Track analytics for step completion
    logSuccess(`completed_step_${currentStep}`, { fieldName: fieldData.name });
  }, [currentStep, validateCurrentStep, validationErrors, fieldData.name, logSuccess]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSkip = useCallback(() => {
    // Log skipped step for analytics
    logSuccess(`skipped_step_${currentStep}`, {});

    handleNext();
  }, [currentStep, handleNext, logSuccess]);

  // Placeholder for searchedLocation
  const searchedLocation: string | undefined = useMemo(() => {
    // Attempt to use a more descriptive name if available from earlier steps, e.g., geocoding result
    // For now, using location_description or a fallback.
    return fieldData.location_description || (fieldData.location ? `Lat: ${fieldData.location.lat.toFixed(4)}, Lng: ${fieldData.location.lng.toFixed(4)}` : undefined);
  }, [fieldData.location, fieldData.location_description]);

  // Main submission logic placeholder
  const handleSubmit = useCallback(async () => {
    if (!isOnline()) {
      toast.error("No internet connection. Cannot save field.");
      setSubmissionStatus('error');
      setSubmissionStatusMessage("Offline: Cannot connect to server.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    setSubmissionStatus('processing');
    setSubmissionProgress(30);
    toast.info("Submitting field data...");

    // Simulate API call and processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.2; // Simulate 80% success rate

    if (isSuccess) {
      setSubmissionProgress(100);
      const mockSubmittedField: Field = {
        ...sanitizeFieldData(fieldData),
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user?.id || 'default-user',
        farm_id: farmId || 'default-farm',
        // Ensure all required Field properties are here
        deleted: false,
      };
      toast.success(`Field '${fieldData.name}' submitted successfully (simulated).`);
      logSuccess('Field submission simulation successful');
      setSubmissionStatus('success');
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(mockSubmittedField);
      }
      setCurrentStep(prev => prev + 1); // Move to success/confirmation step
    } else {
      toast.error("Failed to submit field (simulated). Please try again.");
      logError('Field submission simulation failed', { fieldData });
      setSubmissionStatus('error');
      setSubmissionStatusMessage("A simulated error occurred during submission.");
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  }, [fieldData, farmId, user, onSuccess, logSuccess, logError, sanitizeFieldData, isOnline, setCurrentStep]);

  // This function is called by the ReviewSubmitStep's onSubmit prop
  const handleFinalSubmit = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // Placeholder for AI analysis function
  const handleAnalyzeField = useCallback(async () => {
    if (!isOnline()) {
      toast.error("No internet connection. AI analysis requires connectivity.");
      return;
    }
    toast.info("AI Field Analysis feature is not yet implemented (simulated).");
    // Example: Simulate an API call for analysis
    setIsSubmitting(true); // Use isSubmitting to show loading state on button if desired
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success("AI Analysis simulation complete. Insights would be shown here.");
  }, [fieldData, isOnline, setIsSubmitting]);

  const resetWizard = useCallback(() => {
    // Reset state
    setCurrentStep(1);
    setFieldData({
      name: '',
      boundary: null,
      location: defaultLocation || null,
      size: undefined,
      size_unit: 'hectares',
      crop_type: '', 
      planting_date: null,
      soil_type: '',
      irrigation_type: '',
      location_description: '',
    });
    setValidationErrors({});
    setIsSubmitting(false);
    setSubmissionStatus('idle');
    setSubmissionProgress(0);
    setRetryCount(0);
    setCircuitOpen(false);
    if (circuitResetTimeout.current) {
      clearTimeout(circuitResetTimeout.current);
    }
  }, [defaultLocation]);

  return (
    <ErrorBoundary>
      <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentStep === 1 && (
              <StepOne
                fieldName={fieldData.name}
                onChange={(name) => setFieldData({ ...fieldData, name })}
                error={validationErrors.name}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <StepTwo
                location={fieldData.location}
                defaultLocation={defaultLocation}
                boundary={fieldData.boundary}
                onChange={(location) => setFieldData({ ...fieldData, location })}
                onBoundaryChange={(boundary) => {
                  setFieldData(prev => ({
                    ...prev,
                    boundary,
                    // Auto-calculate field size based on boundary if available
                    size: boundary ? (prev.size || calculateAreaSize(boundary)) : prev.size
                  }));
                }}
                error={validationErrors.location}
                onNext={handleNext}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 3 && (
              <FieldMapperStep
                initialBoundary={fieldData.boundary}
                initialName={fieldData.name}
                centerCoordinates={fieldData.location}
                onChange={(data) => { 
                  setFieldData(prev => ({
                    ...prev,
                    boundary: data.boundary, // Assign data.boundary directly
                    location: data.location, // Assign data.location directly
                    name: data.name || prev.name, // Assign data.name or keep previous name
                    // Recalculate size if boundary is present and new or size not set
                    size: data.boundary ? calculateAreaSize(data.boundary) : prev.size 
                  }));
                  // Progression to next step is handled by FieldMapperStep's internal nav via onNext/onBack/onSkip
                }}
                error={validationErrors.boundary}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSkip={handleSkip} // Ensured onSkip is passed
              />
            )}

            {/* Step 4: Field Size and Unit (Using StepFour.tsx) */}
            {currentStep === 4 && (
              <StepFour
                size={fieldData.size}
                sizeUnit={fieldData.size_unit}
                onSizeChange={(value) => setFieldData({ ...fieldData, size: value })}
                onSizeUnitChange={(value) => setFieldData({ ...fieldData, size_unit: value })}
                error={validationErrors.size}
                onNext={handleNext}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSkip={handleSkip}
              />
            )}

            {/* Step 5: Crop Type and Planting Date (Using StepThree.tsx) */}
            {currentStep === 5 && (
              <StepThree
                name={fieldData.name} // StepThreeProps includes name
                size={fieldData.size} // StepThreeProps includes size
                sizeUnit={fieldData.size_unit} // StepThreeProps includes sizeUnit
                cropType={fieldData.crop_type}
                onChange={(key, value) => setFieldData({ ...fieldData, [key]: value })}
                onBulkChange={(changes) => setFieldData(prev => ({...prev, ...changes}))}
                errors={validationErrors} // Pass general validation errors
                onNext={handleNext}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSkip={handleSkip}
              />
            )}

            {/* Step 6: Planting Date (Using StepFive.tsx) */}
            {currentStep === 6 && (
              <StepFive
                plantingDate={fieldData.planting_date}
                onPlantingDateChange={(date) => setFieldData({ ...fieldData, planting_date: date })}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSubmit={handleNext} // Use handleNext for progressing, not final submit
                onSkip={handleSkip}
                isSubmitting={isSubmitting} // Or false, if this step isn't 'submitting'
              />
            )}

            {/* Step 7: Soil Type & Irrigation */}
            {currentStep === 7 && (
              <SoilIrrigationStep
                soilType={fieldData.soil_type}
                irrigationType={fieldData.irrigation_type}
                locationDescription={fieldData.location_description}
                onChange={(key, value) => setFieldData({ ...fieldData, [key]: value })}
                errors={validationErrors}
                onNext={handleNext}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                onSkip={handleSkip} // Or remove if not skippable
              />
            )}

            {/* Step 8: Review and Submit */}
            {currentStep === 8 && (
              <ReviewSubmitStep
                initialFieldData={fieldData}
                onSubmit={handleFinalSubmit}
                onBack={() => setCurrentStep(step => Math.max(1, step - 1))}
                isSubmitting={isSubmitting}
                onAnalyze={handleAnalyzeField}
                locationName={searchedLocation || "Selected Field Area"} // Updated fallback
                errors={validationErrors.submit ? { submit: validationErrors.submit } : undefined}
              />
            )}

            {/* Success Step */}
            {currentStep > totalSteps && (
              <motion.div 
                className="text-center py-10 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mb-4"
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

            {/* Submission Progress Overlay */}
            {isSubmitting && (
              <motion.div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                  <div className="flex flex-col items-center">
                    {submissionStatus === 'error' ? (
                      <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                    ) : submissionStatus === 'success' ? (
                      <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                    ) : (
                      <Loader2 className="h-10 w-10 text-primary mb-4 animate-spin" />
                    )}

                    <h3 className="text-xl font-semibold mb-2">
                      {submissionStatus === 'validating' && "Validating your field..."}
                      {submissionStatus === 'processing' && "Processing field data..."}
                      {submissionStatus === 'saving' && "Saving your field..."}
                      {submissionStatus === 'syncing' && "Syncing with our servers..."}
                      {submissionStatus === 'success' && "Field saved successfully!"}
                      {submissionStatus === 'error' && "We're still saving your field..."}
                    </h3>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${submissionProgress}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {retryCount > 0 && submissionStatus !== 'success' && submissionStatus !== 'error' && (
                        <>Retrying... (Attempt {retryCount} of {MAX_RETRIES})<br /></>
                      )}
                      {circuitOpen && (
                        <span className="text-amber-500">Network issues detected. Using backup method.</span>
                      )}
                      {submissionStatus === 'error' && (
                        <span>Don't worry - we're saving your data locally</span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep <= totalSteps && (
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : () => setCurrentStep(step => Math.max(1, step - 1))}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
          )}

          <div className="space-x-2">
            {currentStep < totalSteps ? (
              <>
                {(currentStep === 3 || currentStep === 5) && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="ml-2"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Save Field
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
