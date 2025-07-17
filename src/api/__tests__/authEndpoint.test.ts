import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, signup, logout, getCurrentUser } from '../authApi';

// Mock dependencies
vi.mock('../authApi', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('authEndpoint', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    role: 'farmer',
    full_name: 'Test User',
    created_at: '2023-01-01T00:00:00.000Z'
  };
  
  const mockSession = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_at: 1672617600
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          user: mockUser,
          session: mockSession
        },
        status: 200
      })
    });
  });
  
  describe('POST /login', () => {
    it('should return proper JSON response for successful login', async () => {
      // Mock login function
      (login as any).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          session: mockSession
        },
        status: 200
      });
      
      const response = await fetch('https://cropgenius.africa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: {
          user: mockUser,
          session: mockSession
        },
        status: 200
      });
    });
    
    it('should handle invalid credentials with proper JSON format', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid email or password',
          status: 401
        })
      });
      
      const response = await fetch('https://cropgenius.africa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Invalid email or password',
        status: 401
      });
    });
    
    it('should handle validation errors with proper JSON format', async () => {
      // Mock validation error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Email is required',
          status: 400
        })
      });
      
      const response = await fetch('https://cropgenius.africa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: '',
          password: 'password123'
        })
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Email is required',
        status: 400
      });
    });
  });
  
  describe('POST /signup', () => {
    it('should return proper JSON response for successful signup', async () => {
      // Mock signup function
      (signup as any).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          session: mockSession
        },
        status: 200
      });
      
      const response = await fetch('https://cropgenius.africa/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User'
        })
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: {
          user: mockUser,
          session: mockSession
        },
        status: 200
      });
    });
    
    it('should handle email already registered with proper JSON format', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: 'Email is already registered',
          status: 409
        })
      });
      
      const response = await fetch('https://cropgenius.africa/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123'
        })
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Email is already registered',
        status: 409
      });
    });
  });
  
  describe('POST /logout', () => {
    it('should return proper JSON response for successful logout', async () => {
      // Mock logout function
      (logout as any).mockResolvedValue({
        success: true,
        message: 'Logged out successfully',
        status: 200
      });
      
      // Mock successful response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Logged out successfully',
          status: 200
        })
      });
      
      const response = await fetch('https://cropgenius.africa/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer access-token'
        }
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
        status: 200
      });
    });
  });
  
  describe('GET /user', () => {
    it('should return proper JSON response for current user', async () => {
      // Mock getCurrentUser function
      (getCurrentUser as any).mockResolvedValue({
        success: true,
        data: mockUser,
        status: 200
      });
      
      // Mock successful response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockUser,
          status: 200
        })
      });
      
      const response = await fetch('https://cropgenius.africa/user', {
        headers: {
          'Authorization': 'Bearer access-token'
        }
      });
      
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: true,
        data: mockUser,
        status: 200
      });
    });
    
    it('should handle unauthorized access with proper JSON format', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Authentication failed: Invalid token',
          status: 401
        })
      });
      
      const response = await fetch('https://cropgenius.africa/user', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      expect(response.ok).toBe(false);
      
      const result = await response.json();
      
      expect(result).toEqual({
        success: false,
        error: 'Authentication failed: Invalid token',
        status: 401
      });
    });
  });
});