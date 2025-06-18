import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  exchangeCodeForSession,
  debugAuthState,
  refreshSession,
  isSessionValid,
  getUserProfile,
  updateUserProfile,
  signOut
} from '@/utils/authService';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis()
  }
}));

// Mock localStorage
vi.stubGlobal('localStorage', {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn()
});

// Mock console methods
vi.stubGlobal('console', {
  log: vi.fn(),
  error: vi.fn()
});

// Mock window.location
vi.stubGlobal('window', {
  location: {
    search: '?code=test-code'
  }
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exchangeCodeForSession', () => {
    it('should successfully exchange code for session', async () => {
      const mockResponse = { data: { user: { id: 'user-id' }, session: { user: { id: 'user-id' } } }, error: null };
      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue(mockResponse);

      const result = await exchangeCodeForSession();

      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('?code=test-code');
      expect(result.data).toEqual(mockResponse.data);
      expect(result.error).toBeNull();
    });

    it('should handle error during code exchange', async () => {
      const mockError = { message: 'Auth error', status: 400 };
      vi.mocked(supabase.auth.exchangeCodeForSession).mockRejectedValue(mockError);

      const result = await exchangeCodeForSession();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Auth error');
      expect(result.status).toBe(500); // Default status when not provided
    });

    it('should retry on rate limit errors', async () => {
      const mockError = { message: 'Rate limited', status: 429 };
      const mockSuccess = { data: { session: { user: { id: 'user-id' } } }, error: null };

      vi.mocked(supabase.auth.exchangeCodeForSession)
        .mockRejectedValueOnce({ error: mockError })
        .mockResolvedValueOnce(mockSuccess);

      const result = await exchangeCodeForSession(2);

      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockSuccess.data);
    });
  });

  describe('debugAuthState', () => {
    it('should return session data when available', async () => {
      const mockSession = {
        session: {
          user: { id: 'user-id', email: 'user@example.com', app_metadata: { provider: 'google' } },
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }
      };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: mockSession, error: null });

      const result = await debugAuthState();

      expect(result?.data).toEqual(mockSession);
      expect(result?.error).toBeNull();
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle errors when fetching session', async () => {
      const mockError = { message: 'Session error' };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: mockError });

      const result = await debugAuthState();

      expect(result?.data).toBeNull();
      expect(result?.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isSessionValid', () => {
    it('should return true for valid non-expiring session', async () => {
      const mockSession = {
        session: {
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }
      };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: mockSession, error: null });

      const result = await isSessionValid();

      expect(result).toBe(true);
    });

    it('should attempt refresh for soon-to-expire session', async () => {
      const mockSession = {
        session: {
          expires_at: Math.floor(Date.now() / 1000) + 60 // 1 minute from now
        }
      };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: mockSession, error: null });
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession.session }, 
        error: null
      });

      const result = await isSessionValid();

      expect(supabase.auth.refreshSession).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });

      const result = await isSessionValid();

      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out and clear local storage', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await signOut();

      expect(localStorage.removeItem).toHaveBeenCalledWith('farmId');
      expect(localStorage.removeItem).toHaveBeenCalledWith('lastVisitedField');
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle errors during sign out', async () => {
      const mockError = { message: 'Sign out error' };
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });
});
