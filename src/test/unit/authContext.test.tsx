import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

// Test component that uses the auth hook
const TestComponent = () => {
  const { user, session, isLoading, signOut } = useAuth();
  
  useEffect(() => {
    // This will help us test if the auth state is being set
  }, [user, session, isLoading]);
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="is-loading">{isLoading ? 'loading' : 'ready'}</div>
      <button onClick={() => signOut()} data-testid="sign-out">Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
    app_metadata: { provider: 'email' },
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    user: mockUser,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    expires_in: 3600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock supabase auth with proper types
    const mockUnsubscribe = vi.fn();
    const mockOnAuthStateChange = vi.fn().mockImplementation((callback: any) => {
      // Simulate auth state change
      callback('SIGNED_IN', mockSession);
      return { 
        data: { 
          subscription: { 
            id: 'test-subscription',
            callback: vi.fn(),
            unsubscribe: mockUnsubscribe,
          } 
        } 
      };
    });
    
    // @ts-expect-error - Mocking the supabase auth
    supabase.auth = {
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      onAuthStateChange: mockOnAuthStateChange,
      signOut: vi.fn().mockResolvedValue({ error: null }),
    };
    
    // Clear localStorage
    localStorage.clear();
  });

  it('provides auth context with initial values', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    // Initial render should show loading state
    expect(screen.getByTestId('is-loading')).toHaveTextContent('loading');
    
    // After auth state is set, should show user email
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });
  
  it('handles sign out', async () => {
    const { user } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth state
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Click sign out
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutButton);
    
    // Check if signOut was called
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    
    // After sign out, user should be null
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });
  
  it('handles auth state changes', async () => {
    let authCallback: any;
    
    // Mock onAuthStateChange to call the callback later
    // @ts-ignore - Mocking the supabase auth
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Simulate user signing in
    await act(async () => {
      authCallback('SIGNED_IN', {
        ...mockSession,
        user: { ...mockUser, email: 'new@example.com' },
      });
    });
    
    // Check if the user was updated
    expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    
    // Simulate user signing out
    await act(async () => {
      authCallback('SIGNED_OUT', null);
    });
    
    // Check if the user was cleared
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });
  
  it('handles session refresh', async () => {
    // Mock getSession to return a new session
    // @ts-ignore - Mocking the supabase auth
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { 
        session: { 
          ...mockSession, 
          user: { ...mockUser, email: 'refreshed@example.com' } 
        } 
      } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Check if the refreshed user is used
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('refreshed@example.com');
    });
  });
});

// Helper function to wait for async updates
const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  const check = () => {
    try {
      callback();
      return true;
    } catch (error) {
      if (Date.now() - start > timeout) {
        throw error;
      }
      return false;
    }
  };
  
  while (!check()) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};
