
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getAuthRedirectURL } from '@/utils/authRedirectUtils';
import { useMemoryStore } from '@/hooks/useMemoryStore';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  farmId: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metaData?: object) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateFarmId: (id: string | null) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  farmId: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateFarmId: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err: any) {
        console.error('Error getting auth session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast.success("Welcome to CROPGenius");
          
          // Check if user was redirected from somewhere
          const returnTo = location.state?.returnTo || '/';
          navigate(returnTo, { replace: true });
        } else if (event === 'SIGNED_OUT') {
          toast.info("You've been signed out");
          navigate('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load the user's farm ID
  useEffect(() => {
    const loadUserFarm = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('farms')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setFarmId(data.id);
        }
      } catch (err: any) {
        console.error('Error loading user farm:', err);
      }
    };

    if (user) {
      loadUserFarm();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (err: any) {
      console.error('Error signing in:', err);
      return { error: err.message };
    }
  };

  const signUp = async (email: string, password: string, metaData?: object) => {
    try {
      // Use the redirect URL that will work across environments
      const redirectTo = getAuthRedirectURL();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: metaData,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (err: any) {
      console.error('Error signing up:', err);
      return { error: err.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate is handled by the auth listener
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message);
    }
  };

  const updateFarmId = (id: string | null) => {
    setFarmId(id);
  };

  const value = {
    user,
    session,
    farmId,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateFarmId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
