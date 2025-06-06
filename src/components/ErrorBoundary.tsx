import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { supabase } from '../services/supabaseClient';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  component?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isOffline: boolean;
}

/**
 * Production-grade error boundary that:
 * 1. Catches errors in child components
 * 2. Logs errors to the console and to Supabase
 * 3. Provides fallback UI to recover
 * 4. Detects offline state and handles accordingly
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOffline: !navigator.onLine,
    };
  }

  componentDidMount() {
    // Add offline/online listeners
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
  }

  componentWillUnmount() {
    // Clean up listeners
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Custom error handler callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error to console
    console.error(
      'CropGenius Error Boundary caught an error:',
      error,
      errorInfo
    );

    // Log error to Supabase if online
    this.logErrorToSupabase(error, errorInfo).catch((err) => {
      console.error('Failed to log error to Supabase:', err);
    });

    // Check for service worker recovery options
    this.checkServiceWorkerForFallback();
  }

  handleNetworkChange = () => {
    const isOffline = !navigator.onLine;
    this.setState({ isOffline });

    // If we're coming back online and had an error, attempt recovery
    if (!isOffline && this.state.hasError) {
      this.attemptRecovery();
    }
  };

  // Log error details to Supabase for monitoring and diagnostics
  async logErrorToSupabase(error: Error, errorInfo: ErrorInfo) {
    if (!navigator.onLine) return; // Don't attempt if offline

    try {
      const user = (await supabase.auth.getUser()).data.user;

      const errorData = {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        component: this.props.component || 'unknown',
        user_id: user?.id || null,
        browser_info: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
      };

      // Send to Supabase error logging table
      await supabase.from('error_logs').insert(errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  // Check if service worker has cached fallback content
  checkServiceWorkerForFallback() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service worker is active, could communicate for recovery options
      console.log('Checking service worker for fallback options');
    }
  }

  // Attempt to recover from the error
  attemptRecovery = () => {
    // Reset the error state to trigger a re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  // Force reload the application
  handleReload = () => {
    window.location.reload();
  };

  // Go back to home screen
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, isOffline } = this.state;
    const { fallback, children } = this.props;

    // If offline but no component error, render children with offline indicator
    if (isOffline && !hasError) {
      return (
        <div>
          {children}
          <div className="offline-indicator">
            <div className="offline-badge">Offline Mode</div>
          </div>
        </div>
      );
    }

    // If there's an error, show the fallback UI or our default error UI
    if (hasError) {
      // If custom fallback is provided, use it
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI with recovery options
      return (
        <div className="error-boundary-container p-4 border rounded-md bg-red-50 text-red-900 m-2">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>

          {isOffline ? (
            <div className="mb-4">
              <p className="mb-2">
                You are currently offline. Please check your internet
                connection.
              </p>
              <p>
                CropGenius will continue working with limited functionality in
                offline mode.
              </p>
            </div>
          ) : (
            <p className="mb-4">
              {error?.message ||
                'An unexpected error occurred. Our team has been notified.'}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={this.handleReload} variant="outline">
              Reload App
            </Button>
            <Button onClick={this.attemptRecovery}>Try Again</Button>
            <Button onClick={this.handleGoHome} variant="secondary">
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// Helper for creating component-specific error boundaries
export const createComponentErrorBoundary = (componentName: string) => {
  return (props: Omit<ErrorBoundaryProps, 'component'>) => (
    <ErrorBoundary {...props} component={componentName} />
  );
};

// Export specific error boundaries for key components
export const WeatherErrorBoundary = createComponentErrorBoundary('Weather');
export const CropScanErrorBoundary = createComponentErrorBoundary('CropScan');
export const FarmPlanErrorBoundary = createComponentErrorBoundary('FarmPlan');
export const MarketErrorBoundary = createComponentErrorBoundary('Market');
export const FieldDetailErrorBoundary =
  createComponentErrorBoundary('FieldDetail');
export const YieldPredictionErrorBoundary =
  createComponentErrorBoundary('YieldPrediction');
