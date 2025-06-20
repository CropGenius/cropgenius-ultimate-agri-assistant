import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load.
    // This is a one-time check to immediately set the user state
    // without waiting for the onAuthStateChange event to fire.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Even with this, we set loading to false in the listener
      // to ensure we have the most up-to-date auth state.
    });

    // The onAuthStateChange listener is the single source of truth for auth state.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Cleanup the listener on component unmount.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    isAuthenticated: !!session,
    isLoading,
  };
}

export default useAuth;
