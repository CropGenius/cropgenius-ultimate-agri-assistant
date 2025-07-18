/**
 * 🚀 CROPGENIUS INFINITY IQ AUTHENTICATION SERVICE TESTS
 * Comprehensive test suite for bulletproof authentication service
 * Testing secure authentication for 100M African farmers! 🔥💪
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthenticationService, AuthErrorType, authService } from '../AuthenticationService';
import { supabase, SupabaseManager } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
  },
  SupabaseManager: {
    getInstanceId: vi.fn().mockReturnValue('test-instance-123'),
    healthCheck: vi.fn(),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('🚀 AuthenticationService - INFINITY IQ Tests', () => {
  let authServiceInstance: AuthenticationService;

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'farmer-123',
      email: 'john.farmer@gmail.com',
      created_at: '2025-01-15T10:00:00Z',
      app_metadata: { provider: 'google' },
      user_metadata: { full_name: 'John Farmer' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authServiceInstance = AuthenticationService.getInstance();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🌟 Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthenticationService.getInstance();
      const instance2 = AuthenticationService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(authService);
    });

    it('should initialize with default retry configuration', () => {
      const instance = AuthenticationService.getInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('🔥 Google OAuth Sign In', () => {
    it('should initiate Google OAuth successfully', async () => {
      const mockOAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: mockOAuthUrl },
        error: null,
      });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.data?.url).toBe(mockOAuthUrl);
      expect(result.metadata?.instanceId).toBe('test-instance-123');
      
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should use custom redirect URL when provided', async () => {
      const customRedirect = 'https://cropgenius.africa/custom-callback';
      const mockOAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: mockOAuthUrl },
        error: null,
      });

      const result = await authServiceInstance.signInWithGoogle(customRedirect);

      expect(result.success).toBe(true);
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: customRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should handle OAuth errors gracefully', async () => {
      const mockError = { message: 'OAuth provider error' };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: null },
        error: mockError,
      });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.OAUTH_ERROR);
      expect(result.error?.message).toBe('OAuth provider error');
      expect(result.error?.userMessage).toContain('Sign-in failed');
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle missing OAuth URL', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: null },
        error: null,
      });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('No OAuth URL returned');
    });

    it('should retry on network errors', async () => {
      // First two attempts fail, third succeeds
      vi.mocked(supabase.auth.signInWithOAuth)
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { url: 'https://oauth.url' },
          error: null,
        });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.metadata?.attempts).toBe(3);
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(3);
    });
  });

  describe('🔄 Session Management', () => {
    it('should refresh session successfully', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authServiceInstance.refreshSession();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('should handle session refresh errors', async () => {
      const mockError = { message: 'Session expired' };
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await authServiceInstance.refreshSession();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.SESSION_EXPIRED);
      expect(result.error?.message).toBe('Session expired');
    });

    it('should get current session successfully', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authServiceInstance.getCurrentSession();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
    });

    it('should handle null session gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authServiceInstance.getCurrentSession();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should exchange code for session successfully', async () => {
      const authCode = 'auth-code-123';
      
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authServiceInstance.exchangeCodeForSession(authCode);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(authCode);
    });

    it('should handle code exchange errors', async () => {
      const authCode = 'invalid-code';
      const mockError = { message: 'Invalid authorization code' };
      
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await authServiceInstance.exchangeCodeForSession(authCode);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid authorization code');
    });
  });

  describe('🚪 Sign Out Functionality', () => {
    it('should sign out successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await authServiceInstance.signOut();

      expect(result.success).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' };
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      });

      const result = await authServiceInstance.signOut();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Sign out failed');
    });
  });

  describe('🏥 Health Check System', () => {
    it('should perform health check successfully', async () => {
      vi.mocked(SupabaseManager.healthCheck).mockResolvedValue({
        connected: true,
        latency: 150,
        error: null,
      });

      const result = await authServiceInstance.healthCheck();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.latency).toBe(150);
      expect(SupabaseManager.healthCheck).toHaveBeenCalledWith(1);
    });

    it('should handle health check failures', async () => {
      vi.mocked(SupabaseManager.healthCheck).mockResolvedValue({
        connected: false,
        error: 'Connection timeout',
      });

      const result = await authServiceInstance.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Connection timeout');
    });

    it('should handle health check exceptions', async () => {
      vi.mocked(SupabaseManager.healthCheck).mockRejectedValue(
        new Error('Health check failed')
      );

      const result = await authServiceInstance.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Health check failed');
    });
  });

  describe('🔥 Error Classification System', () => {
    it('should classify API key errors correctly', async () => {
      const apiKeyError = { message: 'Invalid API key', status: 401 };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(apiKeyError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.INVALID_API_KEY);
      expect(result.error?.code).toBe('AUTH_001');
      expect(result.error?.retryable).toBe(false);
      expect(result.error?.userMessage).toContain('temporarily unavailable');
    });

    it('should classify network errors correctly', async () => {
      const networkError = new Error('Failed to fetch');
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(networkError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.NETWORK_ERROR);
      expect(result.error?.code).toBe('AUTH_002');
      expect(result.error?.retryable).toBe(true);
      expect(result.error?.retryAfter).toBe(2000);
    });

    it('should classify OAuth errors correctly', async () => {
      const oauthError = { message: 'OAuth provider unavailable' };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(oauthError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.OAUTH_ERROR);
      expect(result.error?.code).toBe('AUTH_003');
      expect(result.error?.retryable).toBe(true);
    });

    it('should classify session expired errors correctly', async () => {
      const sessionError = { message: 'Session expired' };
      
      vi.mocked(supabase.auth.refreshSession).mockRejectedValue(sessionError);

      const result = await authServiceInstance.refreshSession();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.SESSION_EXPIRED);
      expect(result.error?.code).toBe('AUTH_004');
      expect(result.error?.retryable).toBe(false);
    });

    it('should classify rate limit errors correctly', async () => {
      const rateLimitError = { message: 'Rate limit exceeded', status: 429 };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(rateLimitError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.RATE_LIMITED);
      expect(result.error?.code).toBe('AUTH_005');
      expect(result.error?.retryable).toBe(true);
      expect(result.error?.retryAfter).toBe(5000);
    });

    it('should classify unknown errors correctly', async () => {
      const unknownError = new Error('Something went wrong');
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(unknownError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.UNKNOWN_ERROR);
      expect(result.error?.code).toBe('AUTH_999');
      expect(result.error?.retryable).toBe(true);
    });
  });

  describe('💪 Retry Logic and Resilience', () => {
    it('should implement exponential backoff', async () => {
      const startTime = Date.now();
      
      // Mock multiple failures then success
      vi.mocked(supabase.auth.signInWithOAuth)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { url: 'https://oauth.url' },
          error: null,
        });

      const result = await authServiceInstance.signInWithGoogle();
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.metadata?.attempts).toBe(3);
      // Should have some delay due to exponential backoff
      expect(duration).toBeGreaterThan(1000);
    });

    it('should respect retry limits', async () => {
      // Mock all attempts to fail
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(
        new Error('Persistent network error')
      );

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.metadata?.attempts).toBe(3); // Default max attempts
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const apiKeyError = { message: 'Invalid API key', status: 401 };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(apiKeyError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.metadata?.attempts).toBe(1); // Should not retry
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    });

    it('should handle offline scenarios', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const networkError = new Error('Failed to fetch');
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(networkError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(AuthErrorType.NETWORK_ERROR);
      expect(result.error?.userMessage).toContain('internet connection');
    });
  });

  describe('🌟 Performance and Metadata', () => {
    it('should track operation latency', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            data: { url: 'https://oauth.url' },
            error: null,
          }), 100)
        )
      );

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.metadata?.latency).toBeGreaterThan(90);
      expect(result.metadata?.instanceId).toBe('test-instance-123');
    });

    it('should include attempt count in metadata', async () => {
      vi.mocked(supabase.auth.signInWithOAuth)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { url: 'https://oauth.url' },
          error: null,
        });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.metadata?.attempts).toBe(2);
    });
  });

  describe('🚀 Real-World Farmer Scenarios', () => {
    it('should handle farmer sign-in from rural Kenya with poor connectivity', async () => {
      // Simulate poor connectivity with intermittent failures
      vi.mocked(supabase.auth.signInWithOAuth)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce({
          data: { url: 'https://accounts.google.com/oauth/...' },
          error: null,
        });

      const result = await authServiceInstance.signInWithGoogle(
        'https://cropgenius.africa/auth/callback'
      );

      expect(result.success).toBe(true);
      expect(result.metadata?.attempts).toBe(3);
      expect(result.data?.url).toContain('accounts.google.com');
    });

    it('should handle OAuth callback processing for new farmer', async () => {
      const authCode = 'farmer_auth_code_from_google';
      
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
        data: { 
          session: {
            ...mockSession,
            user: {
              ...mockSession.user,
              email: 'new.farmer@gmail.com',
              user_metadata: {
                full_name: 'New Farmer',
                picture: 'https://lh3.googleusercontent.com/...',
              },
            },
          }
        },
        error: null,
      });

      const result = await authServiceInstance.exchangeCodeForSession(authCode);

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('new.farmer@gmail.com');
      expect(result.data?.user.user_metadata.full_name).toBe('New Farmer');
    });

    it('should handle session refresh for long-term farmer users', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { 
          session: {
            ...expiredSession,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // New expiry
            access_token: 'new-access-token',
          }
        },
        error: null,
      });

      const result = await authServiceInstance.refreshSession();

      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBe('new-access-token');
      expect(result.data?.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should handle farmer sign-out from mobile device', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await authServiceInstance.signOut();

      expect(result.success).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('🔒 Security and Edge Cases', () => {
    it('should handle malformed OAuth responses', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: undefined },
        error: null,
      });

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('No OAuth URL returned');
    });

    it('should handle corrupted session data', async () => {
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authServiceInstance.exchangeCodeForSession('valid-code');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('No session returned from code exchange');
    });

    it('should include security metadata in error responses', async () => {
      const securityError = { message: 'Suspicious activity detected' };
      
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(securityError);

      const result = await authServiceInstance.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error?.instanceId).toBe('test-instance-123');
      expect(result.error?.timestamp).toBeDefined();
      expect(result.metadata?.instanceId).toBe('test-instance-123');
    });
  });
});