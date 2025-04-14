import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise render the default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 bg-gray-50 rounded-lg border">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We've encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
            
            <div className="space-y-4">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload page
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReset} 
                className="w-full"
              >
                Try again
              </Button>
              
              <details className="text-left mt-4 text-sm border rounded-md p-2">
                <summary className="cursor-pointer text-gray-700 font-medium">Technical details</summary>
                <div className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto max-h-[200px]">
                  <p className="font-mono text-xs whitespace-pre-wrap">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
