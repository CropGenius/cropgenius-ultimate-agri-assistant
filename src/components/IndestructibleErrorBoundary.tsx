import React, { Component, ErrorInfo } from 'react';
import { systemMonitor } from '../services/systemMonitoringService';
import { analytics } from '../integrations/analytics';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
  recoveryAttempts?: number;
  recoveryDelay?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  recoveryAttempts: number;
  lastRecoveryTime: number;
}

export class IndestructibleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    recoveryAttempts: 0,
    lastRecoveryTime: 0
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to multiple services for redundancy
    this.logErrorToServices(error, errorInfo);
    
    // Attempt recovery
    this.attemptRecovery();
  }

  private async logErrorToServices(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      await Promise.allSettled([
        analytics.track('error_boundary_triggered', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }),
        this.logToSupabase(error, errorInfo),
        this.sendToSentry(error, errorInfo)
      ]);
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  }

  private async logToSupabase(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      await supabase.from('error_logs').insert([
        {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          severity: 'CRITICAL'
        }
      ]);
    } catch (error) {
      console.error('Failed to log error to Supabase:', error);
    }
  }

  private async sendToSentry(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // Implementation of Sentry error logging
      console.error('Error to Sentry:', {
        error,
        componentStack: errorInfo.componentStack
      });
    } catch (error) {
      console.error('Failed to send error to Sentry:', error);
    }
  }

  private async attemptRecovery(): Promise<void> {
    const { recoveryAttempts = 3, recoveryDelay = 2000 } = this.props;
    const { recoveryAttempts: currentAttempts } = this.state;

    if (currentAttempts >= recoveryAttempts) {
      // If maximum attempts reached, trigger emergency shutdown
      await systemMonitor.triggerEmergencyShutdown();
      return;
    }

    // Increment recovery attempts
    this.setState({
      recoveryAttempts: currentAttempts + 1,
      lastRecoveryTime: Date.now()
    });

    // Attempt to recover
    await this.recoveryStrategy();

    // Reset error state after delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    }, recoveryDelay);
  }

  private async recoveryStrategy(): Promise<void> {
    try {
      // 1. Clear local state
      localStorage.clear();
      
      // 2. Reset database connections
      await supabase.auth.signOut();
      
      // 3. Force garbage collection
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      toast.error('Recovery Failed', {
        description: 'Failed to recover from error. Please try again.'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">System Error</h2>
            <p className="text-muted-foreground mb-4">
              We're experiencing technical difficulties. Our team has been notified.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Force Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default IndestructibleErrorBoundary;
