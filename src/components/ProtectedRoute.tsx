import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authContext = useAuthContext();
  const { user, isLoading, isAuthenticated } = authContext;

  // Debug logging
  console.log('🛡️ [PROTECTED ROUTE] Auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isLoading,
    isAuthenticated,
    contextKeys: Object.keys(authContext)
  });

  if (isLoading) {
    console.log('🛡️ [PROTECTED ROUTE] Showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ [PROTECTED ROUTE] No user, redirecting to auth...');
    return <Navigate to="/auth" replace />;
  }

  console.log('🛡️ [PROTECTED ROUTE] User authenticated, rendering children...');
  return <>{children}</>;
};