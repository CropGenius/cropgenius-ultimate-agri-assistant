import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

type MockSupabaseClient = {
  rpc: jest.Mock;
};

type RenderOnboardingWizardOptions = {
  initialRoute?: string;
  supabaseClient?: MockSupabaseClient;
  queryClient?: QueryClient;
};

export const renderOnboardingWizard = ({
  initialRoute = '/onboarding',
  supabaseClient = {
    rpc: jest.fn().mockResolvedValue({ data: { user_id: 'test-user-id' }, error: null }),
  },
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  }),
}: RenderOnboardingWizardOptions = {}) => {
  // Mock the useAuth hook
  jest.mock('@/lib/auth', () => ({
    useAuth: () => ({
      user: { id: 'test-user-id', email: 'test@example.com' },
      signOut: jest.fn(),
    }),
  }));

  // Mock the supabase client
  jest.mock('@/lib/supabase', () => ({
    supabase: supabaseClient,
  }));

  // Mock the useOnboarding hook
  jest.mock('@/features/onboarding/hooks/useOnboarding', () => ({
    useOnboarding: () => ({
      completeOnboarding: jest.fn().mockResolvedValue({ success: true }),
      isLoading: false,
      error: null,
    }),
  }));

  // Mock the useForm hook
  jest.mock('react-hook-form', () => {
    const originalModule = jest.requireActual('react-hook-form');
    return {
      ...originalModule,
      useForm: () => ({
        register: jest.fn(),
        handleSubmit: (fn: any) => (e: any) => {
          e?.preventDefault?.();
          return fn({});
        },
        formState: { errors: {} },
        watch: jest.fn(),
        setValue: jest.fn(),
        getValues: jest.fn(),
        reset: jest.fn(),
      }),
    };
  });

  // Mock the useLocalStorage hook
  jest.mock('@/hooks/use-local-storage', () => ({
    useLocalStorage: (key: string, initialValue: any) => {
      const [storedValue, setStoredValue] = React.useState(initialValue);
      
      const setValue = (value: any) => {
        setStoredValue(value);
      };
      
      return [storedValue, setValue];
    },
  }));

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRouter]}>
        <OnboardingWizard />
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    ...utils,
    user: userEvent.setup(),
    queryClient,
    supabaseClient,
  };
};

export const mockOnboardingData = {
  farmName: 'Test Farm',
  totalArea: '10',
  location: {
    address: '123 Test St, Test City',
    coordinates: { lat: 0, lng: 0 },
  },
  crops: ['Wheat', 'Corn'],
  plantingDate: new Date().toISOString(),
  harvestDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
  fieldSizes: { 'Wheat': '5', 'Corn': '5' },
  hasIrrigation: true,
  hasMachinery: true,
  hasSoilTest: true,
  primaryGoal: 'maximize_yield',
  mainChallenges: ['pests', 'weather'],
  budget: 'medium',
  fullName: 'Test User',
  phoneNumber: '1234567890',
  preferredLanguage: 'en',
  communicationPrefs: ['email', 'sms'],
};

export const fillStepOne = async (user: any) => {
  const farmNameInput = screen.getByLabelText(/farm name/i);
  const totalAreaInput = screen.getByLabelText(/total area/i);
  const nextButton = screen.getByRole('button', { name: /next/i });

  await user.type(farmNameInput, mockOnboardingData.farmName);
  await user.type(totalAreaInput, mockOnboardingData.totalArea);
  await user.click(nextButton);
};

export const fillStepTwo = async (user: any) => {
  const cropInput = screen.getByLabelText(/select crops/i);
  const addCropButton = screen.getByRole('button', { name: /add crop/i });
  const nextButton = screen.getByRole('button', { name: /next/i });

  for (const crop of mockOnboardingData.crops) {
    await user.type(cropInput, crop);
    await user.click(addCropButton);
  }

  await user.click(nextButton);
};

export const fillStepThree = async (user: any) => {
  const hasIrrigationCheckbox = screen.getByLabelText(/do you have irrigation/i);
  const hasMachineryCheckbox = screen.getByLabelText(/do you own farming machinery/i);
  const hasSoilTestCheckbox = screen.getByLabelText(/have you done a soil test/i);
  const nextButton = screen.getByRole('button', { name: /next/i });

  if (mockOnboardingData.hasIrrigation) await user.click(hasIrrigationCheckbox);
  if (mockOnboardingData.hasMachinery) await user.click(hasMachineryCheckbox);
  if (mockOnboardingData.hasSoilTest) await user.click(hasSoilTestCheckbox);

  await user.click(nextButton);
};

export const fillStepFour = async (user: any) => {
  const primaryGoalSelect = screen.getByLabelText(/primary goal/i);
  const challengeCheckboxes = screen.getAllByRole('checkbox', { name: /pest|weather|soil|water/i });
  const budgetSelect = screen.getByLabelText(/budget/i);
  const nextButton = screen.getByRole('button', { name: /next/i });

  await user.selectOptions(primaryGoalSelect, mockOnboardingData.primaryGoal);
  
  for (const challenge of mockOnboardingData.mainChallenges) {
    const checkbox = challengeCheckboxes.find(cb => 
      cb.getAttribute('name')?.toLowerCase().includes(challenge.toLowerCase())
    );
    if (checkbox) await user.click(checkbox);
  }

  await user.selectOptions(budgetSelect, mockOnboardingData.budget);
  await user.click(nextButton);
};

export const fillStepFive = async (user: any) => {
  const fullNameInput = screen.getByLabelText(/full name/i);
  const phoneInput = screen.getByLabelText(/phone number/i);
  const languageSelect = screen.getByLabelText(/preferred language/i);
  const emailCheckbox = screen.getByLabelText(/email/i);
  const smsCheckbox = screen.getByLabelText(/sms/i);
  const nextButton = screen.getByRole('button', { name: /next/i });

  await user.type(fullNameInput, mockOnboardingData.fullName);
  await user.type(phoneInput, mockOnboardingData.phoneNumber);
  await user.selectOptions(languageSelect, mockOnboardingData.preferredLanguage);
  
  if (mockOnboardingData.communicationPrefs.includes('email')) await user.click(emailCheckbox);
  if (mockOnboardingData.communicationPrefs.includes('sms')) await user.click(smsCheckbox);

  await user.click(nextButton);
};

export const completeOnboarding = async (user: any) => {
  // Go through all steps
  await fillStepOne(user);
  await fillStepTwo(user);
  await fillStepThree(user);
  await fillStepFour(user);
  await fillStepFive(user);

  // Submit the final step
  const submitButton = screen.getByRole('button', { name: /complete onboarding/i });
  await user.click(submitButton);
};
