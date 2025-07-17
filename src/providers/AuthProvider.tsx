import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
  const [forceRender, setForceRender] = React.useState(false);

  // Debug logging
  console.log('🔑 [AUTH PROVIDER] Current auth state:', {
    hasUser: !!authState.user,
    userEmail: authState.user?.email,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    session: !!authState.session,
    profile: !!authState.profile
  });

  // Timeout mechanism to prevent infinite loading
  React.useEffect(() => {
    if (authState.isLoading) {
      const timeout = setTimeout(() => {
        console.warn('🔑 [AUTH PROVIDER] Auth loading timeout - forcing render');
        setForceRender(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [authState.isLoading]);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Sign out failed', { description: error.message });
    } else {
      toast.success('You have been signed out.');
    }
  }, []);

  const handleRefreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      console.log('Session refreshed successfully');
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
    }
  }, []);

  // Provide a loading state while initial auth check happens
  if (authState.isLoading && !forceRender) {
    console.log('🔑 [AUTH PROVIDER] Still loading, showing spinner...');
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading CropGenius...</p>
        </div>
      </div>
    );
  }

  console.log('🔑 [AUTH PROVIDER] Rendering provider with context value');
  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      signOut: handleSignOut,
      refreshSession: handleRefreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
