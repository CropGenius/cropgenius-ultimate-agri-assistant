/**
 * 🌾 CROPGENIUS – INTELLIGENT AUTHENTICATION FALLBACK
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Authentication Error Recovery System
 * - Integrates with AuthenticationService for intelligent error handling
 * - Provides contextual recovery options based on error type
 * - Real-time connection monitoring and automatic retry
 * - Comprehensive error classification and user guidance
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Shield, 
  Clock,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService, type CropGeniusAuthError, AuthErrorType } from '@/services/AuthenticationService';
import { toast } from 'sonner';

interface AuthFallbackProps {
  error?: Error | string | CropGeniusAuthError | null;
  resetError?: () => void;
  showHealthCheck?: boolean;
  enableAutoRetry?: boolean;
  maxAutoRetries?: number;
}

/**
 * BILLIONAIRE-GRADE Authentication Fallback with Intelligent Error Recovery
 */
export function AuthFallback({ 
  error, 
  resetError,
  showHealthCheck = true,
  enableAutoRetry = true,
  maxAutoRetries = 3
}: AuthFallbackProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [classifiedError, setClassifiedError] = useState<CropGeniusAuthError | null>(null);

  // Classify and enhance error information
  useEffect(() => {
    if (error) {
      // If it's already a classified error, use it directly
      if (typeof error === 'object' && 'type' in error && 'userMessage' in error) {
        setClassifiedError(error as CropGeniusAuthError);
      } else {
        // Classify the error using the authentication service pattern
        const errorMessage = error instanceof Error ? error.message : String(error);
        const classified: CropGeniusAuthError = {
          type: AuthErrorType.UNKNOWN_ERROR,
          message: errorMessage,
          userMessage: 'An authentication error occurred. Please try again.',
          developerMessage: errorMessage,
          timestamp: new Date().toISOString(),
          instanceId: 'auth-fallback',
          retryable: true
        };

        // Enhanced error classification
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          classified.type = AuthErrorType.NETWORK_ERROR;
          classified.userMessage = 'Connection failed. Please check your internet connection.';
          classified.retryable = true;
        } else if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          classified.type = AuthErrorType.SESSION_EXPIRED;
          classified.userMessage = 'Your session has expired. Please sign in again.';
          classified.retryable = false;
        } else if (errorMessage.includes('oauth') || errorMessage.includes('provider')) {
          classified.type = AuthErrorType.OAUTH_ERROR;
          classified.userMessage = 'Sign-in failed. Please try again or use a different method.';
          classified.retryable = true;
        }

        setClassifiedError(classified);
      }
    }
  }, [error]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Health check
  useEffect(() => {
    if (showHealthCheck) {
      checkAuthServiceHealth();
    }
  }, [showHealthCheck]);

  // Auto-retry logic
  useEffect(() => {
    if (enableAutoRetry && 
        classifiedError?.retryable && 
        autoRetryCount < maxAutoRetries && 
        isOnline) {
      
      const retryDelay = Math.min(1000 * Math.pow(2, autoRetryCount), 10000);
      
      const timer = setTimeout(() => {
        handleAutoRetry();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [classifiedError, autoRetryCount, maxAutoRetries, enableAutoRetry, isOnline]);

  const checkAuthServiceHealth = async () => {
    try {
      setHealthStatus('checking');
      const result = await authService.healthCheck();
      setHealthStatus(result.success ? 'healthy' : 'unhealthy');
    } catch (error) {
      setHealthStatus('unhealthy');
    }
  };

  const handleAutoRetry = async () => {
    if (autoRetryCount >= maxAutoRetries) return;

    setAutoRetryCount(prev => prev + 1);
    setIsRetrying(true);

    try {
      // Wait a moment for any network issues to resolve
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (resetError) {
        resetError();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Auto-retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualRetry = async () => {
    setIsRetrying(true);
    
    try {
      if (resetError) {
        resetError();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Manual retry failed:', error);
      toast.error('Retry failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSignIn = () => {
    navigate('/auth', { replace: true });
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    toast.info('Support contact feature coming soon. Please try refreshing the page.');
  };

  const getErrorIcon = () => {
    if (!classifiedError) return <AlertTriangle className="h-6 w-6 text-destructive" />;

    switch (classifiedError.type) {
      case AuthErrorType.NETWORK_ERROR:
        return isOnline ? <Wifi className="h-6 w-6 text-blue-500" /> : <WifiOff className="h-6 w-6 text-red-500" />;
      case AuthErrorType.SESSION_EXPIRED:
        return <Clock className="h-6 w-6 text-orange-500" />;
      case AuthErrorType.OAUTH_ERROR:
        return <Shield className="h-6 w-6 text-purple-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
    }
  };

  const getErrorTitle = () => {
    if (!classifiedError) return 'Authentication Error';

    switch (classifiedError.type) {
      case AuthErrorType.NETWORK_ERROR:
        return 'Connection Problem';
      case AuthErrorType.SESSION_EXPIRED:
        return 'Session Expired';
      case AuthErrorType.OAUTH_ERROR:
        return 'Sign-in Failed';
      case AuthErrorType.RATE_LIMITED:
        return 'Too Many Requests';
      default:
        return 'Authentication Error';
    }
  };

  const shouldShowRetry = () => {
    return classifiedError?.retryable !== false;
  };

  const shouldShowSignIn = () => {
    return classifiedError?.type === AuthErrorType.SESSION_EXPIRED || 
           classifiedError?.type === AuthErrorType.OAUTH_ERROR ||
           !classifiedError?.retryable;
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getErrorIcon()}
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getErrorTitle()}
                {classifiedError && (
                  <Badge variant={classifiedError.retryable ? 'secondary' : 'destructive'}>
                    {classifiedError.retryable ? 'Retryable' : 'Action Required'}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {classifiedError?.userMessage || 'We encountered a problem with your account access'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Status */}
          <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
              <AlertDescription className={isOnline ? 'text-green-800' : 'text-red-800'}>
                {isOnline ? 'Internet connection is active' : 'No internet connection detected'}
              </AlertDescription>
            </div>
          </Alert>

          {/* Health Status */}
          {showHealthCheck && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                {healthStatus === 'checking' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                {healthStatus === 'healthy' && <Shield className="h-4 w-4 text-green-600" />}
                {healthStatus === 'unhealthy' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                <AlertDescription className="text-blue-800">
                  Authentication service: {
                    healthStatus === 'checking' ? 'Checking...' :
                    healthStatus === 'healthy' ? 'Operational' : 'Experiencing issues'
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Auto-retry Status */}
          {enableAutoRetry && classifiedError?.retryable && autoRetryCount < maxAutoRetries && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 text-yellow-600 ${isRetrying ? 'animate-spin' : ''}`} />
                <AlertDescription className="text-yellow-800">
                  {isRetrying ? 
                    'Retrying automatically...' : 
                    `Auto-retry ${autoRetryCount + 1}/${maxAutoRetries} in progress`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Error Details */}
          {classifiedError && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Error Details:</p>
                  <p className="mb-2">{classifiedError.userMessage}</p>
                  {classifiedError.code && (
                    <p className="text-xs text-gray-500">Error Code: {classifiedError.code}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Time: {new Date(classifiedError.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Suggestions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What you can try:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {!isOnline && <li>• Check your internet connection</li>}
              {shouldShowRetry() && <li>• Click the retry button below</li>}
              {shouldShowSignIn() && <li>• Sign in again with your account</li>}
              <li>• Refresh the page</li>
              <li>• Clear your browser cache and cookies</li>
              {classifiedError?.type === AuthErrorType.RATE_LIMITED && (
                <li>• Wait a few minutes before trying again</li>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <div className="flex justify-end gap-2 w-full">
            {shouldShowRetry() && (
              <Button 
                variant="outline" 
                onClick={handleManualRetry}
                disabled={isRetrying || !isOnline}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </>
                )}
              </Button>
            )}
            
            {shouldShowSignIn() && (
              <Button onClick={handleSignIn}>
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center w-full text-xs text-gray-500">
            <button 
              onClick={handleContactSupport}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Contact Support
            </button>
            
            {classifiedError?.instanceId && (
              <span>ID: {classifiedError.instanceId.slice(-8)}</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthFallback;
