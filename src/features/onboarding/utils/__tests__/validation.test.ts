import { validateOnboardingStep } from '../validation';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

describe('Onboarding Form Validation', () => {
  describe('Step 1: Farm Vitals', () => {
    it('validates required fields', () => {
      const errors = validateOnboardingStep(0, {});
      
      expect(errors).toHaveProperty('farmName');
      expect(errors).toHaveProperty('totalArea');
      expect(errors.farmName).toBe('Farm name is required');
      expect(errors.totalArea).toBe('Total area is required');
    });

    it('validates total area is a positive number', () => {
      const errors = validateOnboardingStep(0, {
        ...mockOnboardingData,
        totalArea: '0',
      });
      
      expect(errors.totalArea).toBe('Total area must be greater than 0');
      
      const validErrors = validateOnboardingStep(0, {
        ...mockOnboardingData,
        totalArea: '10',
      });
      
      expect(validErrors.totalArea).toBeUndefined();
    });

    it('validates farm name length', () => {
      const errors = validateOnboardingStep(0, {
        ...mockOnboardingData,
        farmName: 'ab',
      });
      
      expect(errors.farmName).toBe('Farm name must be at least 3 characters');
      
      const validErrors = validateOnboardingStep(0, {
        ...mockOnboardingData,
        farmName: 'Valid Farm Name',
      });
      
      expect(validErrors.farmName).toBeUndefined();
    });
  });

  describe('Step 2: Crop Selection', () => {
    it('validates at least one crop is selected', () => {
      const errors = validateOnboardingStep(1, {
        ...mockOnboardingData,
        crops: [],
      });
      
      expect(errors.crops).toBe('Select at least one crop');
      
      const validErrors = validateOnboardingStep(1, {
        ...mockOnboardingData,
        crops: ['Wheat'],
      });
      
      expect(validErrors.crops).toBeUndefined();
    });

    it('validates planting and harvest dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const errors = validateOnboardingStep(1, {
        ...mockOnboardingData,
        plantingDate: futureDate.toISOString(),
        harvestDate: new Date().toISOString(),
      });
      
      expect(errors.harvestDate).toBe('Harvest date must be after planting date');
      
      const validErrors = validateOnboardingStep(1, {
        ...mockOnboardingData,
        plantingDate: new Date().toISOString(),
        harvestDate: futureDate.toISOString(),
      });
      
      expect(validErrors.harvestDate).toBeUndefined();
    });
  });

  describe('Step 3: Farm Infrastructure', () => {
    // This step is mostly optional, so no validation needed
    it('always passes validation', () => {
      const errors = validateOnboardingStep(2, {});
      expect(errors).toEqual({});
    });
  });

  describe('Step 4: Goals & Challenges', () => {
    it('validates primary goal is selected', () => {
      const errors = validateOnboardingStep(3, {
        ...mockOnboardingData,
        primaryGoal: '',
      });
      
      expect(errors.primaryGoal).toBe('Please select a primary goal');
      
      const validErrors = validateOnboardingStep(3, {
        ...mockOnboardingData,
        primaryGoal: 'maximize_yield',
      });
      
      expect(validErrors.primaryGoal).toBeUndefined();
    });

    it('validates at least one challenge is selected', () => {
      const errors = validateOnboardingStep(3, {
        ...mockOnboardingData,
        mainChallenges: [],
      });
      
      expect(errors.mainChallenges).toBe('Select at least one challenge');
      
      const validErrors = validateOnboardingStep(3, {
        ...mockOnboardingData,
        mainChallenges: ['pests'],
      });
      
      expect(validErrors.mainChallenges).toBeUndefined();
    });
  });

  describe('Step 5: Personal Details', () => {
    it('validates required personal details', () => {
      const errors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        fullName: '',
        phoneNumber: '',
      });
      
      expect(errors.fullName).toBe('Full name is required');
      expect(errors.phoneNumber).toBe('Phone number is required');
      
      const validErrors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        fullName: 'Test User',
        phoneNumber: '1234567890',
      });
      
      expect(validErrors.fullName).toBeUndefined();
      expect(validErrors.phoneNumber).toBeUndefined();
    });

    it('validates phone number format', () => {
      const errors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        phoneNumber: 'invalid',
      });
      
      expect(errors.phoneNumber).toBe('Enter a valid phone number');
      
      const validErrors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        phoneNumber: '1234567890',
      });
      
      expect(validErrors.phoneNumber).toBeUndefined();
    });

    it('validates at least one communication preference is selected', () => {
      const errors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        communicationPrefs: [],
      });
      
      expect(errors.communicationPrefs).toBe('Select at least one communication preference');
      
      const validErrors = validateOnboardingStep(4, {
        ...mockOnboardingData,
        communicationPrefs: ['email'],
      });
      
      expect(validErrors.communicationPrefs).toBeUndefined();
    });
  });

  describe('Unknown Step', () => {
    it('returns an empty error object for unknown steps', () => {
      const errors = validateOnboardingStep(99, {});
      expect(errors).toEqual({});
    });
  });
});
