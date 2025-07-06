/**
 * PRODUCTION-READY ERROR HANDLING
 * Minimal, silent error handling for production
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: Error, context?: any) => {
  // Only log in development
  if (import.meta.env.DEV) {
    console.error('Error:', error.message, context);
  }
  
  // In production, silently handle errors
  // Could send to error reporting service here
};

export const handleAuthError = (error: any) => {
  // Silent handling of auth errors
  if (import.meta.env.DEV) {
    console.warn('Auth error:', error);
  }
  
  // Return user-friendly message
  if (error?.message?.includes('401')) {
    return 'Please sign in to continue';
  }
  
  return 'Authentication issue. Please try again.';
};

export const handleNetworkError = (error: any) => {
  if (import.meta.env.DEV) {
    console.warn('Network error:', error);
  }
  
  return 'Network issue. Please check your connection.';
};