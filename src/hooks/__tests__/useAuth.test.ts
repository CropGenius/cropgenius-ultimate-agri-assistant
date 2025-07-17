/**
 * INFINITY GOD MODE useAuth Hook Tests
 * Comprehensive test suite for authentication management hook
 * Testing secure authentication for 100M African farmers! 🚀🔥💪
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    })),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuth Hook - INFINITY GOD MODE Tests', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  // SUPREME test data for African farmer authentication
  const mockUser = {
    id: 'farmer-123',
    email: 'john.farmer@gmail.com',
    phone: '+254712345678',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    email_confirmed_at: '2025-01-15T10:00:00Z',
    phone_confirmed_at: '2025-01-15T10:00:00Z',
    last_sign_in_at: '2025-01-15T10:00:00Z',
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {
      full_name: 'John Farmer',
      avatar_url: 'https://example.com/avatar.jpg',
      location: 'Nairobi, Kenya',
    },
    aud: 'authenticated',
    role: 'authenticated',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockProfile = {
    id: 'farmer-123',
    full_name: 'John Farmer',
    avatar_url: 'https://example.com/avatar.jpg',
    location: 'Nairobi, Kenya',
    phone: '+254712345678',
    farm_size: 5.5,
    farm_type: 'Mixed Farming',
    preferred_crops: ['maize', 'beans', 'tomatoes'],
    experience_years: 10,
    education_level: 'secondary',
    primary_language: 'en',
    secondary_language: 'sw',
    farming_goals: ['increase_yield', 'reduce_costs'],
    technology_comfort: 'intermediate',
    internet_access: 'mobile_data',
    preferred_communication: 'whatsapp',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    onboarding_completed: true,
    subscription_tier: 'free',
    credits_balance: 50,
    total_credits_earned: 100,
    total_credits_spent: 50,
    referral_code: 'FARMER123',
    last_active: '2025-01-15T10:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('🚀 Authentication State Management', () => {
    it('should initialize with unauthenticated state', () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should initialize with authenticated state when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle auth state changes', async () => {
      const mockAuthStateChange = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        mockAuthStateChange.mockImplementation(callback);
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      renderHook(() => useAuth(), { wrapper });

      // Simulate auth state change to signed in
      act(() => {
        mockAuthStateChange('SIGNED_IN', mockSession);
      });

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('🔥 Sign In Functionality', () => {
    it('should sign in with email and password successfully', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn(
          'john.farmer@gmail.com',
          'securePassword123'
        );
        expect(response.success).toBe(true);
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'john.farmer@gmail.com',
        password: 'securePassword123',
      });

      expect(toast.success).toHaveBeenCalledWith('Welcome back, John Farmer! 🌾');
    });

    it('should handle sign in errors gracefully', async () => {
      const mockError = { message: 'Invalid login credentials' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn(
          'john.farmer@gmail.com',
          'wrongPassword'
        );
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid login credentials');
      });

      expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
    });

    it('should handle network errors during sign in', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn(
          'john.farmer@gmail.com',
          'password123'
        );
        expect(response.success).toBe(false);
        expect(response.error).toBe('Network error');
      });

      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  describe('💪 Sign Up Functionality', () => {
    it('should sign up new farmer successfully', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      const signUpData = {
        email: 'new.farmer@gmail.com',
        password: 'securePassword123',
        full_name: 'New Farmer',
        phone: '+254723456789',
        location: 'Kisumu, Kenya',
      };

      await act(async () => {
        const response = await result.current.signUp(signUpData);
        expect(response.success).toBe(true);
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new.farmer@gmail.com',
        password: 'securePassword123',
        options: {
          data: {
            full_name: 'New Farmer',
            phone: '+254723456789',
            location: 'Kisumu, Kenya',
          },
        },
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Welcome to CropGenius! Please check your email to verify your account. 🌾'
      );
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already registered' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      const signUpData = {
        email: 'existing@gmail.com',
        password: 'password123',
        full_name: 'Test User',
      };

      await act(async () => {
        const response = await result.current.signUp(signUpData);
        expect(response.success).toBe(false);
        expect(response.error).toBe('Email already registered');
      });

      expect(toast.error).toHaveBeenCalledWith('Email already registered');
    });

    it('should validate sign up data before submission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const invalidSignUpData = {
        email: 'invalid-email',
        password: '123', // Too short
        full_name: '', // Empty
      };

      await act(async () => {
        const response = await result.current.signUp(invalidSignUpData);
        expect(response.success).toBe(false);
        expect(response.error).toContain('validation');
      });
    });
  });

  describe('🎯 Sign Out Functionality', () => {
    it('should sign out successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.success).toBe(true);
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Signed out successfully. See you soon! 👋');
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' };
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.success).toBe(false);
        expect(response.error).toBe('Sign out failed');
      });

      expect(toast.error).toHaveBeenCalledWith('Sign out failed');
    });
  });

  describe('🌟 Password Reset Functionality', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.resetPassword('farmer@example.com');
        expect(response.success).toBe(true);
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'farmer@example.com',
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      expect(toast.success).toHaveBeenCalledWith(
        'Password reset email sent! Check your inbox. 📧'
      );
    });

    it('should handle password reset errors', async () => {
      const mockError = { message: 'Email not found' };
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.resetPassword('nonexistent@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Email not found');
      });

      expect(toast.error).toHaveBeenCalledWith('Email not found');
    });
  });

  describe('🚀 Profile Management', () => {
    it('should update user profile successfully', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: { full_name: 'Updated Name' } } },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockProfile, full_name: 'Updated Name' },
          error: null,
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      const updateData = {
        full_name: 'Updated Name',
        location: 'Mombasa, Kenya',
        farm_size: 10.0,
      };

      await act(async () => {
        const response = await result.current.updateProfile(updateData);
        expect(response.success).toBe(true);
      });

      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully! 🌾');
    });

    it('should handle profile update errors', async () => {
      const mockError = { message: 'Update failed' };
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.updateProfile({ full_name: 'New Name' });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Update failed');
      });

      expect(toast.error).toHaveBeenCalledWith('Update failed');
    });

    it('should refresh profile data', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('💪 Loading States', () => {
    it('should show loading state during authentication operations', async () => {
      // Mock slow sign in
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { user: mockUser, session: mockSession },
          error: null,
        }), 1000))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.signIn('test@example.com', 'password');
      });

      expect(result.current.isSigningIn).toBe(true);
    });

    it('should show loading state during profile updates', async () => {
      vi.mocked(supabase.auth.updateUser).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { user: mockUser },
          error: null,
        }), 1000))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.updateProfile({ full_name: 'New Name' });
      });

      expect(result.current.isUpdatingProfile).toBe(true);
    });
  });

  describe('🎯 Session Management', () => {
    it('should handle session expiration', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 1000, // Expired
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSessionExpired).toBe(true);
      });
    });

    it('should refresh session when needed', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('🌟 Edge Cases and Error Handling', () => {
    it('should handle missing profile data gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
        expect(result.current.isAuthenticated).toBe(true); // Still authenticated even without profile
      });
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasError).toBe(true);
      });
    });

    it('should validate email format', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isValidEmail('valid@example.com')).toBe(true);
      expect(result.current.isValidEmail('invalid-email')).toBe(false);
      expect(result.current.isValidEmail('')).toBe(false);
    });

    it('should validate password strength', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isValidPassword('StrongPass123!')).toBe(true);
      expect(result.current.isValidPassword('weak')).toBe(false);
      expect(result.current.isValidPassword('')).toBe(false);
    });
  });

  describe('🚀 Real-World Farmer Scenarios', () => {
    it('should handle farmer registration with complete profile', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      const farmerData = {
        email: 'farmer@example.com',
        password: 'SecureFarm123!',
        full_name: 'John Farmer',
        phone: '+254712345678',
        location: 'Nairobi, Kenya',
        farm_size: 5.5,
        farm_type: 'Mixed Farming',
        preferred_crops: ['maize', 'beans'],
        experience_years: 10,
      };

      await act(async () => {
        const response = await result.current.signUp(farmerData);
        expect(response.success).toBe(true);
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: farmerData.email,
        password: farmerData.password,
        options: {
          data: {
            full_name: farmerData.full_name,
            phone: farmerData.phone,
            location: farmerData.location,
            farm_size: farmerData.farm_size,
            farm_type: farmerData.farm_type,
            preferred_crops: farmerData.preferred_crops,
            experience_years: farmerData.experience_years,
          },
        },
      });
    });

    it('should handle farmer profile updates with agricultural data', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      const agriculturalUpdate = {
        farm_size: 10.0,
        preferred_crops: ['maize', 'beans', 'tomatoes', 'onions'],
        farming_goals: ['increase_yield', 'reduce_costs', 'sustainable_practices'],
        technology_comfort: 'advanced',
        irrigation_type: 'drip',
        soil_type: 'clay_loam',
      };

      await act(async () => {
        const response = await result.current.updateProfile(agriculturalUpdate);
        expect(response.success).toBe(true);
      });
    });

    it('should handle offline authentication scenarios', async () => {
      // Mock network error
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn('farmer@example.com', 'password');
        expect(response.success).toBe(false);
        expect(response.error).toContain('network');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('network')
      );
    });
  });
});