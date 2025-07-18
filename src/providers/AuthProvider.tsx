import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [retryCount, setRetryCount] = React.useState(0);

  // Debug logging
  console.log('🔑 [AUTH PROVIDER] Current auth state:', {
    hasUser: !!authState.user,
    userEmail: authState.user?.email,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    session: !!authState.session,
    profile: !!authState.profile
  });

  // Enhanced timeout mechanism to prevent infinite loading
  React.useEffect(() => {
    if (authState.isLoading) {
      const timeout = setTimeout(() => {
        console.warn('🔑 [AUTH PROVIDER] Auth loading timeout - forcing render');
        setForceRender(true);
      }, 10000); // 10 second timeout as per design

      return () => clearTimeout(timeout);
    } else {
      // Reset force render when loading completes
      setForceRender(false);
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

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setForceRender(false);
    // Force a page reload to restart auth initialization
    window.location.reload();
  }, []);

  // Enhanced loading state with timeout and retry mechanism
  if (authState.isLoading && !forceRender) {
    console.log('🔑 [AUTH PROVIDER] Still loading, showing spinner...');
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading CropGenius</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Initializing your farming intelligence platform...
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry mechanism when timeout occurs
  if (forceRender && authState.isLoading) {
    console.warn('🔑 [AUTH PROVIDER] Showing timeout error state');
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Taking Too Long</h2>
          <p className="text-sm text-muted-foreground mb-6">
            CropGenius is taking longer than expected to load. This might be due to a slow connection or temporary issue.
          </p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Attempt {retryCount + 1} • If this persists, check your internet connection
            </p>
          </div>
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
