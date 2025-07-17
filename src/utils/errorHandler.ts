/**
 * Comprehensive Error Handler for CropGenius
 * Handles all types of erandling for production
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

import { ApiResponseHandler } from './apiResponse';

export const handleError = (error: Error, context?: any) => {
  // Only log in development
  if (import.meta.env.DEV) {
    console.error('Error:', error.message, context);
  }
  
  // Return a standardized error response
  return ApiResponseHandler.error(error, 500, context);
};

export const handleAuthError = (error: any) => {
  // Silent handling of auth errors
  if (import.meta.env.DEV) {
    console.warn('Auth error:', error);
  }
  
  // Return user-friendly message with standardized format
  if (error?.message?.includes('401')) {
    return ApiResponseHandler.error('Please sign in to continue', 401);
  }
  
  return ApiResponseHandler.error('Authentication issue. Please try again.', 401);
};

export const handleNetworkError = (error: any) => {
  if (import.meta.env.DEV) {
    console.warn('Network error:', error);
  }
  
  return ApiResponseHandler.error('Network issue. Please check your connection.', 503, {
    retryable: true,
    offline: !navigator.onLine
  });
};