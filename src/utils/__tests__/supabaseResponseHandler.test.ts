import { describe, it, expect, vi } from 'vitest';
import { 
  handleSupabaseResponse, 
  withSupabaseResponse,
  handleSupabaseRpcResponse,
  handleSupabaseAuthResponse,
  handleSupabaseStorageResponse
} from '../supabaseResponseHandler';

describe('supabaseResponseHandler', () => {
  describe('handleSupabaseResponse', () => {
    it('should return success response when data is present', () => {
      const data = { id: 1, name: 'Test' };
      const result = handleSupabaseResponse({ data, error: null });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.status).toBe(200);
    });
    
    it('should return error response when error is present', () => {
      const error = { message: 'Database error', code: 'PGRST301' };
      const result = handleSupabaseResponse({ data: null, error });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access');
      expect(result.status).toBe(401);
    });
    
    it('should return not found response when data is null', () => {
      const result = handleSupabaseResponse({ data: null, error: null });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No data found');
      expect(result.status).toBe(404);
    });
    
    it('should include context in error message when provided', () => {
      const context = 'User fetch';
      const result = handleSupabaseResponse({ data: null, error: null }, context);
      
      expect(result.error).toBe('User fetch: No data found');
    });
  });
  
  describe('withSupabaseResponse', () => {
    it('should handle successful query', async () => {
      const data = { id: 1, name: 'Test' };
      const queryFn = vi.fn().mockResolvedValue({ data, error: null });
      
      const result = await withSupabaseResponse(queryFn);
      
      expect(queryFn).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
    
    it('should handle query error', async () => {
      const error = { message: 'Database error', code: 'PGRST301' };
      const queryFn = vi.fn().mockResolvedValue({ data: null, error });
      
      const result = await withSupabaseResponse(queryFn);
      
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
    
    it('should handle thrown error', async () => {
      const queryFn = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await withSupabaseResponse(queryFn);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.status).toBe(500);
    });
  });
  
  describe('handleSupabaseRpcResponse', () => {
    it('should handle RPC response correctly', () => {
      const data = { result: 42 };
      const result = handleSupabaseRpcResponse({ data, error: null });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
    
    it('should handle RPC error correctly', () => {
      const error = { message: 'Function error', code: 'P0001' };
      const result = handleSupabaseRpcResponse({ data: null, error });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain(error.message);
    });
  });
  
  describe('handleSupabaseAuthResponse', () => {
    it('should handle successful auth response', () => {
      const user = { id: 'user123', email: 'test@example.com' };
      const result = handleSupabaseAuthResponse({ data: { user }, error: null });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
    
    it('should handle auth error', () => {
      const error = { message: 'Invalid credentials', status: 401 };
      const result = handleSupabaseAuthResponse({ data: null, error });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.status).toBe(401);
    });
    
    it('should handle missing user data', () => {
      const result = handleSupabaseAuthResponse({ data: { user: null } as any, error: null });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
      expect(result.status).toBe(401);
    });
  });
  
  describe('handleSupabaseStorageResponse', () => {
    it('should handle successful storage response', () => {
      const data = { path: 'images/avatar.jpg' };
      const result = handleSupabaseStorageResponse({ data, error: null });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
    
    it('should handle storage error', () => {
      const error = { message: 'File too large', code: 'storage/object-too-large' };
      const result = handleSupabaseStorageResponse({ data: null, error });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain(error.message);
    });
  });
});