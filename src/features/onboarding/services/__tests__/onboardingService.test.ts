import { completeOnboarding } from '../onboardingService';
import { supabase } from '@/integrations/supabase/client';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('onboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('completeOnboarding', () => {
    it('should call the Supabase RPC with the correct parameters', async () => {
      // Mock a successful RPC response
      const mockResponse = {
        user_id: 'user-123',
        farm_id: 'farm-456',
      };
      
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const result = await completeOnboarding(mockOnboardingData);

      // Verify the RPC was called with the correct function name and parameters
      expect(supabase.rpc).toHaveBeenCalledWith('complete_onboarding', {
        farm_name: mockOnboardingData.farmName,
        total_area: mockOnboardingData.totalArea,
        crops: mockOnboardingData.crops,
        planting_date: expect.any(String),
        harvest_date: expect.any(String),
        has_irrigation: mockOnboardingData.hasIrrigation,
        has_greenhouse: mockOnboardingData.hasGreenhouse,
        primary_goal: mockOnboardingData.primaryGoal,
        main_challenges: mockOnboardingData.mainChallenges,
        full_name: mockOnboardingData.fullName,
        phone_number: mockOnboardingData.phoneNumber,
        communication_prefs: mockOnboardingData.communicationPrefs,
        location: mockOnboardingData.location,
        soil_type: mockOnboardingData.soilType,
        experience_level: mockOnboardingData.experienceLevel,
        farm_size: mockOnboardingData.farmSize,
        preferred_language: mockOnboardingData.preferredLanguage,
        has_organic_certification: mockOnboardingData.hasOrganicCertification,
        has_sustainable_practices: mockOnboardingData.hasSustainablePractices,
        marketing_consent: mockOnboardingData.marketingConsent,
      });

      // Verify the response is returned correctly
      expect(result).toEqual({
        success: true,
        data: mockResponse,
        error: null,
      });
    });

    it('should handle RPC errors', async () => {
      // Mock an RPC error
      const mockError = new Error('RPC failed');
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      const result = await completeOnboarding(mockOnboardingData);

      expect(result).toEqual({
        success: false,
        data: null,
        error: mockError,
      });
    });

    it('should handle network errors', async () => {
      // Mock a network error
      const mockError = new Error('Network error');
      (supabase.rpc as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await completeOnboarding(mockOnboardingData);

      expect(result).toEqual({
        success: false,
        data: null,
        error: mockError,
      });
    });

    it('should format dates correctly', async () => {
      // Mock a successful RPC response
      const mockResponse = {
        user_id: 'user-123',
        farm_id: 'farm-456',
      };
      
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const testData = {
        ...mockOnboardingData,
        plantingDate: new Date('2023-01-15'),
        harvestDate: new Date('2023-06-15'),
      };

      await completeOnboarding(testData);

      // Verify the dates were converted to ISO strings
      expect(supabase.rpc).toHaveBeenCalledWith(
        'complete_onboarding',
        expect.objectContaining({
          planting_date: '2023-01-15T00:00:00.000Z',
          harvest_date: '2023-06-15T00:00:00.000Z',
        })
      );
    });

    it('should handle string dates', async () => {
      // Mock a successful RPC response
      const mockResponse = {
        user_id: 'user-123',
        farm_id: 'farm-456',
      };
      
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const testData = {
        ...mockOnboardingData,
        plantingDate: '2023-01-15',
        harvestDate: '2023-06-15',
      };

      await completeOnboarding(testData);

      // Verify the string dates were converted to Date objects and then to ISO strings
      expect(supabase.rpc).toHaveBeenCalledWith(
        'complete_onboarding',
        expect.objectContaining({
          planting_date: expect.stringContaining('2023-01-15'),
          harvest_date: expect.stringContaining('2023-06-15'),
        })
      );
    });
  });
});
