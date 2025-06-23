import React from 'react';
import { render, act } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '../OnboardingContext';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Test component that uses the onboarding context
const TestComponent = () => {
  const { 
    currentStep, 
    formData, 
    goToStep, 
    updateFormData, 
    resetOnboarding 
  } = useOnboarding();

  return (
    <div>
      <div data-testid="currentStep">{currentStep}</div>
      <div data-testid="farmName">{formData.farmName}</div>
      <button onClick={() => goToStep(2)}>Go to step 2</button>
      <button 
        onClick={() => updateFormData({ farmName: 'Updated Farm' })}
      >
        Update Farm Name
      </button>
      <button onClick={resetOnboarding}>Reset</button>
    </div>
  );
};

describe('OnboardingContext', () => {
  // Helper function to render the provider with test component
  const renderProvider = () => {
    return render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with default values', () => {
    const { getByTestId } = renderProvider();
    
    expect(getByTestId('currentStep').textContent).toBe('0');
    expect(getByTestId('farmName').textContent).toBe('');
  });

  it('updates the current step', () => {
    const { getByText, getByTestId } = renderProvider();
    
    // Click the button to go to step 2
    act(() => {
      getByText('Go to step 2').click();
    });
    
    expect(getByTestId('currentStep').textContent).toBe('2');
  });

  it('updates form data', () => {
    const { getByText, getByTestId } = renderProvider();
    
    // Click the button to update farm name
    act(() => {
      getByText('Update Farm Name').click();
    });
    
    expect(getByTestId('farmName').textContent).toBe('Updated Farm');
  });

  it('persists data to localStorage', () => {
    const { getByText } = renderProvider();
    
    // Update form data
    act(() => {
      getByText('Update Farm Name').click();
    });
    
    // Check if data is saved to localStorage
    const savedData = JSON.parse(localStorage.getItem('onboarding-form-data') || '{}');
    expect(savedData.farmName).toBe('Updated Farm');
  });

  it('loads data from localStorage on mount', () => {
    // Set up localStorage before rendering
    localStorage.setItem(
      'onboarding-form-data',
      JSON.stringify({
        currentStep: 2,
        farmName: 'Pre-filled Farm',
      })
    );
    
    const { getByTestId } = renderProvider();
    
    // Check if data is loaded from localStorage
    expect(getByTestId('currentStep').textContent).toBe('2');
    expect(getByTestId('farmName').textContent).toBe('Pre-filled Farm');
  });

  it('resets the onboarding data', () => {
    const { getByText, getByTestId } = renderProvider();
    
    // Update some data
    act(() => {
      getByText('Update Farm Name').click();
      getByText('Go to step 2').click();
    });
    
    // Reset the onboarding
    act(() => {
      getByText('Reset').click();
    });
    
    // Check if data is reset
    expect(getByTestId('currentStep').textContent).toBe('0');
    expect(getByTestId('farmName').textContent).toBe('');
    
    // Check if localStorage is cleared
    expect(localStorage.getItem('onboarding-form-data')).toBeNull();
  });

  it('handles invalid localStorage data gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('onboarding-form-data', 'invalid-json');
    
    // Mock console.error to avoid error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Render should not throw
    expect(() => renderProvider()).not.toThrow();
    
    consoleError.mockRestore();
  });

  it('provides default values when localStorage is empty', () => {
    const { getByTestId } = renderProvider();
    
    expect(getByTestId('currentStep').textContent).toBe('0');
    expect(getByTestId('farmName').textContent).toBe('');
  });
});
