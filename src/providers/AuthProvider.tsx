import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';
import { supabase } from '@/services/supabaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuth();

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Sign out failed', { description: error.message });
    } else {
      toast.success('You have been signed out.');
    }
  }, []);

  // Provide a loading state while initial auth check happens
  if (authState.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...authState, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
