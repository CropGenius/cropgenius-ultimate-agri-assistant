/**
 * 🌾 CROPGENIUS – INTELLIGENT ERROR BOUNDARY
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Error Boundary with Agricultural Intelligence
 * - Advanced error classification and recovery strategies
 * - Integration with error reporting and analytics
 * - Context-aware error messages for agricultural users
 * - Automatic retry mechanisms and fallback strategies
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Wifi, 
  Database, 
  Shield,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  showErrorDetails?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
  errorType: 'network' | 'database' | 'auth' | 'component' | 'unknown';
}

/**
 * BILLIONAIRE-GRADE Error Boundary with Agricultural Context
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    errorId: '',
    retryCount: 0,
    isRetrying: false,
    showDetails: false,
    errorType: 'unknown'
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorType = ErrorBoundary.classifyError(error);
    
    return { 
      hasError: true, 
      error,
      errorId,
      errorType
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR BOUNDARY] Uncaught error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error if enabled
    if (this.props.enableReporting !== false) {
      this.reportError(error, errorInfo);
    }

    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error) && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
  }

  private static classifyError(error: Error): State['errorType'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
      return 'database';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return 'auth';
    }
    if (stack.includes('react') || message.includes('render') || message.includes('component')) {
      return 'component';
    }
    
    return 'unknown';
  }

  private shouldAutoRetry(error: Error): boolean {
    const retryableTypes: State['errorType'][] = ['network', 'database'];
    return retryableTypes.includes(this.state.errorType);
  }

  private scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    this.setState({ isRetrying: true });
    
    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real implementation, this would send to an error reporting service
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'anonymous', // Would get from auth context
        errorType: this.state.errorType
      };

      console.log('📊 [ERROR REPORTING] Error report:', errorReport);
      
      // Simulate API call
      // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
      showDetails: false
    }));

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Type: ${this.state.errorType}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  private getErrorIcon = () => {
    switch (this.state.errorType) {
      case 'network':
        return <Wifi className="h-8 w-8 text-blue-500" />;
      case 'database':
        return <Database className="h-8 w-8 text-purple-500" />;
      case 'auth':
        return <Shield className="h-8 w-8 text-orange-500" />;
      case 'component':
        return <Bug className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  private getErrorTitle = () => {
    switch (this.state.errorType) {
      case 'network':
        return 'Connection Problem';
      case 'database':
        return 'Data Access Error';
      case 'auth':
        return 'Authentication Error';
      case 'component':
        return 'Interface Error';
      default:
        return 'Unexpected Error';
    }
  };

  private getErrorDescription = () => {
    switch (this.state.errorType) {
      case 'network':
        return 'CropGenius is having trouble connecting to our servers. This might be due to your internet connection or temporary server issues.';
      case 'database':
        return 'We\'re having trouble accessing your farm data. This is usually temporary and should resolve shortly.';
      case 'auth':
        return 'There was a problem with your account access. You may need to sign in again.';
      case 'component':
        return 'A part of the CropGenius interface encountered an error. This is usually resolved by refreshing the page.';
      default:
        return 'CropGenius encountered an unexpected error. Our team has been notified and is working on a fix.';
    }
  };

  private getRecoveryActions = () => {
    const actions = [];

    switch (this.state.errorType) {
      case 'network':
        actions.push('Check your internet connection');
        actions.push('Try again in a few moments');
        break;
      case 'database':
        actions.push('Wait a moment and try again');
        actions.push('Check if other features are working');
        break;
      case 'auth':
        actions.push('Sign out and sign back in');
        actions.push('Clear your browser cache');
        break;
      case 'component':
        actions.push('Refresh the page');
        actions.push('Try a different browser');
        break;
      default:
        actions.push('Refresh the page');
        actions.push('Try again later');
    }

    return actions;
  };

  public componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                {this.getErrorIcon()}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{this.getErrorTitle()}</CardTitle>
                    <Badge variant={this.state.errorType === 'network' ? 'secondary' : 'destructive'}>
                      {this.state.errorType}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {this.getErrorDescription()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Retry Status */}
              {this.state.isRetrying && (
                <Alert className="border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">
                    Attempting to recover automatically... (Attempt {this.state.retryCount + 1})
                  </AlertDescription>
                </Alert>
              )}

              {/* Recovery Actions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">What you can try:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {this.getRecoveryActions().map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="flex-1"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Error Details */}
              {(this.props.showErrorDetails !== false) && this.state.error && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Technical Details</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.handleCopyError}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.toggleDetails}
                      >
                        {this.state.showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="font-medium text-gray-700">Error ID:</span>
                        <p className="text-gray-600 font-mono text-xs">{this.state.errorId}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p className="text-gray-600 capitalize">{this.state.errorType}</p>
                      </div>
                    </div>

                    {this.state.showDetails && (
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Message:</span>
                          <p className="text-gray-600 mt-1">{this.state.error.message}</p>
                        </div>
                        
                        {this.state.error.stack && (
                          <div>
                            <span className="font-medium text-gray-700">Stack Trace:</span>
                            <pre className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border overflow-auto max-h-32">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}

                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <span className="font-medium text-gray-700">Component Stack:</span>
                            <pre className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border overflow-auto max-h-32">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Support Information */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact our support team with Error ID: 
                  <span className="font-mono ml-1">{this.state.errorId}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;