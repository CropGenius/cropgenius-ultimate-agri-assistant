import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { OnboardingWizard } from '../OnboardingWizard';
import {
  renderOnboardingWizard,
  completeOnboarding,
  mockOnboardingData,
} from '@/test-utils/onboarding-test-utils';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn().mockResolvedValue({ data: { user_id: 'test-user-id' }, error: null }),
  },
}));

// Mock the useAuth hook
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    signOut: jest.fn(),
  }),
}));

describe('OnboardingWizard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  it('renders the first step by default', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OnboardingWizard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/welcome to cropgenius/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/farm name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total area/i)).toBeInTheDocument();
  });

  it('allows navigation through the wizard', async () => {
    const { user } = renderOnboardingWizard({ queryClient });
    
    // Step 1: Farm Vitals
    expect(screen.getByText(/farm vitals/i)).toBeInTheDocument();
    
    // Fill step 1
    const farmNameInput = screen.getByLabelText(/farm name/i);
    const totalAreaInput = screen.getByLabelText(/total area/i);
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    await user.type(farmNameInput, mockOnboardingData.farmName);
    await user.type(totalAreaInput, mockOnboardingData.totalArea);
    await user.click(nextButton);
    
    // Step 2: Crop Selection
    await waitFor(() => {
      expect(screen.getByText(/crop selection/i)).toBeInTheDocument();
    });
    
    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByText(/farm vitals/i)).toBeInTheDocument();
    });
  });

  it('saves form data to localStorage', async () => {
    const { user } = renderOnboardingWizard({ queryClient });
    
    // Fill step 1
    const farmNameInput = screen.getByLabelText(/farm name/i);
    const totalAreaInput = screen.getByLabelText(/total area/i);
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    await user.type(farmNameInput, mockOnboardingData.farmName);
    await user.type(totalAreaInput, mockOnboardingData.totalArea);
    
    // Check if data is saved to localStorage
    expect(JSON.parse(localStorage.getItem('onboarding-form-data') || '{}')).toEqual(
      expect.objectContaining({
        farmName: mockOnboardingData.farmName,
        totalArea: mockOnboardingData.totalArea,
      })
    );
    
    await user.click(nextButton);
  });

  it('loads form data from localStorage on mount', async () => {
    // Set up localStorage before rendering
    localStorage.setItem(
      'onboarding-form-data',
      JSON.stringify({
        farmName: 'Pre-filled Farm',
        totalArea: '20',
        currentStep: 0,
      })
    );
    
    renderOnboardingWizard({ queryClient });
    
    // Check if the form is pre-filled
    expect(screen.getByDisplayValue('Pre-filled Farm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
  });

  it('completes the onboarding flow successfully', async () => {
    const { user, supabaseClient } = renderOnboardingWizard({ queryClient });
    
    // Mock the RPC call
    const mockRpcResponse = {
      data: {
        success: true,
        user_id: 'test-user-id',
        farm_id: 'test-farm-id',
      },
      error: null,
    };
    
    supabaseClient.rpc.mockResolvedValueOnce({
      data: mockRpcResponse,
      error: null,
    });
    
    // Complete all steps
    await completeOnboarding(user);
    
    // Check if the RPC was called with the right data
    await waitFor(() => {
      expect(supabaseClient.rpc).toHaveBeenCalledWith('complete_onboarding', {
        farm_name: mockOnboardingData.farmName,
        total_area: parseFloat(mockOnboardingData.totalArea),
        crops: mockOnboardingData.crops,
        planting_date: expect.any(String),
        harvest_date: expect.any(String),
        has_irrigation: mockOnboardingData.hasIrrigation,
        has_machinery: mockOnboardingData.hasMachinery,
        has_soil_test: mockOnboardingData.hasSoilTest,
        primary_goal: mockOnboardingData.primaryGoal,
        main_challenges: mockOnboardingData.mainChallenges,
        budget: mockOnboardingData.budget,
        full_name: mockOnboardingData.fullName,
        phone_number: mockOnboardingData.phoneNumber,
        preferred_language: mockOnboardingData.preferredLanguage,
        communication_prefs: mockOnboardingData.communicationPrefs,
      });
    });
  });

  it('handles submission errors', async () => {
    const { user, supabaseClient } = renderOnboardingWizard({ queryClient });
    
    // Mock a failed RPC call
    const errorMessage = 'Failed to save onboarding data';
    supabaseClient.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });
    
    // Complete all steps
    await completeOnboarding(user);
    
    // Check if error is displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
