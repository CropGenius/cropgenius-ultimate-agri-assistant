import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ErrorReport {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
  timestamp: string;
  userAction: string;
  userId?: string;
  sessionId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: number = 0;
  private errorHistory: Error[] = [];
  private maxHistory: number = 10;
  private isInitialized: boolean = false;

  private constructor() {
    // Private constructor to prevent instantiation
    this.init();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private async init() {
    if (this.isInitialized) return;

    // Set up error tracking
    window.addEventListener('error', (event) => this.handleUncaughtError(event));
    window.addEventListener('unhandledrejection', (event) => this.handleUncaughtRejection(event));

    this.isInitialized = true;
  }

  public handleError(error: Error, message?: string) {
    this.errorCount++;
    
    const errorMessage = message || error.message || 'An unexpected error occurred';
    console.error(errorMessage, error);
    
    // Add to error history
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistory) {
      this.errorHistory.shift();
    }
    
    // Only show toast for first few errors to prevent spam
    if (this.errorCount < 3) {
      toast.error(errorMessage);
    }
  }

  public getErrorCount(): number {
    return this.errorCount;
  }

  public getErrorHistory(): Error[] {
    return [...this.errorHistory];
  }

  public resetErrorCount() {
    this.errorCount = 0;
  }

  public clearErrorHistory() {
    this.errorHistory = [];
  }

  private async handleUncaughtError(event: ErrorEvent) {
    const error = event.error as Error;
    await this.reportError({
      errorType: 'uncaught_error',
      errorMessage: error.message,
      stackTrace: error.stack || '',
      userAction: 'uncaught_error'
    });
  }

  private async handleUncaughtRejection(event: PromiseRejectionEvent) {
    const error = event.reason as Error;
    await this.reportError({
      errorType: 'unhandled_rejection',
      errorMessage: error.message,
      stackTrace: error.stack || '',
      userAction: 'unhandled_rejection'
    });
  }

  public async reportError(error: ErrorReport) {
    try {
      // Log to console for immediate debugging
      console.error('Error reported:', error);

      // Send to analytics
      await this.sendToAnalytics(error);

      // Save to Supabase
      await this.saveToSupabase(error);

      // Show user-friendly message
      this.showUserMessage(error);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      // At least show user message if reporting fails
      this.showUserMessage(error);
    }
  }

  private async sendToAnalytics(error: ErrorReport) {
    // This would typically use an analytics service like Google Analytics or Mixpanel
    // For now, we'll just log it
    console.log('Analytics event:', {
      category: 'error',
      action: error.errorType,
      label: error.errorMessage,
      value: 1
    });
  }

  private async saveToSupabase(error: ErrorReport) {
    try {
      const { error: supabaseError } = await supabase
        .from('error_logs')
        .insert([error]);

      if (supabaseError) throw supabaseError;
    } catch (error) {
      console.error('Failed to save error to Supabase:', error);
    }
  }

  private showUserMessage(error: ErrorReport) {
    const userMessages = {
      'network_error': 'Unable to connect to server. Please check your internet connection.',
      'permission_denied': 'Please grant the required permissions in your device settings.',
      'invalid_data': 'The data provided is invalid. Please try again.',
      'uncaught_error': 'An unexpected error occurred. Please try again later.',
      'unhandled_rejection': 'An unexpected error occurred. Please try again later.',
      'default': 'An error occurred. Please try again later.'
    };

    const errorType = error.errorType.toLowerCase().replace(/[^a-z_]/g, '_');
    const message = userMessages[errorType as keyof typeof userMessages] || userMessages['default'];

    toast.error(message);
  }

  public static handle(error: Error, userAction: string = 'unknown') {
    const errorHandler = ErrorHandler.getInstance();
    return errorHandler.reportError({
      timestamp: new Date().toISOString(),
      errorType: error.name,
      errorMessage: error.message,
      stackTrace: error.stack || '',
      userAction
    });
  }
}
