import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // If we require auth and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If we don't require auth (login page) and user is authenticated, redirect to home
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}

export default AuthGuard;
