/**
 * OnboardingStep Component
 * Displays and handles a single onboarding step
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStep as OnboardingStepType } from '@/api/onboardingApi';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface OnboardingStepProps {
  step: OnboardingStepType;
  isLoading?: boolean;
  isUpdating?: boolean;
  validationErrors?: Record<string, string>;
  onPrevious?: () => void;
  onNext?: () => void;
  onUpdate?: (fieldValues: Record<string, any>) => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  step,
  isLoading = false,
  isUpdating = false,
  validationErrors = {},
  onPrevious,
  onNext,
  onUpdate,
  isFirstStep = false,
  isLastStep = false
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Initialize field values from step data
  useEffect(() => {
    if (step?.fields) {
      const initialValues: Record<string, any> = {};
      step.fields.forEach(field => {
        if (field.value !== undefined) {
          initialValues[field.id] = field.value;
        }
      });
      setFieldValues(initialValues);
    }
  }, [step]);
  
  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    setTouched(prev => ({ ...prev, [fieldId]: true }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    step.fields.forEach(field => {
      allTouched[field.id] = true;
    });
    setTouched(allTouched);
    
    // Check if there are any validation errors
    const hasErrors = step.fields.some(field => {
      if (field.required && !fieldValues[field.id]) {
        return true;
      }
      return validationErrors?.[field.id];
    });
    
    if (hasErrors) {
      return;
    }
    
    // Update field values
    if (onUpdate) {
      onUpdate(fieldValues);
    }
    
    // Navigate to next step if not disabled
    if (!step.next_button_disabled && onNext) {
      onNext();
    }
  };
  
  // Render field based on type
  const renderField = (field: OnboardingStepType['fields'][0]) => {
    const value = fieldValues[field.id];
    const error = touched[field.id] ? validationErrors?.[field.id] : undefined;
    const isRequired = field.required;
    
    const fieldLabel = (
      <Label htmlFor={field.id} className="mb-2 block">
        {field.label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
    );
    
    const errorMessage = error && (
      <div className="text-destructive text-sm flex items-center mt-1">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    );
    
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            {fieldLabel}
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {errorMessage}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            {fieldLabel}
            <Select
              value={value || ''}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorMessage}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 mb-4" key={field.id}>
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              className={error ? 'border-destructive' : ''}
            />
            <Label htmlFor={field.id} className={error ? 'text-destructive' : ''}>
              {field.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            {errorMessage && (
              <div className="text-destructive text-sm flex items-center ml-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            {fieldLabel}
            <RadioGroup
              value={value || ''}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              className={error ? 'border-destructive rounded p-2' : ''}
            >
              {field.options?.map(option => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {errorMessage}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!step) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Error</CardTitle>
          <CardDescription className="text-center">
            Failed to load onboarding step
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step.fields.map(renderField)}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep || isUpdating}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            type="submit"
            disabled={step.next_button_disabled || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};