// 🚀 CROPGENIUS INFINITY IQ AUTHENTICATION ERROR BOUNDARY
// Production-ready error boundary with graceful recovery for 100M farmers

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SupabaseManager } from '@/integrations/supabase/client';
import { AuthErrorType, CropGeniusAuthError } from '@/services/AuthenticationService';

// 🔥 ERROR BOUNDARY STATE
interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  timestamp: string;
  retryCount: number;
  isRecovering: boolean;
}

// 💪 ERROR BOUNDARY PROPS
interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showDebugInfo?: boolean;
}

// 🌟 ERROR CLASSIFICATION
interface ClassifiedError {
  type: AuthErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  developerMessage: string;
  recoverable: boolean;
  autoRetry: boolean;
  contactSupport: boolean;
}

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      retryCount: 0,
      isRecovering: false
    };
  }

  // 🔥 ERROR CLASSIFICATION SYSTEM
  private classifyError(error: Error): ClassifiedError {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    // Authentication-specific errors
    if (errorMessage.includes('invalid api key') || errorMessage.includes('401')) {
      return {
        type: AuthErrorType.INVALID_API_KEY,
        severity: 'critical',
        userMessage: 'Authentication service is temporarily unavailable. Our team has been notified.',
        developerMessage: 'Invalid Supabase API key detected. Check environment configuration.',
        recoverable: false,
        autoRetry: false,
        contactSupport: true
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        severity: 'medium',
        userMessage: 'Connection issue detected. Please check your internet connection.',
        developerMessage: 'Network request failed. Check connectivity and API endpoints.',
        recoverable: true,
        autoRetry: true,
        contactSupport: false
      };
    }

    if (errorMessage.includes('oauth') || errorMessage.includes('provider')) {
      return {
        type: AuthErrorType.OAUTH_ERROR,
        severity: 'high',
        userMessage: 'Sign-in service encountered an issue. Please try again.',
        developerMessage: 'OAuth provider error. Check configuration and provider status.',
        recoverable: true,
        autoRetry: false,
        contactSupport: false
      };
    }

    if (errorMessage.includes('session') || errorMessage.includes('expired')) {
      return {
        type: AuthErrorType.SESSION_EXPIRED,
        severity: 'medium',
        userMessage: 'Your session has expired. Please sign in again.',
        developerMessage: 'Session management error. Check token refresh logic.',
        recoverable: true,
        autoRetry: false,
        contactSupport: false
      };
    }

    // React/Component errors
    if (errorStack.includes('react') || errorStack.includes('component')) {
      return {
        type: AuthErrorType.UNKNOWN_ERROR,
        severity: 'high',
        userMessage: 'A technical issue occurred. Please refresh the page.',
        developerMessage: 'React component error in authentication flow.',
        recoverable: true,
        autoRetry: false,
        contactSupport: false
      };
    }

    // Default classification
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      severity: 'medium',
      userMessage: 'An unexpected issue occurred. Please try again.',
      developerMessage: `Unclassified error: ${error.message}`,
      recoverable: true,
      autoRetry: false,
      contactSupport: false
    };
  }

  // 🚨 ERROR CAPTURE
  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    const errorId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    console.error('🚨 [AUTH ERROR BOUNDARY] Error caught:', {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp
    });

    return {
      hasError: true,
      error,
      errorId,
      timestamp
    };
  }

  // 📊 ERROR REPORTING
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 [AUTH ERROR BOUNDARY] Detailed Error Report');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Instance ID:', SupabaseManager.getInstanceId());
      console.groupEnd();
    }

    // Show toast notification
    const classified = this.classifyError(error);
    toast.error('Authentication Error', {
      description: classified.userMessage,
      duration: 5000
    });

    // Auto-retry for recoverable errors
    if (classified.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleAutoRetry();
    }
  }

  // 🔄 AUTO-RETRY MECHANISM
  private scheduleAutoRetry = () => {
    const delay = Math.pow(2, this.state.retryCount) * 1000; // Exponential backoff
    
    console.log(`🔄 [AUTH ERROR BOUNDARY] Scheduling auto-retry in ${delay}ms`);
    
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  // 💪 MANUAL RETRY
  private handleRetry = () => {
    console.log('🔄 [AUTH ERROR BOUNDARY] Attempting recovery...');
    
    this.setState(prevState => ({
      isRecovering: true,
      retryCount: prevState.retryCount + 1
    }));

    // Clear any existing timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    // Attempt recovery after short delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    }, 1000);
  };

  // 🏠 NAVIGATE HOME
  private handleGoHome = () => {
    window.location.href = '/';
  };

  // 🔄 RELOAD PAGE
  private handleReload = () => {
    window.location.reload();
  };

  // 📞 CONTACT SUPPORT
  private handleContactSupport = () => {
    const subject = encodeURIComponent('CropGenius Authentication Error');
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Timestamp: ${this.state.timestamp}
Error: ${this.state.error?.message}
Instance: ${SupabaseManager.getInstanceId()}

Please describe what you were doing when this error occurred:
    `);
    
    window.open(`mailto:support@cropgenius.africa?subject=${subject}&body=${body}`);
  };

  // 🧹 CLEANUP
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const classified = this.classifyError(this.state.error!);
    const maxRetries = this.props.maxRetries || 3;
    const showDebugInfo = this.props.showDebugInfo ?? import.meta.env.DEV;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <div className="text-center max-w-lg p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 dark:border-red-800">
          {/* Error Icon */}
          <div className="relative mb-6">
            <AlertTriangle className="h-20 w-20 text-red-500 mx-auto" />
            <Shield className="h-8 w-8 text-red-400 absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1" />
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {classified.severity === 'critical' ? 'Critical Error' : 'Authentication Issue'}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {classified.userMessage}
          </p>

          {/* Recovery Status */}
          {this.state.isRecovering && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Attempting recovery...
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {classified.recoverable && this.state.retryCount < maxRetries && (
              <Button 
                onClick={this.handleRetry} 
                className="w-full"
                disabled={this.state.isRecovering}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again ({this.state.retryCount + 1}/{maxRetries})
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={this.handleReload} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
              
              <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>

            {classified.contactSupport && (
              <Button variant="outline" onClick={this.handleContactSupport} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
          </div>

          {/* Debug Information */}
          {showDebugInfo && (
            <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs font-mono space-y-1">
              <div className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Debug Information:</div>
              <div><span className="text-gray-500">Error ID:</span> {this.state.errorId}</div>
              <div><span className="text-gray-500">Type:</span> {classified.type}</div>
              <div><span className="text-gray-500">Severity:</span> {classified.severity}</div>
              <div><span className="text-gray-500">Timestamp:</span> {this.state.timestamp}</div>
              <div><span className="text-gray-500">Instance:</span> {SupabaseManager.getInstanceId()}</div>
              <div><span className="text-gray-500">Retries:</span> {this.state.retryCount}/{maxRetries}</div>
              {this.state.error && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div><span className="text-gray-500">Message:</span> {this.state.error.message}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            CropGenius • Serving 100M+ Farmers • Always Here for You
          </div>
        </div>
      </div>
    );
  }
}

// 🌟 CONVENIENCE WRAPPER COMPONENT
interface AuthErrorWrapperProps {
  children: ReactNode;
  maxRetries?: number;
}

export const AuthErrorWrapper: React.FC<AuthErrorWrapperProps> = ({ 
  children, 
  maxRetries = 3 
}) => {
  return (
    <AuthErrorBoundary 
      maxRetries={maxRetries}
      onError={(error, errorInfo) => {
        // Custom error reporting can be added here
        console.error('🚨 [AUTH ERROR WRAPPER] Error reported:', {
          error: error.message,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </AuthErrorBoundary>
  );
};

export default AuthErrorBoundary;