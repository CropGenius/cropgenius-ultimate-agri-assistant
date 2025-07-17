import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingStep } from '../OnboardingStep';
import { OnboardingStep as OnboardingStepType } from '@/api/onboardingApi';

describe('OnboardingStep', () => {
  const mockStep: OnboardingStepType = {
    id: 1,
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: [
      {
        id: 'full_name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        value: 'John Doe'
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
        value: 'john@example.com'
      },
      {
        id: 'role',
        type: 'select',
        label: 'Role',
        placeholder: 'Select your role',
        required: true,
        options: [
          { value: 'farmer', label: 'Farmer' },
          { value: 'admin', label: 'Admin' }
        ],
        value: 'farmer'
      },
      {
        id: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
        value: true
      }
    ],
    next_button_disabled: false
  };
  
  const mockOnPrevious = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnUpdate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render loading state', () => {
    render(
      <OnboardingStep
        step={mockStep}
        isLoading={true}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('should render error state when step is missing', () => {
    render(
      <OnboardingStep
        step={undefined as any}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load onboarding step')).toBeInTheDocument();
  });
  
  it('should render step title and description', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });
  
  it('should render text fields with values', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    const fullNameInput = screen.getByLabelText('Full Name', { exact: false }) as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email', { exact: false }) as HTMLInputElement;
    
    expect(fullNameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });
  
  it('should render select field with value', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Farmer')).toBeInTheDocument();
  });
  
  it('should render checkbox field with value', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    const checkbox = screen.getByLabelText('I agree to the terms and conditions', { exact: false }) as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });
  
  it('should call onUpdate and onNext when form is submitted', async () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Submit the form
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Verify onUpdate was called with field values
    expect(mockOnUpdate).toHaveBeenCalledWith({
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'farmer',
      terms: true
    });
    
    // Verify onNext was called
    expect(mockOnNext).toHaveBeenCalled();
  });
  
  it('should not call onNext when next_button_disabled is true', () => {
    render(
      <OnboardingStep
        step={{ ...mockStep, next_button_disabled: true }}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Submit the form
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Verify onUpdate was called
    expect(mockOnUpdate).toHaveBeenCalled();
    
    // Verify onNext was not called
    expect(mockOnNext).not.toHaveBeenCalled();
  });
  
  it('should call onPrevious when previous button is clicked', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Click the previous button
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    // Verify onPrevious was called
    expect(mockOnPrevious).toHaveBeenCalled();
  });
  
  it('should disable previous button when isFirstStep is true', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
        isFirstStep={true}
      />
    );
    
    // Verify previous button is disabled
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });
  
  it('should show "Complete" instead of "Next" when isLastStep is true', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
        isLastStep={true}
      />
    );
    
    // Verify button text
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });
  
  it('should show validation errors when fields are required but empty', async () => {
    const stepWithEmptyFields: OnboardingStepType = {
      ...mockStep,
      fields: [
        {
          id: 'full_name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          value: ''
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          value: ''
        }
      ]
    };
    
    const validationErrors = {
      full_name: 'Full name is required',
      email: 'Email is required'
    };
    
    render(
      <OnboardingStep
        step={stepWithEmptyFields}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
        validationErrors={validationErrors}
      />
    );
    
    // Submit the form to trigger validation
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Verify validation errors are displayed
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    
    // Verify onUpdate was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
  
  it('should show loading state when isUpdating is true', () => {
    render(
      <OnboardingStep
        step={mockStep}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onUpdate={mockOnUpdate}
        isUpdating={true}
      />
    );
    
    // Verify loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // Verify buttons are disabled
    const nextButton = screen.getByText('Saving...');
    const previousButton = screen.getByText('Previous');
    expect(nextButton).toBeDisabled();
    expect(previousButton).toBeDisabled();
  });
});