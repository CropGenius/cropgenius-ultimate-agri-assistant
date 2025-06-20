
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  onboarding_completed: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  farmId: string | null;
  profile: UserProfile | null;
  isDevPreview?: boolean;
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    user: null,
    session: null,
    isLoading: true,
    error: null,
    farmId: null,
    profile: null,
    isDevPreview: false,
  }));

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) toast.error("Sign out failed: " + error.message);
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out");
    }
  };

  const checkUserProfile = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setAuthState(prev => ({ ...prev, profile: data as UserProfile | null }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const checkUserFarm = async (userId: string) => {
      try {
        const { data, error } = await supabase.from('farms').select('id').eq('user_id', userId).limit(1);
        if (error) throw error;
        if (data && data.length > 0) {
          const farmId = data[0].id;
          localStorage.setItem("farmId", farmId);
          setAuthState(prev => ({ ...prev, farmId }));
        } else {
          localStorage.removeItem("farmId");
          setAuthState(prev => ({ ...prev, farmId: null }));
        }
      } catch (error) {
        console.error('Error checking for farm:', error);
      }
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log(`Auth state changed: ${event}`);
      const user = session?.user || null;
      setAuthState(prev => ({ ...prev, user, session, isLoading: false, profile: user ? prev.profile : null, farmId: user ? prev.farmId : null }));

      if (user) {
        await Promise.all([checkUserProfile(), checkUserFarm(user.id)]);
      }

      if (event === 'SIGNED_IN') toast.success(`Logged in as ${user?.email}`);
      if (event === 'SIGNED_OUT') toast.info("Logged out successfully");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthChange('INITIAL_SESSION', session);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [checkUserProfile]);

  return (
    <AuthContext.Provider value={{ ...authState, signOut, refreshSession, refreshProfile: checkUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
