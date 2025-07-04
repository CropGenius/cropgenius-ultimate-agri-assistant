import { completeOnboarding } from '../onboardingService';
import { supabase } from '@/lib/supabase';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('onboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completeOnboarding', () => {
    it('should call supabase.rpc with correct parameters', async () => {
      // Mock successful response
      const mockResponse = {
        data: { user_id: 'test-user-id', farm_id: 'test-farm-id' },
        error: null,
      };
      (supabase.rpc as vi.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await completeOnboarding(mockOnboardingData);

      // Check if rpc was called with correct parameters
      expect(supabase.rpc).toHaveBeenCalledWith('complete_onboarding', {
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

      // Check if the function returns the correct data
      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
        error: null,
      });
    });

    it('should handle missing required fields', async () => {
      // Create incomplete data
      const incompleteData = { ...mockOnboardingData, farmName: '' };

      // Call the function and expect it to throw
      await expect(completeOnboarding(incompleteData as any)).rejects.toThrow(
        'Farm name is required'
      );
    });

    it('should handle API errors', async () => {
      // Mock error response
      const errorMessage = 'Database connection failed';
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      // Call the function
      const result = await completeOnboarding(mockOnboardingData);

      // Check if the function returns the error
      expect(result).toEqual({
        success: false,
        data: null,
        error: expect.objectContaining({
          message: errorMessage,
        }),
      });
    });

    it('should handle date conversion', async () => {
      // Mock successful response
      const mockResponse = {
        data: { user_id: 'test-user-id', farm_id: 'test-farm-id' },
        error: null,
      };
      (supabase.rpc as vi.Mock).mockResolvedValueOnce(mockResponse);

      // Create data with Date objects
      const dataWithDates = {
        ...mockOnboardingData,
        plantingDate: new Date('2023-01-01'),
        harvestDate: new Date('2023-12-31'),
      };

      // Call the function
      await completeOnboarding(dataWithDates);

      // Check if dates were converted to ISO strings
      expect(supabase.rpc).toHaveBeenCalledWith(
        'complete_onboarding',
        expect.objectContaining({
          planting_date: '2023-01-01T00:00:00.000Z',
          harvest_date: '2023-12-31T00:00:00.000Z',
        })
      );
    });
  });
});
