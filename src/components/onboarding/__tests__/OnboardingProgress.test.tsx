import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingProgress } from '../OnboardingProgress';
import { OnboardingProgress as OnboardingProgressType } from '@/api/onboardingApi';

describe('OnboardingProgress', () => {
  const mockProgress: OnboardingProgressType = {
    user_id: 'user123',
    current_step: 2,
    total_steps: 5,
    completed_steps: [1]
  };
  
  const mockOnStepClick = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render loading state', () => {
    render(
      <OnboardingProgress
        isLoading={true}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that the loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  it('should render empty state when progress is missing', () => {
    render(
      <OnboardingProgress
        progress={undefined}
        onStepClick={mockOnStepClick}
      />
    );
    
    expect(screen.getByText('No progress data available')).toBeInTheDocument();
  });
  
  it('should render progress bar with correct percentage', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that the progress bar is displayed with correct value
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '20'); // 1/5 = 20%
  });
  
  it('should render correct number of step indicators', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that there are 5 step indicators
    const stepLabels = screen.getAllByText(/Step \d/);
    expect(stepLabels).toHaveLength(5);
  });
  
  it('should mark completed steps correctly', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that step 1 is marked as completed
    expect(screen.getByText('Step 1').className).toContain('text-primary');
  });
  
  it('should mark current step correctly', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that step 2 is marked as current
    expect(screen.getByText('Step 2').className).toContain('text-primary');
  });
  
  it('should call onStepClick when clicking on a completed step', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Click on step 1 (completed)
    const step1 = screen.getByText('Step 1');
    fireEvent.click(step1.parentElement!);
    
    // Verify onStepClick was called with step 1
    expect(mockOnStepClick).toHaveBeenCalledWith(1);
  });
  
  it('should call onStepClick when clicking on the current step', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Click on step 2 (current)
    const step2 = screen.getByText('Step 2');
    fireEvent.click(step2.parentElement!);
    
    // Verify onStepClick was called with step 2
    expect(mockOnStepClick).toHaveBeenCalledWith(2);
  });
  
  it('should not call onStepClick when clicking on a future step', () => {
    render(
      <OnboardingProgress
        progress={mockProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Click on step 3 (future)
    const step3 = screen.getByText('Step 3');
    fireEvent.click(step3.parentElement!);
    
    // Verify onStepClick was not called
    expect(mockOnStepClick).not.toHaveBeenCalled();
  });
  
  it('should handle progress with all steps completed', () => {
    const completedProgress: OnboardingProgressType = {
      user_id: 'user123',
      current_step: 6,
      total_steps: 5,
      completed_steps: [1, 2, 3, 4, 5]
    };
    
    render(
      <OnboardingProgress
        progress={completedProgress}
        onStepClick={mockOnStepClick}
      />
    );
    
    // Check that the progress bar is at 100%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    
    // Check that all steps are marked as completed
    const stepLabels = screen.getAllByText(/Step \d/);
    stepLabels.forEach(label => {
      expect(label.className).toContain('text-primary');
    });
  });
});