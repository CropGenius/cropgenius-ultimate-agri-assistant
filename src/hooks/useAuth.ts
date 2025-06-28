import { useState, useEffect, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import { AppError, ErrorCode, reportError, reportWarning } from '@/lib/errors';
import { networkManager } from '@/lib/network';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  profileError: AppError | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasProfile: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const PROFILE_CACHE_KEY = 'auth_profile_cache';

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isLoadingProfile: false,
    isRefreshing: false,
    error: null,
    profileError: null,
    isAuthenticated: false,
    isOnboardingComplete: false,
    hasProfile: false,
  });

  const derivedState = useMemo(() => ({
    isAuthenticated: !!state.session,
    isOnboardingComplete: state.profile?.onboarding_completed ?? false,
    hasProfile: !!state.profile,
  }), [state.session, state.profile]);

  const cacheProfile = useCallback((profile: UserProfile | null) => {
    try {
      if (profile) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
    } catch (error) {
      reportWarning('Failed to cache profile data', { error });
    }
  }, []);

  const loadCachedProfile = useCallback((): UserProfile | null => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      reportWarning('Failed to load cached profile', { error });
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const operation = async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) {
          if (error.code === 'PGRST116') return null; // Not an error, just no profile
          throw error;
        }
        return data as UserProfile;
      };
      return await networkManager.executeWithRetry(operation);
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.NETWORK_FAILED);
      setState((prevState: AuthState) => ({ ...prevState, profileError: appError }));
      reportError(appError);
      return loadCachedProfile();
    }
  }, [loadCachedProfile]);

  useEffect(() => {
    let isMounted = true;

    // Immediately set loading state
    setState(prev => ({ ...prev, isLoading: true }));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Update session and user state
      setState(prev => ({ ...prev, session, user: session?.user || null, error: null, isLoading: false }));

      // Handle different auth events
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          setState(prev => ({ ...prev, isLoadingProfile: true }));
          const profile = await fetchProfile(session.user.id);
          if (isMounted) {
            setState(prev => ({ ...prev, profile, isLoadingProfile: false }));
            cacheProfile(profile);
            if (event === 'SIGNED_IN') {
              toast.success(`Welcome back, ${profile?.full_name || session.user.email}!`);
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({ ...prev, profile: null, error: null, profileError: null }));
        cacheProfile(null);
        toast.info('You have been signed out.');
      } else if (event === 'USER_UPDATED' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (isMounted) {
          setState(prev => ({ ...prev, profile }));
          cacheProfile(profile);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info('Password recovery email sent.');
      } else if (event === 'TOKEN_REFRESHED') {
        // Session has been refreshed.
        // You might want to re-fetch user-specific data here if needed.
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile, cacheProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prevState: AuthState) => ({ ...prevState, isLoading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      setState((prevState: AuthState) => ({ ...prevState, error: appError, isLoading: false }));
      reportError(appError);
      toast.error(appError.userMessage);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setState((prevState: AuthState) => ({ ...prevState, isLoading: true, error: null }));
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
      if (error) throw error;
      toast.success('Account created!', { description: 'Please check your email to verify.' });
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      setState((prevState: AuthState) => ({ ...prevState, error: appError, isLoading: false }));
      reportError(appError);
      toast.error(appError.userMessage);
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prevState: AuthState) => ({ ...prevState, isRefreshing: true }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.NETWORK_FAILED);
      setState((prevState: AuthState) => ({ ...prevState, error: appError, isRefreshing: false }));
      reportError(appError);
      toast.error(appError.userMessage);
    } finally {
      setState((prevState: AuthState) => ({ ...prevState, isRefreshing: false }));
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setState((prevState: AuthState) => ({ ...prevState, isRefreshing: true }));
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.AUTH_SESSION_EXPIRED);
      setState((prevState: AuthState) => ({ ...prevState, error: appError }));
      reportError(appError);
      await signOut();
    } finally {
      setState((prevState: AuthState) => ({ ...prevState, isRefreshing: false }));
    }
  }, [signOut]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    setState((prevState: AuthState) => ({ ...prevState, isLoadingProfile: true }));
    const profile = await fetchProfile(state.user.id);
    setState((prevState: AuthState) => ({ ...prevState, profile, isLoadingProfile: false }));
    cacheProfile(profile);
  }, [state.user, fetchProfile, cacheProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user) return;
    setState((prevState: AuthState) => ({ ...prevState, isLoadingProfile: true }));
    try {
      const operation = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', state.user!.id)
          .select()
          .single();
        if (error) throw error;
        return data as UserProfile;
      };
      const updatedProfile = await networkManager.executeWithRetry(operation);
      setState((prevState: AuthState) => ({ ...prevState, profile: updatedProfile, isLoadingProfile: false }));
      cacheProfile(updatedProfile);
      toast.success('Profile updated!');
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.NETWORK_FAILED);
      setState((prevState: AuthState) => ({ ...prevState, profileError: appError, isLoadingProfile: false }));
      reportError(appError);
      toast.error(appError.userMessage);
    }
  }, [state.user, cacheProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent.');
    } catch (error) {
      const appError = AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      reportError(appError);
      toast.error(appError.userMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prevState: AuthState) => ({ ...prevState, error: null, profileError: null }));
  }, []);

  return {
    ...state,
    ...derivedState,
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshProfile,
    updateProfile,
    resetPassword,
    clearError,
  };
};

export default useAuth;
