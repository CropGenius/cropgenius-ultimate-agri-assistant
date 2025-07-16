/**
 * Authentication Error Handling and Categorization
 * Provides structured error handling for authentication flows
 */

import { AuthError } from './authLogger';

export enum AuthErrorCode {
  // OAuth Callback Errors
  OAUTH_INVALID_PARAMS = 'OAUTH_INVALID_PARAMS',
  OAUTH_STATE_MISMATCH = 'OAUTH_STATE_MISMATCH',
  OAUTH_PROVIDER_ERROR = 'OAUTH_PROVIDER_ERROR',
  OAUTH_PKCE_FAILURE = 'OAUTH_PKCE_FAILURE',
  
  // Session Errors
  SESSION_EXCHANGE_FAILED = 'SESSION_EXCHANGE_FAILED',
  SESSION_REFRESH_FAILED = 'SESSION_REFRESH_FAILED',
  SESSION_VALIDATION_FAILED = 'SESSION_VALIDATION_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  
  // Redirect Loop Errors
  REDIRECT_LOOP_DETECTED = 'REDIRECT_LOOP_DETECTED',
  EXCESSIVE_REDIRECTS = 'EXCESSIVE_REDIRECTS',
  CIRCULAR_NAVIGATION = 'CIRCULAR_NAVIGATION',
  
  // Network and Connectivity
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // General Authentication
  AUTH_UNKNOWN_ERROR = 'AUTH_UNKNOWN_ERROR',
  AUTH_CONFIGURATION_ERROR = 'AUTH_CONFIGURATION_ERROR'
}

export interface AuthErrorConfig {
  code: AuthErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  category: 'oauth' | 'session' | 'redirect' | 'network' | 'general';
}

const ERROR_CONFIGS: Record<AuthErrorCode, Omit<AuthErrorConfig, 'code'>> = {
  [AuthErrorCode.OAUTH_INVALID_PARAMS]: {
    message: 'Invalid OAuth callback parameters received',
    userMessage: 'Authentication failed due to invalid parameters. Please try signing in again.',
    retryable: true,
    category: 'oauth'
  },
  [AuthErrorCode.OAUTH_STATE_MISMATCH]: {
    message: 'OAuth state parameter mismatch detected',
    userMessage: 'Authentication security check failed. Please try signing in again.',
    retryable: true,
    category: 'oauth'
  },
  [AuthErrorCode.OAUTH_PROVIDER_ERROR]: {
    message: 'OAuth provider returned an error',
    userMessage: 'Sign-in provider encountered an error. Please try again or use a different method.',
    retryable: true,
    category: 'oauth'
  },
  [AuthErrorCode.OAUTH_PKCE_FAILURE]: {
    message: 'PKCE flow validation failed',
    userMessage: 'Authentication security validation failed. Please try signing in again.',
    retryable: true,
    category: 'oauth'
  },
  [AuthErrorCode.SESSION_EXCHANGE_FAILED]: {
    message: 'Failed to exchange authorization code for session',
    userMessage: 'Unable to complete sign-in. Please try again.',
    retryable: true,
    category: 'session'
  },
  [AuthErrorCode.SESSION_REFRESH_FAILED]: {
    message: 'Failed to refresh authentication session',
    userMessage: 'Your session has expired. Please sign in again.',
    retryable: false,
    category: 'session'
  },
  [AuthErrorCode.SESSION_VALIDATION_FAILED]: {
    message: 'Session validation failed',
    userMessage: 'Authentication validation failed. Please sign in again.',
    retryable: false,
    category: 'session'
  },
  [AuthErrorCode.SESSION_NOT_FOUND]: {
    message: 'No active session found',
    userMessage: 'No active session found. Please sign in.',
    retryable: true,
    category: 'session'
  },
  [AuthErrorCode.REDIRECT_LOOP_DETECTED]: {
    message: 'Authentication redirect loop detected',
    userMessage: 'Authentication is stuck in a loop. Please clear your browser data and try again.',
    retryable: true,
    category: 'redirect'
  },
  [AuthErrorCode.EXCESSIVE_REDIRECTS]: {
    message: 'Too many authentication redirects',
    userMessage: 'Too many redirect attempts. Please wait a moment and try again.',
    retryable: true,
    category: 'redirect'
  },
  [AuthErrorCode.CIRCULAR_NAVIGATION]: {
    message: 'Circular navigation pattern detected',
    userMessage: 'Navigation error detected. Please refresh the page and try again.',
    retryable: true,
    category: 'redirect'
  },
  [AuthErrorCode.NETWORK_ERROR]: {
    message: 'Network error during authentication',
    userMessage: 'Network connection issue. Please check your internet and try again.',
    retryable: true,
    category: 'network'
  },
  [AuthErrorCode.TIMEOUT_ERROR]: {
    message: 'Authentication request timed out',
    userMessage: 'Request timed out. Please try again.',
    retryable: true,
    category: 'network'
  },
  [AuthErrorCode.AUTH_UNKNOWN_ERROR]: {
    message: 'Unknown authentication error',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    category: 'general'
  },
  [AuthErrorCode.AUTH_CONFIGURATION_ERROR]: {
    message: 'Authentication configuration error',
    userMessage: 'Authentication is not properly configured. Please contact support.',
    retryable: false,
    category: 'general'
  }
};

export class AuthErrorFactory {
  /**
   * Create a structured AuthError from an error code
   */
  static createError(
    code: AuthErrorCode,
    context: Record<string, any> = {},
    originalError?: Error
  ): AuthError {
    const config = ERROR_CONFIGS[code];
    
    return {
      code,
      message: config.message,
      userMessage: config.userMessage,
      context: {
        ...context,
        originalError: originalError?.message,
        stack: originalError?.stack,
        category: config.category
      },
      timestamp: Date.now(),
      retryable: config.retryable
    };
  }

  /**
   * Create an AuthError from a generic Error
   */
  static fromError(
    error: Error,
    code: AuthErrorCode = AuthErrorCode.AUTH_UNKNOWN_ERROR,
    context: Record<string, any> = {}
  ): AuthError {
    return this.createError(code, context, error);
  }

  /**
   * Create an OAuth callback error from URL parameters
   */
  static fromOAuthCallback(
    errorParam: string,
    errorDescription?: string,
    context: Record<string, any> = {}
  ): AuthError {
    let code = AuthErrorCode.OAUTH_PROVIDER_ERROR;
    
    // Map common OAuth error types
    if (errorParam === 'access_denied') {
      code = AuthErrorCode.OAUTH_PROVIDER_ERROR;
    } else if (errorParam === 'invalid_request') {
      code = AuthErrorCode.OAUTH_INVALID_PARAMS;
    } else if (errorParam === 'invalid_state') {
      code = AuthErrorCode.OAUTH_STATE_MISMATCH;
    }

    return this.createError(code, {
      ...context,
      oauthError: errorParam,
      oauthErrorDescription: errorDescription
    });
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: AuthError): boolean {
    return error.retryable;
  }

  /**
   * Get error category
   */
  static getCategory(error: AuthError): string {
    return error.context.category || 'general';
  }

  /**
   * Get user-friendly error message with context
   */
  static getUserMessage(error: AuthError, includeRetryInfo: boolean = true): string {
    let message = error.userMessage;
    
    if (includeRetryInfo && error.retryable) {
      message += ' You can try again.';
    } else if (includeRetryInfo && !error.retryable) {
      message += ' Please refresh the page.';
    }
    
    return message;
  }
}