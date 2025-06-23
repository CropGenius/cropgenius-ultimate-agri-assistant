import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOnboarding } from '../useOnboarding';
import { completeOnboarding } from '@/services/onboardingService';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Mock the onboarding service
jest.mock('@/services/onboardingService', () => ({
  completeOnboarding: jest.fn().mockResolvedValue({
    success: true,
    data: { user_id: 'test-user-id', farm_id: 'test-farm-id' },
    error: null,
  }),
}));

// Mock the useAuth hook
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    refreshSession: jest.fn().mockResolvedValue({}),
  }),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the toast function
const mockToast = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: () => mockToast('success'),
    error: () => mockToast('error'),
  },
}));

describe('useOnboarding', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.completeOnboarding).toBe('function');
  });

  it('should handle successful onboarding completion', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useOnboarding(), { wrapper });
    
    // Mock the successful response
    (completeOnboarding as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { user_id: 'test-user-id', farm_id: 'test-farm-id' },
      error: null,
    });
    
    // Call the mutation
    await act(async () => {
      await result.current.completeOnboarding(mockOnboardingData);
    });
    
    // Check if loading state was updated
    expect(result.current.isLoading).toBe(false);
    
    // Check if success toast was shown
    expect(mockToast).toHaveBeenCalledWith('success');
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle onboarding failure', async () => {
    const errorMessage = 'Failed to complete onboarding';
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // Mock the failed response
    (completeOnboarding as jest.Mock).mockResolvedValueOnce({
      success: false,
      data: null,
      error: { message: errorMessage },
    });
    
    // Call the mutation
    await act(async () => {
      await result.current.completeOnboarding(mockOnboardingData);
    });
    
    // Check if error state was updated
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(expect.objectContaining({
      message: errorMessage,
    }));
    
    // Check if error toast was shown
    expect(mockToast).toHaveBeenCalledWith('error');
    
    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // Mock the validation error
    const validationError = new Error('Validation failed');
    (completeOnboarding as jest.Mock).mockRejectedValueOnce(validationError);
    
    // Call the mutation with invalid data
    await act(async () => {
      await result.current.completeOnboarding({} as any);
    });
    
    // Check if error state was updated
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(validationError);
    
    // Check if error toast was shown
    expect(mockToast).toHaveBeenCalledWith('error');
  });

  it('should handle network errors', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    
    // Mock a network error
    const networkError = new Error('Network error');
    (completeOnboarding as jest.Mock).mockRejectedValueOnce(networkError);
    
    // Call the mutation
    await act(async () => {
      await result.current.completeOnboarding(mockOnboardingData);
    });
    
    // Check if error state was updated
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(networkError);
    
    // Check if error toast was shown
    expect(mockToast).toHaveBeenCalledWith('error');
  });
});
