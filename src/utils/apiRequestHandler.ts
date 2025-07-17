/**
 * API Request Handler
 * Utility functions for handling API requests and ensuring proper JSON responses
 */

import { ApiResponseHandler } from './apiResponse';

/**
 * Wraps an API request function with error handling and response formatting
 * @param requestFn The function that makes the API request
 * @param errorMessage Optional custom error message
 */
export const withApiErrorHandling = async <T>(
  requestFn: () => Promise<T>,
  errorMessage: string = 'API request failed'
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    console.error('API request error:', error);
    
    // Format the error response
    const formattedError = ApiResponseHandler.error(
      error instanceof Error ? error : errorMessage,
      error instanceof Response ? error.status : 500
    );
    
    // Throw the formatted error to be caught by the caller
    throw formattedError;
  }
};

/**
 * Ensures that a fetch response returns valid JSON
 * @param response The fetch Response object
 */
export const ensureJsonResponse = async (response: Response): Promise<any> => {
  // Check if the response is OK
  if (!response.ok) {
    // Try to parse the error response as JSON
    try {
      const errorData = await response.json();
      throw ApiResponseHandler.error(
        errorData.message || errorData.error || `HTTP error ${response.status}`,
        response.status,
        errorData
      );
    } catch (e) {
      // If parsing fails, throw a generic error
      throw ApiResponseHandler.error(`HTTP error ${response.status}`, response.status);
    }
  }
  
  // Check if the response is empty
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    // Return an empty success response for non-JSON or empty responses
    return ApiResponseHandler.success(null);
  }
  
  try {
    // Parse the JSON response
    const data = await response.json();
    
    // If the response is already a properly formatted API response, return it as is
    if (data && typeof data === 'object' && 'success' in data) {
      return data;
    }
    
    // Otherwise, wrap it in a success response
    return ApiResponseHandler.success(data);
  } catch (error) {
    // If JSON parsing fails, throw an error
    throw ApiResponseHandler.error('Invalid JSON response', 500);
  }
};

/**
 * Enhanced fetch function that ensures proper JSON responses
 * @param url The URL to fetch
 * @param options The fetch options
 */
export const fetchJson = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  return withApiErrorHandling(async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    
    return ensureJsonResponse(response);
  }, `Failed to fetch ${url}`);
};

/**
 * Validates request data against a schema
 * @param data The data to validate
 * @param schema The validation schema
 */
export const validateRequestData = <T>(
  data: any,
  validate: (data: any) => { valid: boolean; errors?: any }
): T => {
  const validation = validate(data);
  
  if (!validation.valid) {
    throw ApiResponseHandler.error(
      'Validation failed',
      400,
      { validationErrors: validation.errors }
    );
  }
  
  return data as T;
};