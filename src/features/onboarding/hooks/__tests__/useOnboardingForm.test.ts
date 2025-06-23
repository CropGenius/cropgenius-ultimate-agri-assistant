import { renderHook, act } from '@testing-library/react-hooks';
import { useOnboardingForm } from '../useOnboardingForm';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Mock the useOnboarding hook
jest.mock('../useOnboarding');
import { useOnboarding } from '../useOnboarding';

// Mock the useToast hook
jest.mock('@/components/ui/use-toast');

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('useOnboardingForm', () => {
  const mockUpdateFormData = jest.fn();
  const mockGoToStep = jest.fn();
  const mockSubmitOnboarding = jest.fn();
  const mockResetOnboarding = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    (useOnboarding as jest.Mock).mockImplementation(() => ({
      currentStep: 0,
      totalSteps: 5,
      formData: { ...mockOnboardingData },
      updateFormData: mockUpdateFormData,
      goToStep: mockGoToStep,
      submitOnboarding: mockSubmitOnboarding,
      resetOnboarding: mockResetOnboarding,
      isSubmitting: false,
    }));
  });

  it('initializes with the correct default values', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(5);
    expect(result.current.formData).toEqual(mockOnboardingData);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles form field changes', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Simulate changing a form field
    const fieldName = 'farmName';
    const fieldValue = 'New Farm Name';
    
    act(() => {
      result.current.handleInputChange({
        target: { name: fieldName, value: fieldValue }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Verify updateFormData was called with the new value
    expect(mockUpdateFormData).toHaveBeenCalledWith({
      [fieldName]: fieldValue
    });
  });

  it('handles checkbox changes', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Simulate checking a checkbox
    const fieldName = 'hasIrrigation';
    const fieldValue = true;
    
    act(() => {
      result.current.handleCheckboxChange({
        target: { name: fieldName, checked: fieldValue }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Verify updateFormData was called with the new value
    expect(mockUpdateFormData).toHaveBeenCalledWith({
      [fieldName]: fieldValue
    });
  });

  it('handles multi-select changes', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Simulate selecting multiple crops
    const fieldName = 'crops';
    const selectedCrops = ['Maize', 'Beans'];
    
    act(() => {
      result.current.handleMultiSelectChange(fieldName, selectedCrops);
    });
    
    // Verify updateFormData was called with the new value
    expect(mockUpdateFormData).toHaveBeenCalledWith({
      [fieldName]: selectedCrops
    });
  });

  it('handles date changes', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Simulate changing a date
    const fieldName = 'plantingDate';
    const dateValue = new Date('2023-01-15');
    
    act(() => {
      result.current.handleDateChange(fieldName, dateValue);
    });
    
    // Verify updateFormData was called with the new date
    expect(mockUpdateFormData).toHaveBeenCalledWith({
      [fieldName]: dateValue
    });
  });

  it('handles form submission', async () => {
    // Mock a successful submission
    mockSubmitOnboarding.mockResolvedValueOnce({
      success: true,
      data: { userId: 'user-123', farmId: 'farm-456' }
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useOnboardingForm());
    
    // Simulate form submission
    await act(async () => {
      result.current.handleSubmit();
      await waitForNextUpdate();
    });
    
    // Verify submitOnboarding was called with the form data
    expect(mockSubmitOnboarding).toHaveBeenCalledWith(mockOnboardingData);
    
    // Verify navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/success');
  });

  it('handles form submission errors', async () => {
    // Mock a failed submission
    const mockError = new Error('Submission failed');
    mockSubmitOnboarding.mockResolvedValueOnce({
      success: false,
      error: mockError
    });
    
    // Mock the toast function
    const mockToast = jest.fn();
    require('@/components/ui/use-toast').useToast.mockReturnValue({
      toast: mockToast
    });
    
    const { result } = renderHook(() => useOnboardingForm());
    
    // Simulate form submission
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // Verify error toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to submit onboarding data. Please try again.'
    });
  });

  it('handles navigation between steps', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Go to next step
    act(() => {
      result.current.handleNext();
    });
    
    // Verify goToStep was called with the next step
    expect(mockGoToStep).toHaveBeenCalledWith(1);
    
    // Go to previous step
    act(() => {
      result.current.handleBack();
    });
    
    // Verify goToStep was called with the previous step
    expect(mockGoToStep).toHaveBeenLastCalledWith(-1);
  });

  it('validates the current step before proceeding', async () => {
    // Mock the validation function
    const mockValidateStep = jest.fn().mockReturnValue({
      isValid: false,
      errors: { farmName: 'Farm name is required' }
    });
    
    // Mock the toast function
    const mockToast = jest.fn();
    require('@/components/ui/use-toast').useToast.mockReturnValue({
      toast: mockToast
    });
    
    const { result } = renderHook(() => 
      useOnboardingForm({ validateStep: mockValidateStep })
    );
    
    // Try to proceed to next step with invalid data
    await act(async () => {
      await result.current.handleNext();
    });
    
    // Verify validation was called
    expect(mockValidateStep).toHaveBeenCalledWith(0, mockOnboardingData);
    
    // Verify error toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Validation Error',
      description: 'Please fix the errors in the form before continuing.'
    });
    
    // Verify we didn't navigate to the next step
    expect(mockGoToStep).not.toHaveBeenCalled();
  });

  it('resets the form', () => {
    const { result } = renderHook(() => useOnboardingForm());
    
    // Reset the form
    act(() => {
      result.current.resetForm();
    });
    
    // Verify resetOnboarding was called
    expect(mockResetOnboarding).toHaveBeenCalled();
  });
});
