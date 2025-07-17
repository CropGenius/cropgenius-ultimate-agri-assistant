import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOnboardingStep, updateOnboardingStep, getOnboardingProgress } from '../onboardingApi';
import { ApiResponseHandler } from '@/utils/apiResponse';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock ApiResponseHandler
vi.mock('@/utils/apiResponse', () => ({
  ApiResponseHandler: {
    success: vi.fn((data) => ({
      success: true,
      data,
      status: 200,
      timestamp: expect.any(String)
    })),
    error: vi.fn((message, status, details) => ({
      success: false,
      error: message,
      status: status || 500,
      ...(details && { details }),
      timestamp: expect.any(String)
    }))
  }
}));

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client';

describe('onboardingApi', () => {
  const mockUserId = 'user123';
  const mockStepId = 1;
  
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
        required: true
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true
      }
    ]
  };
  
  const mockUserData = {
    id: 'user123',
    full_name: 'John Doe',
    email: 'john@example.com'
  };
  
  const mockProgress = {
    user_id: 'user123',
    current_step: 1,
    total_steps: 6,
    completed_steps: []
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getOnboardingStep', () => {
    it('should return error if step ID is invalid', async () => {
      const result = await getOnboardingStep(0, mockUserId);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Invalid step ID', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error if user ID is missing', async () => {
      const result = await getOnboardingStep(mockStepId, '');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('User ID is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return step data with next button enabled if all required fields have values', async () => {
      // Mock Supabase responses
      (supabase.single as any)
        .mockResolvedValueOnce({ data: mockStep, error: null }) // Step data
        .mockResolvedValueOnce({ data: mockProgress, error: null }) // Progress data
        .mockResolvedValueOnce({ data: mockUserData, error: null }); // User data
      
      const result = await getOnboardingStep(mockStepId, mockUserId);
      
      expect(supabase.from).toHaveBeenCalledWith('onboarding_steps');
      expect(supabase.eq).toHaveBeenCalledWith('id', mockStepId);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith({
        ...mockStep,
        next_button_disabled: false,
        fields: mockStep.fields.map(field => ({
          ...field,
          value: mockUserData[field.id]
        }))
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.next_button_disabled).toBe(false);
    });
    
    it('should return step data with next button disabled if required fields are missing', async () => {
      // Mock Supabase responses
      (supabase.single as any)
        .mockResolvedValueOnce({ data: mockStep, error: null }) // Step data
        .mockResolvedValueOnce({ data: mockProgress, error: null }) // Progress data
        .mockResolvedValueOnce({ data: { id: 'user123', full_name: 'John Doe' }, error: null }); // User data missing email
      
      const result = await getOnboardingStep(mockStepId, mockUserId);
      
      expect(result.success).toBe(true);
      expect(result.data?.next_button_disabled).toBe(true);
    });
    
    it('should return error if step is not found', async () => {
      // Mock Supabase error response
      (supabase.single as any).mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      const result = await getOnboardingStep(mockStepId, mockUserId);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(`Onboarding step ${mockStepId} not found`, 404);
      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });
  
  describe('updateOnboardingStep', () => {
    const mockFieldValues = {
      full_name: 'John Doe',
      email: 'john@example.com'
    };
    
    it('should validate field values and return validation errors', async () => {
      // Mock Supabase responses
      (supabase.single as any).mockResolvedValueOnce({ data: mockStep, error: null }); // Step data
      
      const result = await updateOnboardingStep(mockStepId, mockUserId, { full_name: 'John Doe', email: 'invalid-email' });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Validation failed', 400, {
        validation_errors: { email: 'Invalid email format' }
      });
      
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.details?.validation_errors).toBeDefined();
    });
    
    it('should update user profile and onboarding progress', async () => {
      // Mock getOnboardingStep to be called at the end
      vi.spyOn(global, 'getOnboardingStep').mockImplementation(() => 
        Promise.resolve(ApiResponseHandler.success({
          ...mockStep,
          next_button_disabled: false,
          fields: mockStep.fields.map(field => ({
            ...field,
            value: mockFieldValues[field.id]
          }))
        }))
      );
      
      // Mock Supabase responses
      (supabase.single as any)
        .mockResolvedValueOnce({ data: mockStep, error: null }) // Step data
        .mockResolvedValueOnce({ data: mockUserData, error: null }) // Update result
        .mockResolvedValueOnce({ data: mockProgress, error: null }); // Progress data
      
      (supabase.update as any).mockReturnThis();
      (supabase.insert as any).mockReturnThis();
      
      const result = await updateOnboardingStep(mockStepId, mockUserId, mockFieldValues);
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.update).toHaveBeenCalledWith(mockFieldValues);
      expect(supabase.eq).toHaveBeenCalledWith('id', mockUserId);
      
      expect(supabase.from).toHaveBeenCalledWith('onboarding_progress');
      
      expect(result.success).toBe(true);
    });
    
    it('should create new progress record if none exists', async () => {
      // Mock getOnboardingStep to be called at the end
      vi.spyOn(global, 'getOnboardingStep').mockImplementation(() => 
        Promise.resolve(ApiResponseHandler.success({
          ...mockStep,
          next_button_disabled: false,
          fields: mockStep.fields.map(field => ({
            ...field,
            value: mockFieldValues[field.id]
          }))
        }))
      );
      
      // Mock Supabase responses
      (supabase.single as any)
        .mockResolvedValueOnce({ data: mockStep, error: null }) // Step data
        .mockResolvedValueOnce({ data: mockUserData, error: null }) // Update result
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // No progress data
      
      (supabase.update as any).mockReturnThis();
      (supabase.insert as any).mockReturnThis();
      
      const result = await updateOnboardingStep(mockStepId, mockUserId, mockFieldValues);
      
      expect(supabase.from).toHaveBeenCalledWith('onboarding_progress');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        current_step: mockStepId + 1,
        completed_steps: [mockStepId],
        total_steps: 6
      });
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('getOnboardingProgress', () => {
    it('should return error if user ID is missing', async () => {
      const result = await getOnboardingProgress('');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('User ID is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return progress data if it exists', async () => {
      // Mock Supabase response
      (supabase.single as any).mockResolvedValue({ data: mockProgress, error: null });
      
      const result = await getOnboardingProgress(mockUserId);
      
      expect(supabase.from).toHaveBeenCalledWith('onboarding_progress');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(mockProgress);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
    });
    
    it('should return default progress if none exists', async () => {
      // Mock Supabase error response for not found
      (supabase.single as any).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      const result = await getOnboardingProgress(mockUserId);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith({
        current_step: 1,
        total_steps: 6,
        completed_steps: [],
        user_id: mockUserId
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.current_step).toBe(1);
    });
  });
});