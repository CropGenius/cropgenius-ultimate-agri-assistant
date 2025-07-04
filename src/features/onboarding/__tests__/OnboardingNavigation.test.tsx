import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { OnboardingProvider } from '../context/OnboardingContext';

// Mock the useForm hook
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => fn,
    formState: { errors: {} },
  }),
}));

// Mock the useOnboarding hook
const mockGoToStep = vi.fn();
const mockSubmitStep = vi.fn();

jest.mock('../../hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    currentStep: 0,
    totalSteps: 5,
    goToStep: mockGoToStep,
    submitStep: mockSubmitStep,
    isSubmitting: false,
  }),
}));

// Test component that wraps the OnboardingNavigation with the provider
const TestComponent = () => (
  <OnboardingProvider>
    <OnboardingNavigation onNext={vi.fn()} onBack={vi.fn()} />
  </OnboardingProvider>
);

describe('OnboardingNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navigation buttons correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    render(
      <OnboardingProvider>
        <OnboardingNavigation onNext={vi.fn()} onBack={onBack} />
      </OnboardingProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when the next button is clicked', () => {
    const onNext = vi.fn();
    render(
      <OnboardingProvider>
        <OnboardingNavigation onNext={onNext} onBack={vi.fn()} />
      </OnboardingProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows submit button on the last step', () => {
    // Mock the useOnboarding hook to return the last step
    vi.mock('../../hooks/useOnboarding', () => ({
      useOnboarding: () => ({
        currentStep: 4, // Last step (0-based index)
        totalSteps: 5,
        goToStep: mockGoToStep,
        submitStep: mockSubmitStep,
        isSubmitting: false,
      }),
    }));

    render(
      <OnboardingProvider>
        <OnboardingNavigation 
          onNext={jest.fn()} 
          onBack={jest.fn()} 
          isLastStep={true} 
        />
      </OnboardingProvider>
    );
    
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    // Mock the useOnboarding hook to return isSubmitting as true
    vi.mock('../../hooks/useOnboarding', () => ({
      useOnboarding: () => ({
        currentStep: 4, // Last step
        totalSteps: 5,
        goToStep: mockGoToStep,
        submitStep: mockSubmitStep,
        isSubmitting: true,
      }),
    }));

    render(
      <OnboardingProvider>
        <OnboardingNavigation 
          onNext={jest.fn()} 
          onBack={jest.fn()} 
          isLastStep={true} 
        />
      </OnboardingProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /submitting/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('hides the back button on the first step', () => {
    // Mock the useOnboarding hook to return the first step
    vi.mock('../../hooks/useOnboarding', () => ({
      useOnboarding: () => ({
        currentStep: 0, // First step
        totalSteps: 5,
        goToStep: mockGoToStep,
        submitStep: mockSubmitStep,
        isSubmitting: false,
      }),
    }));

    render(
      <OnboardingProvider>
        <OnboardingNavigation 
          onNext={jest.fn()} 
          onBack={jest.fn()} 
          isFirstStep={true} 
        />
      </OnboardingProvider>
    );
    
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('applies custom class names', () => {
    const customClass = 'custom-navigation';
    
    render(
      <OnboardingProvider>
        <OnboardingNavigation 
          onNext={jest.fn()} 
          onBack={jest.fn()} 
          className={customClass} 
        />
      </OnboardingProvider>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass(customClass);
  });
});
