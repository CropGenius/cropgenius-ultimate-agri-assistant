/**
 * AdminGuard Component
 * Ensures that only admin users can access the wrapped component
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallbackPath = '/' 
}) => {
  const { user } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setIsAdmin(data?.role === 'admin');
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin permissions');
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading state while checking admin status
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Verifying Access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">
              Checking admin permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if there was an error checking admin status
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center text-muted-foreground">
              {error}
            </p>
            <Button 
              onClick={() => window.location.href = fallbackPath}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children for admin users
  return <>{children}</>;
};

export default AdminGuard;