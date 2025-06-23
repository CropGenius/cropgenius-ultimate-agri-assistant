import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressMeter } from '../ProgressMeter';

const STEPS = [
  { id: 'step1', label: 'Step 1' },
  { id: 'step2', label: 'Step 2' },
  { id: 'step3', label: 'Step 3' },
  { id: 'step4', label: 'Step 4' },
  { id: 'step5', label: 'Step 5' },
];

describe('ProgressMeter', () => {
  it('renders the correct number of steps', () => {
    render(<ProgressMeter currentStep={0} steps={STEPS} />);
    
    const stepElements = screen.getAllByRole('listitem');
    expect(stepElements).toHaveLength(STEPS.length);
    
    // Check if all step labels are rendered
    STEPS.forEach(step => {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    });
  });

  it('marks the current step as active', () => {
    const currentStep = 2; // 0-based index
    render(<ProgressMeter currentStep={currentStep} steps={STEPS} />);
    
    const stepElements = screen.getAllByRole('listitem');
    
    // Check if the current step has the active class
    expect(stepElements[currentStep]).toHaveClass('active');
    
    // Check if previous steps are completed
    for (let i = 0; i < currentStep; i++) {
      expect(stepElements[i]).toHaveClass('completed');
    }
    
    // Check if next steps are not completed
    for (let i = currentStep + 1; i < STEPS.length; i++) {
      expect(stepElements[i]).not.toHaveClass('completed');
      expect(stepElements[i]).not.toHaveClass('active');
    }
  });

  it('applies custom class names', () => {
    const customClass = 'custom-progress-meter';
    render(
      <ProgressMeter 
        currentStep={1} 
        steps={STEPS} 
        className={customClass} 
      />
    );
    
    const progressMeter = screen.getByRole('navigation');
    expect(progressMeter).toHaveClass(customClass);
  });

  it('handles the first step correctly', () => {
    render(<ProgressMeter currentStep={0} steps={STEPS} />);
    
    const stepElements = screen.getAllByRole('listitem');
    
    // First step should be active
    expect(stepElements[0]).toHaveClass('active');
    
    // No steps should be completed
    stepElements.forEach((step, index) => {
      if (index > 0) {
        expect(step).not.toHaveClass('completed');
      }
    });
  });

  it('handles the last step correctly', () => {
    const lastStepIndex = STEPS.length - 1;
    render(<ProgressMeter currentStep={lastStepIndex} steps={STEPS} />);
    
    const stepElements = screen.getAllByRole('listitem');
    
    // Last step should be active
    expect(stepElements[lastStepIndex]).toHaveClass('active');
    
    // All previous steps should be completed
    for (let i = 0; i < lastStepIndex; i++) {
      expect(stepElements[i]).toHaveClass('completed');
    }
  });

  it('renders correctly with a single step', () => {
    const singleStep = [{ id: 'single', label: 'Single Step' }];
    render(<ProgressMeter currentStep={0} steps={singleStep} />);
    
    const stepElements = screen.getAllByRole('listitem');
    expect(stepElements).toHaveLength(1);
    expect(stepElements[0]).toHaveClass('active');
    expect(screen.getByText('Single Step')).toBeInTheDocument();
  });

  it('applies correct accessibility attributes', () => {
    render(<ProgressMeter currentStep={1} steps={STEPS} />);
    
    const progressMeter = screen.getByRole('navigation');
    expect(progressMeter).toHaveAttribute('aria-label', 'Progress');
    
    const stepElements = screen.getAllByRole('listitem');
    stepElements.forEach((step, index) => {
      expect(step).toHaveAttribute('aria-current', index === 1 ? 'step' : 'false');
    });
  });
});
