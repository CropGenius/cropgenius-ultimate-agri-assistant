import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Add global type declaration for our error suppression flag and debug object
declare global {
  interface Window {
    __SUPPRESS_ERROR_TOASTS?: boolean;
    CropGeniusDebug?: {
      errors: any[];
      logError: (error: any) => void;
      clearErrors: () => void;
      downloadErrorLog: () => void;
      toggleDebugPanel: () => void;
      isDebugPanelVisible: boolean;
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

    // Add error to debug panel if available
    if (window.CropGeniusDebug && typeof window.CropGeniusDebug.logError === 'function') {
      try {
        window.CropGeniusDebug.logError({
          type: 'react-error',
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to log to debug panel", e);
      }
    }
    
    // Show toast notification - this can be the primary non-blocking notification
    if (!window.__SUPPRESS_ERROR_TOASTS) {
      toast.error(error?.message || 'An unexpected error occurred', {
        description: 'Please try again or contact support if the issue persists.',
        duration: 8000 // Give user more time to see it
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Otherwise, render a default fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          margin: '20px auto',
          border: '1px solid #ff4d4f',
          borderRadius: '8px',
          backgroundColor: '#fff1f0',
          maxWidth: '600px',
          fontFamily: 'sans-serif'
        }}>
          <AlertTriangle size={48} color="#ff4d4f" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', color: '#cf1322', marginBottom: '8px' }}>Oops! Something went wrong.</h2>
          <p style={{ fontSize: '16px', color: '#595959', marginBottom: '16px', textAlign: 'center' }}>
            We've encountered an unexpected issue. Please try refreshing the page or clicking the button below.
          </p>
          {this.state.error && (
            <details style={{ width: '100%', marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff', marginBottom: '8px' }}>Error Details</summary>
              <pre style={{
                textAlign: 'left',
                background: '#f0f0f0',
                padding: '12px',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '12px'
              }}>
                <strong>Message:</strong> {this.state.error.message}
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <>
                    <br /><br /><strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
          <Button onClick={this.handleReset} style={{ 
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
