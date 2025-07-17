import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  withApiErrorHandling, 
  ensureJsonResponse, 
  fetchJson,
  validateRequestData
} from '../apiRequestHandler';
import { ApiResponseHandler } from '../apiResponse';

// Mock the ApiResponseHandler
vi.mock('../apiResponse', () => ({
  ApiResponseHandler: {
    error: vi.fn().mockImplementation((error, status, details) => ({
      success: false,
      error: typeof error === 'string' ? error : error.message,
      status: status || 500,
      details,
      timestamp: new Date().toISOString()
    })),
    success: vi.fn().mockImplementation((data) => ({
      success: true,
      data,
      status: 200,
      timestamp: new Date().toISOString()
    }))
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('apiRequestHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });
  
  describe('withApiErrorHandling', () => {
    it('should return the result of the request function if successful', async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: 'test' });
      
      const result = await withApiErrorHandling(requestFn);
      
      expect(requestFn).toHaveBeenCalled();
      expect(result).toEqual({ data: 'test' });
    });
    
    it('should handle errors and format them properly', async () => {
      const error = new Error('Test error');
      const requestFn = vi.fn().mockRejectedValue(error);
      
      await expect(withApiErrorHandling(requestFn)).rejects.toEqual({
        success: false,
        error: 'Test error',
        status: 500,
        timestamp: expect.any(String)
      });
      
      expect(console.error).toHaveBeenCalledWith('API request error:', error);
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(error, 500);
    });
    
    it('should use custom error message for non-Error objects', async () => {
      const requestFn = vi.fn().mockRejectedValue('Something went wrong');
      
      await expect(withApiErrorHandling(requestFn, 'Custom error')).rejects.toEqual({
        success: false,
        error: 'Custom error',
        status: 500,
        timestamp: expect.any(String)
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Custom error', 500);
    });
    
    it('should use response status for Response errors', async () => {
      const response = new Response(null, { status: 404 });
      const requestFn = vi.fn().mockRejectedValue(response);
      
      await expect(withApiErrorHandling(requestFn)).rejects.toEqual({
        success: false,
        error: 'API request failed',
        status: 404,
        timestamp: expect.any(String)
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('API request failed', 404);
    });
  });
  
  describe('ensureJsonResponse', () => {
    it('should parse JSON response and wrap it in success response', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        headers: { 'content-type': 'application/json' }
      });
      
      const result = await ensureJsonResponse(mockResponse);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith({ test: 'data' });
      expect(result).toEqual({
        success: true,
        data: { test: 'data' },
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should return API response as is if already formatted', async () => {
      const apiResponse = {
        success: true,
        data: { test: 'data' },
        status: 200,
        timestamp: new Date().toISOString()
      };
      
      const mockResponse = new Response(JSON.stringify(apiResponse), {
        headers: { 'content-type': 'application/json' }
      });
      
      const result = await ensureJsonResponse(mockResponse);
      
      expect(result).toEqual(apiResponse);
    });
    
    it('should handle empty responses (204)', async () => {
      const mockResponse = new Response(null, { status: 204 });
      
      const result = await ensureJsonResponse(mockResponse);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(null);
      expect(result).toEqual({
        success: true,
        data: null,
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle non-JSON responses', async () => {
      const mockResponse = new Response('Plain text', {
        headers: { 'content-type': 'text/plain' }
      });
      
      const result = await ensureJsonResponse(mockResponse);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(null);
      expect(result).toEqual({
        success: true,
        data: null,
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should handle error responses with JSON', async () => {
      const errorData = { message: 'Not found', code: 'RESOURCE_NOT_FOUND' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
      
      await expect(ensureJsonResponse(mockResponse)).rejects.toEqual({
        success: false,
        error: 'Not found',
        status: 404,
        details: errorData,
        timestamp: expect.any(String)
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Not found', 404, errorData);
    });
    
    it('should handle error responses without JSON', async () => {
      const mockResponse = new Response('Not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' }
      });
      
      await expect(ensureJsonResponse(mockResponse)).rejects.toEqual({
        success: false,
        error: 'HTTP error 404',
        status: 404,
        timestamp: expect.any(String)
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('HTTP error 404', 404);
    });
    
    it('should handle invalid JSON responses', async () => {
      const mockResponse = new Response('Invalid JSON', {
        headers: { 'content-type': 'application/json' }
      });
      
      await expect(ensureJsonResponse(mockResponse)).rejects.toEqual({
        success: false,
        error: 'Invalid JSON response',
        status: 500,
        timestamp: expect.any(String)
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Invalid JSON response', 500);
    });
  });
  
  describe('fetchJson', () => {
    it('should call fetch with correct options and process response', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        headers: { 'content-type': 'application/json' }
      });
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const result = await fetchJson('https://example.com/api');
      
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      expect(result).toEqual({
        success: true,
        data: { test: 'data' },
        status: 200,
        timestamp: expect.any(String)
      });
    });
    
    it('should merge custom headers with default headers', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        headers: { 'content-type': 'application/json' }
      });
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      await fetchJson('https://example.com/api', {
        headers: {
          'Authorization': 'Bearer token'
        }
      });
      
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer token'
        }
      });
    });
    
    it('should handle fetch errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      await expect(fetchJson('https://example.com/api')).rejects.toEqual({
        success: false,
        error: 'Network error',
        status: 500,
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('validateRequestData', () => {
    it('should return data if validation passes', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const validate = vi.fn().mockReturnValue({ valid: true });
      
      const result = validateRequestData(data, validate);
      
      expect(validate).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
    
    it('should throw formatted error if validation fails', () => {
      const data = { name: 'Test' };
      const errors = { email: 'Email is required' };
      const validate = vi.fn().mockReturnValue({ valid: false, errors });
      
      expect(() => validateRequestData(data, validate)).toThrow();
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith(
        'Validation failed',
        400,
        { validationErrors: errors }
      );
    });
  });
});