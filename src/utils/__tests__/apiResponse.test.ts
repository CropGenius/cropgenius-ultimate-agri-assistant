import { describe, it, expect } from 'vitest';
import { ApiResponseHandler, HTTP_STATUS, isApiResponse } from '../apiResponse';

describe('ApiResponseHandler', () => {
  describe('success', () => {
    it('should create a successful response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = ApiResponseHandler.success(data);
      
      expect(response).toEqual({
        success: true,
        data,
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should include optional message when provided', () => {
      const data = { id: 1 };
      const message = 'Operation successful';
      const response = ApiResponseHandler.success(data, message);
      
      expect(response).toEqual({
        success: true,
        data,
        message,
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should use custom status code when provided', () => {
      const data = { id: 1 };
      const response = ApiResponseHandler.success(data, undefined, HTTP_STATUS.CREATED);
      
      expect(response.status).toBe(HTTP_STATUS.CREATED);
    });
  });
  
  describe('error', () => {
    it('should create an error response from string', () => {
      const errorMessage = 'Something went wrong';
      const response = ApiResponseHandler.error(errorMessage);
      
      expect(response).toEqual({
        success: false,
        error: errorMessage,
        status: 500,
        timestamp: expect.any(String)
      });
    });
    
    it('should create an error response from Error object', () => {
      const error = new Error('Database connection failed');
      const response = ApiResponseHandler.error(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Database connection failed',
        status: 500,
        timestamp: expect.any(String)
      });
    });
    
    it('should include error type in details for custom errors', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error occurred');
      const response = ApiResponseHandler.error(error);
      
      expect(response.details).toEqual({ errorType: 'CustomError' });
    });
    
    it('should use custom status code when provided', () => {
      const response = ApiResponseHandler.error('Not found', HTTP_STATUS.NOT_FOUND);
      
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });
    
    it('should include custom details when provided', () => {
      const details = { field: 'email', constraint: 'required' };
      const response = ApiResponseHandler.error('Validation failed', HTTP_STATUS.BAD_REQUEST, details);
      
      expect(response.details).toEqual(details);
    });
  });
  
  describe('handleSupabaseError', () => {
    it('should handle Supabase not found error', () => {
      const error = { code: 'PGRST116', message: 'No rows returned' };
      const response = ApiResponseHandler.handleSupabaseError(error);
      
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.error).toContain('No data found');
    });
    
    it('should handle Supabase unauthorized error', () => {
      const error = { code: 'PGRST301', message: 'Unauthorized' };
      const response = ApiResponseHandler.handleSupabaseError(error);
      
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.error).toContain('Unauthorized access');
    });
    
    it('should include context in error message when provided', () => {
      const error = { message: 'Database error' };
      const context = 'User creation';
      const response = ApiResponseHandler.handleSupabaseError(error, context);
      
      expect(response.error).toBe('User creation: Database error');
    });
  });
  
  describe('validate', () => {
    it('should ensure required fields are present', () => {
      const incompleteResponse = { success: true } as any;
      const validatedResponse = ApiResponseHandler.validate(incompleteResponse);
      
      expect(validatedResponse).toHaveProperty('status', 200);
      expect(validatedResponse).toHaveProperty('timestamp');
    });
    
    it('should set default status based on success flag', () => {
      const errorResponse = { success: false } as any;
      const validatedResponse = ApiResponseHandler.validate(errorResponse);
      
      expect(validatedResponse.status).toBe(500);
    });
  });
  
  describe('paginated', () => {
    it('should create a paginated response', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 10;
      const page = 1;
      const limit = 3;
      
      const response = ApiResponseHandler.paginated(items, total, page, limit);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: 4,
          hasNext: true,
          hasPrev: false
        }
      });
    });
    
    it('should calculate pagination values correctly', () => {
      const response = ApiResponseHandler.paginated([], 20, 2, 5);
      
      expect(response.data?.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 20,
        totalPages: 4,
        hasNext: true,
        hasPrev: true
      });
    });
  });
  
  describe('isApiResponse', () => {
    it('should return true for valid ApiResponse objects', () => {
      const response = ApiResponseHandler.success({ test: true });
      
      expect(isApiResponse(response)).toBe(true);
    });
    
    it('should return false for non-ApiResponse objects', () => {
      expect(isApiResponse(null)).toBe(false);
      expect(isApiResponse({})).toBe(false);
      expect(isApiResponse({ success: true })).toBe(false);
    });
  });
  
  describe('ensureJsonResponse', () => {
    it('should wrap successful handler results in ApiResponse', async () => {
      const handler = () => ({ id: 1, name: 'Test' });
      const wrappedHandler = ensureJsonResponse(handler);
      
      const result = await wrappedHandler();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
    });
    
    it('should handle errors and return error ApiResponse', async () => {
      const handler = () => { throw new Error('Test error'); };
      const wrappedHandler = ensureJsonResponse(handler);
      
      const result = await wrappedHandler();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
    
    it('should pass through existing ApiResponse objects', async () => {
      const customResponse = ApiResponseHandler.success({ custom: true }, 'Custom message');
      const handler = () => customResponse;
      const wrappedHandler = ensureJsonResponse(handler);
      
      const result = await wrappedHandler();
      
      expect(result).toEqual(customResponse);
    });
  });
});