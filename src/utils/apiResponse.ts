/**
 * API Response Standardization Utility
 * Ensures all API endpoints return consistent JSON responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  timestamp: string;
  details?: any;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export class ApiResponseHandler {
  /**
   * Create a successful API response
   */
  static success<T>(data: T, message?: string, status: number = 200): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an error API response
   */
  static error(
    error: string | Error | ApiError, 
    status: number = 500, 
    details?: any
  ): ApiResponse {
    let errorMessage: string;
    let errorDetails: any = details;

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Include error name in details if not already provided
      if (!details && error.name !== 'Error') {
        errorDetails = { errorType: error.name };
      }
    } else {
      errorMessage = error.message;
      // Include error code in details if not already provided
      if (!details && error.code) {
        errorDetails = { errorCode: error.code };
      }
    }

    return {
      success: false,
      error: errorMessage,
      status,
      timestamp: new Date().toISOString(),
      ...(errorDetails && { details: errorDetails })
    };
  }

  /**
   * Handle Supabase errors and convert to standard format
   */
  static handleSupabaseError(error: any, context?: string): ApiResponse {
    const contextMessage = context ? `${context}: ` : '';
    
    // Handle different types of Supabase errors
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return this.error(`${contextMessage}No data found`, 404);
        case 'PGRST301':
          return this.error(`${contextMessage}Unauthorized access`, 401);
        case '23505':
          return this.error(`${contextMessage}Duplicate entry`, 409);
        case '23503':
          return this.error(`${contextMessage}Referenced record not found`, 400);
        case '42501':
          return this.error(`${contextMessage}Insufficient permissions`, 403);
        default:
          return this.error(`${contextMessage}${error.message}`, 500);
      }
    }

    if (error?.message) {
      return this.error(`${contextMessage}${error.message}`, 500);
    }

    return this.error(`${contextMessage}Unknown database error`, 500);
  }

  /**
   * Validate and sanitize API response before sending
   */
  static validate<T>(response: ApiResponse<T>): ApiResponse<T> {
    // Ensure required fields are present
    if (typeof response.success !== 'boolean') {
      response.success = false;
    }

    if (typeof response.status !== 'number') {
      response.status = response.success ? 200 : 500;
    }

    if (!response.timestamp) {
      response.timestamp = new Date().toISOString();
    }

    // Remove sensitive information in production
    if (import.meta.env.PROD && response.error) {
      // Don't expose internal error details in production
      if (response.status === 500) {
        response.error = 'Internal server error';
        delete response.details;
      }
    }

    return response;
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[], 
    total: number, 
    page: number = 1, 
    limit: number = 10
  ): ApiResponse<{
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const totalPages = Math.ceil(total / limit);
    
    return this.success({
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  }
}

/**
 * HTTP Status Code Constants
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Common API Error Codes
 */
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const;

/**
 * Middleware function to ensure all responses are properly formatted
 */
export const ensureJsonResponse = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      const result = await handler(...args);
      
      // If result is already a proper ApiResponse, return it
      if (result && typeof result === 'object' && 'success' in result) {
        return ApiResponseHandler.validate(result);
      }
      
      // If result is data, wrap it in a success response
      return ApiResponseHandler.success(result);
    } catch (error) {
      console.error('API Handler Error:', error);
      return ApiResponseHandler.error(error as Error);
    }
  };
};

/**
 * Type guard to check if response is an ApiResponse
 */
export const isApiResponse = (obj: any): obj is ApiResponse => {
  return obj && typeof obj === 'object' && 'success' in obj && 'timestamp' in obj;
};