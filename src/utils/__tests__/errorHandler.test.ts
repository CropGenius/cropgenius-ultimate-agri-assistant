import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleError, handleAuthError, handleNetworkError, AppError } from '../errorHandler';
import { ApiResponseHandler } from '../apiResponse';

// Mock the ApiResponseHandler
vi.mock('../apiResponse', () => ({
  ApiResponseHandler: {
    error: vi.fn().mockImplementation((error, status, details) => ({
      success: false,
      error: typeof error === 'string' ? error : error.message,
      status: status || 500,
      details,
      timestamp: expect.any(String)
    }))
  }
}));

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    console.error = vi.fn();
    console.warn = vi.fn();
    
    // Mock import.meta.env.DEV
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true }
    });
  });
  
  describe('handleError', () => {
    it('should log error in development mode', () => {
      const error = new Error('Test error');
      const context = { source: 'test' };
      
      handleError(error, context);
      
      expect(console.error).toHaveBeenCalledWith('Error:', error.message, context);
    });
    
    it('should return standardized error response', () => {
      const error = new Error('Test error');
      const context = { source: 'test' };
      
      const result = handleError(error, context);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(error, 500, context);
      expect(result).toEqual({
        success: false,
        error: 'Test error',
        status: 500,
        details: context,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle AppError with custom code', () => {
      const error = new AppError('Custom error', 'CUSTOM_ERROR', { field: 'test' });
      
      handleError(error);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(error, 500, undefined);
    });
  });
  
  describe('handleAuthError', () => {
    it('should log auth error in development mode', () => {
      const error = { message: 'Auth failed' };
      
      handleAuthError(error);
      
      expect(console.warn).toHaveBeenCalledWith('Auth error:', error);
    });
    
    it('should return sign in message for 401 errors', () => {
      const error = { message: '401 Unauthorized' };
      
      const result = handleAuthError(error);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Please sign in to continue', 401);
      expect(result.error).toBe('Please sign in to continue');
      expect(result.status).toBe(401);
    });
    
    it('should return generic auth error for other auth errors', () => {
      const error = { message: 'Invalid token' };
      
      const result = handleAuthError(error);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Authentication issue. Please try again.', 401);
      expect(result.error).toBe('Authentication issue. Please try again.');
      expect(result.status).toBe(401);
    });
  });
  
  describe('handleNetworkError', () => {
    it('should log network error in development mode', () => {
      const error = { message: 'Network failed' };
      
      handleNetworkError(error);
      
      expect(console.warn).toHaveBeenCalledWith('Network error:', error);
    });
    
    it('should return standardized network error response', () => {
      const error = { message: 'Network failed' };
      
      const result = handleNetworkError(error);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(
        'Network issue. Please check your connection.',
        503,
        { retryable: true, offline: expect.any(Boolean) }
      );
      expect(result.error).toBe('Network issue. Please check your connection.');
      expect(result.status).toBe(503);
      expect(result.details).toEqual({ retryable: true, offline: expect.any(Boolean) });
    });
  });
});