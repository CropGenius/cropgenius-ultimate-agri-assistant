import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOnboardingStep, updateOnboardingStep, getOnboardingProgress } from '../onboardingApi';

// Mock dependencies
vi.mock('../onboardingApi', () => ({
  getOnboardingStep: vi.fn(),
  updateOnboardingStep: vi.fn(),
  getOnboardingProgress: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('onboardingEndpoint', () => {
  const mockUserId = 'user123';
  const mockToken = 'valid-token';
  
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
    
    // Mock API functions
    (getOnboardingStep as any).mockResolvedValue({
      success: true,
      data: mockStep,
      status: 200
    });
    
    (updateOnboardingStep as any).mockResolvedValue({
      success: true,
      data: mockStep,
      status: 200
    });
    
    (getOnboardingProgress as any).mockResolvedValue({
      success: true,
      data: mockProgress,
      status: 200
    });
    
    // Mock fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockStep,
        status: 200
      })
    });
  });
  
  describe('GET /onboarding/:stepId', () => {
    it('should return proper JSON response for onboarding step', async () => {
      const response = await fetch(`https://cropgenius.africa/onboarding/1`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: mockStep,
        status: 200
      });
    });
    
    it('should handle error responses with proper JSON format', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: 'Onboarding step not found',
          status: 404
        })
      });
      
      const response = await fetch(`https://cropgenius.africa/onboarding/999`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Onboarding step not found',
        status: 404
      });
    });
  });
  
  describe('PUT /onboarding/:stepId', () => {
    it('should return proper JSON response when updating step', async () => {
      const fieldValues = {
        full_name: 'John Doe',
        email: 'john@example.com'
      };
      
      const response = await fetch(`https://cropgenius.africa/onboarding/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldValues)
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: mockStep,
        status: 200
      });
    });
    
    it('should return validation errors with proper JSON format', async () => {
      // Mock validation error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Validation failed',
          status: 400,
          details: {
            validation_errors: {
              email: 'Invalid email format'
            }
          }
        })
      });
      
      const fieldValues = {
        full_name: 'John Doe',
        email: 'invalid-email'
      };
      
      const response = await fetch(`https://cropgenius.africa/onboarding/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldValues)
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        status: 400,
        details: {
          validation_errors: {
            email: 'Invalid email format'
          }
        }
      });
    });
  });
  
  describe('GET /onboarding/progress', () => {
    it('should return proper JSON response for onboarding progress', async () => {
      const response = await fetch(`https://cropgenius.africa/onboarding/progress`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: mockProgress,
        status: 200
      });
    });
    
    it('should handle authentication errors with proper JSON format', async () => {
      // Mock authentication error
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Authentication required',
          status: 401
        })
      });
      
      const response = await fetch(`https://cropgenius.africa/onboarding/progress`);
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Authentication required',
        status: 401
      });
    });
  });
});