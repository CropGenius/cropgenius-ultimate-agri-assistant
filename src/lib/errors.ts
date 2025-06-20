export enum ErrorCode {
  // Authentication Errors
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  
  // Network Errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_FAILED = 'NETWORK_FAILED',
  
  // Credit System Errors
  CREDITS_INSUFFICIENT = 'CREDITS_INSUFFICIENT',
  CREDITS_SYNC_FAILED = 'CREDITS_SYNC_FAILED',
  CREDITS_TRANSACTION_FAILED = 'CREDITS_TRANSACTION_FAILED',
  
  // Field/Map Errors
  MAP_LOAD_FAILED = 'MAP_LOAD_FAILED',
  FIELD_SAVE_FAILED = 'FIELD_SAVE_FAILED',
  LOCATION_ACCESS_DENIED = 'LOCATION_ACCESS_DENIED',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly context?: Record<string, any>;
  public readonly retryable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    context?: Record<string, any>,
    retryable = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
    this.context = context;
    this.retryable = retryable;
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password.',
      [ErrorCode.AUTH_USER_NOT_FOUND]: 'User account not found.',
      [ErrorCode.NETWORK_OFFLINE]: 'You are currently offline. Some features may be limited.',
      [ErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorCode.NETWORK_FAILED]: 'Network error occurred. Please check your connection.',
      [ErrorCode.CREDITS_INSUFFICIENT]: 'Insufficient credits to complete this action.',
      [ErrorCode.CREDITS_SYNC_FAILED]: 'Failed to sync credits. Will retry automatically.',
      [ErrorCode.CREDITS_TRANSACTION_FAILED]: 'Transaction failed. Your credits have been restored.',
      [ErrorCode.MAP_LOAD_FAILED]: 'Failed to load map. Please refresh the page.',
      [ErrorCode.FIELD_SAVE_FAILED]: 'Failed to save field. Changes have been cached offline.',
      [ErrorCode.LOCATION_ACCESS_DENIED]: 'Location access is required for this feature.',
      [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred.',
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    };
    return messages[code];
  }

  static fromError(error: Error, code = ErrorCode.UNKNOWN_ERROR, context?: Record<string, any>): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError(code, error.message, undefined, context);
  }
}

export interface ErrorReporter {
  reportError(error: AppError): void;
  reportWarning(message: string, context?: Record<string, any>): void;
  reportInfo(message: string, context?: Record<string, any>): void;
}

class ConsoleErrorReporter implements ErrorReporter {
  reportError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      userMessage: error.userMessage,
      context: error.context,
      stack: error.stack,
    });
  }

  reportWarning(message: string, context?: Record<string, any>): void {
    console.warn(message, context);
  }

  reportInfo(message: string, context?: Record<string, any>): void {
    console.info(message, context);
  }
}

// Singleton error reporter
let errorReporter: ErrorReporter = new ConsoleErrorReporter();

export const setErrorReporter = (reporter: ErrorReporter): void => {
  errorReporter = reporter;
};

export const reportError = (error: AppError): void => {
  errorReporter.reportError(error);
};

export const reportWarning = (message: string, context?: Record<string, any>): void => {
  errorReporter.reportWarning(message, context);
};

export const reportInfo = (message: string, context?: Record<string, any>): void => {
  errorReporter.reportInfo(message, context);
};