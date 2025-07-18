import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const [retryCount, setRetryCount] = React.useState(0);
  
  // Wrap useAuthContext in try-catch to handle context access errors
  let authContext;
  try {
    authContext = useAuthContext();
  } catch (error) {
    console.error('🛡️ [PROTECTED ROUTE] Auth context error:', error);
    
    // Fallback UI when AuthContext is not available
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Unable to access authentication context. This might be a temporary issue.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  const { user, isLoading, isAuthenticated, isInitialized } = authContext;

  // Debug logging
  console.log('🛡️ [PROTECTED ROUTE] Auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isLoading,
    isAuthenticated,
    isInitialized,
    contextKeys: Object.keys(authContext)
  });

  // Show loading state while authentication is initializing
  if (isLoading || !isInitialized) {
    console.log('🛡️ [PROTECTED ROUTE] Showing loading...');
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    console.log('🛡️ [PROTECTED ROUTE] No user, redirecting to auth...');
    return <Navigate to="/auth" replace />;
  }

  console.log('🛡️ [PROTECTED ROUTE] User authenticated, rendering children...');
  return <>{children}</>;
};