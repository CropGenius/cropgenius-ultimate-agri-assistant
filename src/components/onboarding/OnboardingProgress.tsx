/**
 * OnboardingProgress Component
 * Displays progress through onboarding steps
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { OnboardingProgress as OnboardingProgressType } from '@/api/onboardingApi';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  progress?: OnboardingProgressType;
  isLoading?: boolean;
  onStepClick?: (stepId: number) => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  progress,
  isLoading = false,
  onStepClick
}) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <Progress value={0} className="w-full" />
      </div>
    );
  }
  
  if (!progress) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">No progress data available</span>
        </div>
        <Progress value={0} className="w-full" />
      </div>
    );
  }
  
  const { current_step, total_steps, completed_steps } = progress;
  const progressPercentage = (completed_steps.length / total_steps) * 100;
  
  return (
    <div className="w-full space-y-4">
      <Progress value={progressPercentage} className="w-full" />
      
      <div className="flex justify-between">
        {Array.from({ length: total_steps }).map((_, index) => {
          const stepId = index + 1;
          const isCompleted = completed_steps.includes(stepId);
          const isCurrent = current_step === stepId;
          const isClickable = isCompleted || isCurrent;
          
          return (
            <div
              key={stepId}
              className={cn(
                "flex flex-col items-center",
                isClickable && onStepClick ? "cursor-pointer" : "cursor-default"
              )}
              onClick={() => isClickable && onStepClick && onStepClick(stepId)}
            >
              <div className={cn(
                "rounded-full flex items-center justify-center w-8 h-8 mb-1",
                isCompleted ? "bg-primary text-primary-foreground" : 
                isCurrent ? "bg-primary/20 text-primary border border-primary" : 
                "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{stepId}</span>
                )}
              </div>
              <span className={cn(
                "text-xs",
                isCompleted ? "text-primary font-medium" : 
                isCurrent ? "text-primary" : 
                "text-muted-foreground"
              )}>
                Step {stepId}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};