import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import Auth from '@/pages/Auth';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_IN', { user: { id: 'test-user' } });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user' } } } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage between tests
    localStorage.clear();
  });

  it('should render the login page', () => {
    render(<Auth />);
    expect(screen.getByText('Welcome to CropGenius')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('should call signInWithOAuth when Google sign-in button is clicked', async () => {
    const { user } = render(<Auth />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with google/i });
    await user.click(signInButton);
    
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/callback'),
      },
    });
  });

  it('should handle authentication state changes', async () => {
    render(<Auth />);
    
    // The onAuthStateChange mock is called on component mount
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    
    // The callback should be called with 'SIGNED_IN' event
    // This is handled by our mock implementation
    await waitFor(() => {
      expect(screen.queryByText('Welcome to CropGenius')).not.toBeInTheDocument();
    });
  });
});
