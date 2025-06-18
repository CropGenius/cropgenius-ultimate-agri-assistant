import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFallbackProps {
  error?: Error | string | null;
  resetError?: () => void;
}

export function AuthFallback({ error, resetError }: AuthFallbackProps) {
  const navigate = useNavigate();
  const errorMessage = error instanceof Error ? error.message : error;

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      // Refresh the page as fallback
      window.location.reload();
    }
  };

  const handleSignIn = () => {
    navigate('/auth', { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem with your account access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {errorMessage || 'Your session may have expired or there was a problem with the authentication service.'}
          </p>
          <p className="text-sm">
            Please try signing in again or contact support if this issue persists.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleRetry}>
            Retry
          </Button>
          <Button onClick={handleSignIn}>
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthFallback;
