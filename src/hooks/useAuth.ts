import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, refreshSession, getUserProfile, isSessionValid } from '@/utils/authService';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/supabase';
import { toast } from 'sonner';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    profile: null,
    error: null
  });

  // Check if session is valid and refresh if needed
  const checkAndRefreshSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Get current session
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (!data.session) {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          profile: null,
          error: null
        });
        return;
      }

      // Check if session needs refresh
      const sessionValid = await isSessionValid();

      if (!sessionValid) {
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await refreshSession();

        if (refreshError || !refreshData?.session) {
          // Session refresh failed, user needs to login again
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            profile: null,
            error: new Error(refreshError || 'Session expired')
          });
          return;
        }

        // Use the refreshed session
        data.session = refreshData.session;
        data.user = refreshData.user;
      }

      // Fetch user profile if we have a valid user
      let profile = null;
      if (data.session?.user) {
        const { profile: userProfile } = await getUserProfile(data.session.user.id);
        profile = userProfile;
      }

      // Update auth state with all information
      setAuthState({
        user: data.session?.user || null,
        session: data.session,
        isLoading: false,
        isAuthenticated: !!data.session,
        profile,
        error: null
      });

    } catch (err: any) {
      console.error('Auth state error:', err);
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        profile: null,
        error: err instanceof Error ? err : new Error(err?.message || 'Authentication error')
      });
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    checkAndRefreshSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          let profile = null;
          if (session?.user) {
            const { profile: userProfile } = await getUserProfile(session.user.id);
            profile = userProfile;
          }

          setAuthState({
            user: session?.user || null,
            session,
            isLoading: false,
            isAuthenticated: !!session,
            profile,
            error: null
          });

          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            profile: null,
            error: null
          });
        }
      }
    );

    // Set up a session refresh interval
    const refreshInterval = setInterval(() => {
      if (authState.isAuthenticated) {
        checkAndRefreshSession();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => {
      // Clean up listeners
      authListener.subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [checkAndRefreshSession, authState.isAuthenticated]);

  return authState;
}

export default useAuth;
