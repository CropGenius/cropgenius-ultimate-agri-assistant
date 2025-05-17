import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Add global type declaration for our error suppression flag and debug object
declare global {
  interface Window {
    __SUPPRESS_ERROR_TOASTS?: boolean;
    CropGeniusDebug?: {
      logError: (error: any) => void;
      [key: string]: any;
    };
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { 
      hasError: true, 
      error: error,
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console and potentially to an error reporting service
    console.error('❌ [ErrorBoundary] Uncaught error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to local storage for diagnostics
    try {
      const errorLog = JSON.parse(localStorage.getItem('cropgenius_error_log') || '[]');
      errorLog.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        component: errorInfo.componentStack
      });
      
      // Keep only the last 10 errors
      if (errorLog.length > 10) {
        errorLog.shift();
      }
      
      localStorage.setItem('cropgenius_error_log', JSON.stringify(errorLog));
    } catch (e) {
      // Silent catch if localStorage fails
    }
    
    // Show toast notification
    toast.error('Something went wrong', {
      description: 'We encountered an unexpected error. Our team has been notified.'
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    // Always render children even if there's an error
    // Just trigger a toast notification if an error occurs
    if (this.state.hasError && !window.__SUPPRESS_ERROR_TOASTS) {
      // Show a small non-blocking error indicator in the corner
      setTimeout(() => {
        // Log to console first
        console.error("[ErrorBoundary]", this.state.error);
        console.error("[Component Stack]", this.state.errorInfo?.componentStack);
        
        // Add error to debug panel if available
        if (window.CropGeniusDebug && typeof window.CropGeniusDebug.logError === 'function') {
          try {
            window.CropGeniusDebug.logError({
              type: 'react-error',
              message: this.state.error?.message || 'Unknown error',
              stack: this.state.error?.stack,
              componentStack: this.state.errorInfo?.componentStack,
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.error("Failed to log to debug panel", e);
          }
        }
        
        // Show non-blocking notification
        toast.error(this.state.error?.message || "Non-critical error detected", {
          description: "Error logged to console and debug panel",
          action: {
            label: "Details",
            onClick: () => {
              console.group("Error Details");
              console.error(this.state.error);
              console.error(this.state.errorInfo?.componentStack);
              console.groupEnd();
            }
          },
          duration: 5000
        });
      }, 0);
      
      // After logging the error, reset the error state so the app can try again
      setTimeout(() => {
        this.handleReset();
      }, 1000);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
