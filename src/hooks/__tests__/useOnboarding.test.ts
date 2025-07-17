import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOnboarding } from '../useOnboarding';
import { getOnboardingStep, updateOnboardingStep, getOnboardingProgress } from '@/api/onboardingApi';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/api/onboardingApi', () => ({
  getOnboardingStep: vi.fn(),
  updateOnboardingStep: vi.fn(),
  getOnboardingProgress: vi.fn()
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Helper to create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOnboarding', () => {
  const mockUserId = 'user123';
  const mockUser = { id: mockUserId, email: 'test@example.com' };
  const mockSession = { access_token: 'token123' };
  
  const mockStep = {
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
      }
    ],
    next_button_disabled: false
  };
  
  const mockProgress = {
    user_id: mockUserId,
    current_step: 1,
    total_steps: 6,
    completed_steps: []
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth context
    (useAuthContext as any).mockReturnValue({
      user: mockUser,
      session: mockSession
    });
    
    // Mock API responses
    (getOnboardingStep as any).mockResolvedValue({
      success: true,
      data: mockStep,
      status: 200
    });
    
    (getOnboardingProgress as any).mockResolvedValue({
      success: true,
      data: mockProgress,
      status: 200
    });
    
    (updateOnboardingStep as any).mockResolvedValue({
      success: true,
      data: mockStep,
      status: 200
    });
  });
  
  it('should fetch onboarding progress and current step on initial render', async () => {
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Initial state should be loading
    expect(result.current.isLoadingProgress).toBe(true);
    expect(result.current.isLoadingStep).toBe(true);
    
    // Wait for queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Verify API calls
    expect(getOnboardingProgress).toHaveBeenCalledWith(mockUserId);
    expect(getOnboardingStep).toHaveBeenCalledWith(1, mockUserId);
    
    // Verify data
    expect(result.current.progress).toEqual(mockProgress);
    expect(result.current.step).toEqual(mockStep);
    expect(result.current.currentStepId).toBe(1);
  });
  
  it('should update fields and show success toast on successful update', async () => {
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Update fields
    const fieldValues = { full_name: 'Jane Doe', email: 'jane@example.com' };
    act(() => {
      result.current.updateFields(fieldValues);
    });
    
    // Verify API call
    expect(updateOnboardingStep).toHaveBeenCalledWith(1, mockUserId, fieldValues);
    
    // Wait for mutation to complete
    await waitFor(() => !result.current.isUpdating);
    
    // Verify toast
    expect(toast.success).toHaveBeenCalledWith('Step updated successfully');
  });
  
  it('should show error toast for validation errors', async () => {
    // Mock validation error response
    (updateOnboardingStep as any).mockResolvedValue({
      success: false,
      error: 'Validation failed',
      status: 400,
      details: {
        validation_errors: {
          email: 'Invalid email format'
        }
      }
    });
    
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Update fields with invalid data
    act(() => {
      result.current.updateFields({ email: 'invalid-email' });
    });
    
    // Wait for mutation to complete
    await waitFor(() => !result.current.isUpdating);
    
    // Verify toast
    expect(toast.error).toHaveBeenCalledWith('Please fix the validation errors');
  });
  
  it('should navigate to next step when next button is clicked', async () => {
    // Mock progress with multiple steps
    (getOnboardingProgress as any).mockResolvedValue({
      success: true,
      data: {
        ...mockProgress,
        current_step: 2,
        completed_steps: [1]
      },
      status: 200
    });
    
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Verify current step
    expect(result.current.currentStepId).toBe(2);
    
    // Mock next step data
    (getOnboardingStep as any).mockResolvedValue({
      success: true,
      data: {
        ...mockStep,
        id: 3,
        title: 'Next Step'
      },
      status: 200
    });
    
    // Navigate to next step
    act(() => {
      result.current.goToNextStep();
    });
    
    // Verify current step updated
    expect(result.current.currentStepId).toBe(3);
    
    // Wait for step data to update
    await waitFor(() => result.current.step?.id === 3);
    
    // Verify step data
    expect(result.current.step?.title).toBe('Next Step');
  });
  
  it('should prevent navigation to next step if next button is disabled', async () => {
    // Mock step with next button disabled
    (getOnboardingStep as any).mockResolvedValue({
      success: true,
      data: {
        ...mockStep,
        next_button_disabled: true
      },
      status: 200
    });
    
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Try to navigate to next step
    act(() => {
      result.current.goToNextStep();
    });
    
    // Verify current step did not change
    expect(result.current.currentStepId).toBe(1);
    
    // Verify error toast
    expect(toast.error).toHaveBeenCalledWith('Please complete all required fields before continuing');
  });
  
  it('should navigate to previous step', async () => {
    // Mock progress with multiple steps
    (getOnboardingProgress as any).mockResolvedValue({
      success: true,
      data: {
        ...mockProgress,
        current_step: 2,
        completed_steps: [1]
      },
      status: 200
    });
    
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Verify current step
    expect(result.current.currentStepId).toBe(2);
    
    // Mock previous step data
    (getOnboardingStep as any).mockResolvedValue({
      success: true,
      data: {
        ...mockStep,
        id: 1,
        title: 'Previous Step'
      },
      status: 200
    });
    
    // Navigate to previous step
    act(() => {
      result.current.goToPreviousStep();
    });
    
    // Verify current step updated
    expect(result.current.currentStepId).toBe(1);
    
    // Wait for step data to update
    await waitFor(() => result.current.step?.id === 1);
    
    // Verify step data
    expect(result.current.step?.title).toBe('Previous Step');
  });
  
  it('should check if a step is completed', async () => {
    // Mock progress with completed steps
    (getOnboardingProgress as any).mockResolvedValue({
      success: true,
      data: {
        ...mockProgress,
        current_step: 3,
        completed_steps: [1, 2]
      },
      status: 200
    });
    
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress);
    
    // Check if steps are completed
    expect(result.current.isStepCompleted(1)).toBe(true);
    expect(result.current.isStepCompleted(2)).toBe(true);
    expect(result.current.isStepCompleted(3)).toBe(false);
    expect(result.current.isStepCompleted(4)).toBe(false);
  });
  
  it('should refresh data when refreshData is called', async () => {
    const { result, waitFor } = renderHook(() => useOnboarding(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingProgress && !result.current.isLoadingStep);
    
    // Clear mock calls
    vi.clearAllMocks();
    
    // Refresh data
    act(() => {
      result.current.refreshData();
    });
    
    // Verify API calls
    expect(getOnboardingProgress).toHaveBeenCalledWith(mockUserId);
    expect(getOnboardingStep).toHaveBeenCalledWith(1, mockUserId);
  });
});