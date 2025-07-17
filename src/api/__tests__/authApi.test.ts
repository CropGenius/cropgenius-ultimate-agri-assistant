import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, signup, logout, getCurrentUser } from '../authApi';
import { ApiResponseHandler } from '@/utils/apiResponse';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock ApiResponseHandler
vi.mock('@/utils/apiResponse', () => ({
  ApiResponseHandler: {
    success: vi.fn((data, message, status) => ({
      success: true,
      data,
      message,
      status: status || 200,
      timestamp: expect.any(String)
    })),
    error: vi.fn((message, status) => ({
      success: false,
      error: message,
      status: status || 500,
      timestamp: expect.any(String)
    }))
  }
}));

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client';

describe('authApi', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-02T00:00:00.000Z'
  };
  
  const mockSession = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_at: 1672617600
  };
  
  const mockProfile = {
    id: 'user123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone_number: '+1234567890',
    role: 'farmer'
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('login', () => {
    it('should return error if email is missing', async () => {
      const result = await login({ email: '', password: 'password' });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Email is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error if password is missing', async () => {
      const result = await login({ email: 'test@example.com', password: '' });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Password is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error for invalid credentials', async () => {
      // Mock Supabase error response
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });
      
      const result = await login({ email: 'test@example.com', password: 'wrong-password' });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Invalid email or password', 401);
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
    
    it('should return user and session data for successful login', async () => {
      // Mock Supabase responses
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: mockProfile,
        error: null
      });
      
      const result = await login({ email: 'test@example.com', password: 'password' });
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.eq).toHaveBeenCalledWith('id', mockUser.id);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith({
        user: {
          ...mockUser,
          role: mockProfile.role,
          full_name: mockProfile.full_name,
          phone_number: mockProfile.phone_number
        },
        session: mockSession
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.session.access_token).toBe('access-token');
    });
  });
  
  describe('signup', () => {
    it('should validate email format', async () => {
      const result = await signup({
        email: 'invalid-email',
        password: 'password123'
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Invalid email format', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should validate password strength', async () => {
      const result = await signup({
        email: 'test@example.com',
        password: 'short'
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Password must be at least 8 characters long', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should handle already registered email', async () => {
      // Mock Supabase error response
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });
      
      const result = await signup({
        email: 'existing@example.com',
        password: 'password123'
      });
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Email is already registered', 409);
      expect(result.success).toBe(false);
      expect(result.status).toBe(409);
    });
    
    it('should create user profile for successful signup', async () => {
      // Mock Supabase responses
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      (supabase.insert as any).mockResolvedValue({
        error: null
      });
      
      const signupData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone_number: '+1234567890'
      };
      
      const result = await signup(signupData);
      
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signupData.email,
        password: signupData.password
      });
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.insert).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        full_name: signupData.full_name,
        phone_number: signupData.phone_number,
        role: 'farmer'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.user.role).toBe('farmer');
    });
  });
  
  describe('logout', () => {
    it('should return error if token is missing', async () => {
      const result = await logout('');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Access token is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return success for successful logout', async () => {
      // Mock Supabase response
      (supabase.auth.signOut as any).mockResolvedValue({
        error: null
      });
      
      const result = await logout('valid-token');
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(null, 'Logged out successfully');
      expect(result.success).toBe(true);
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return error if token is missing', async () => {
      const result = await getCurrentUser('');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Access token is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error for invalid token', async () => {
      // Mock Supabase error response
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });
      
      const result = await getCurrentUser('invalid-token');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Authentication failed: Invalid token', 401);
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
    
    it('should return user data for valid token', async () => {
      // Mock Supabase responses
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: mockProfile,
        error: null
      });
      
      const result = await getCurrentUser('valid-token');
      
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.eq).toHaveBeenCalledWith('id', mockUser.id);
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith({
        ...mockUser,
        role: mockProfile.role,
        full_name: mockProfile.full_name,
        phone_number: mockProfile.phone_number
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.role).toBe('farmer');
    });
  });
});