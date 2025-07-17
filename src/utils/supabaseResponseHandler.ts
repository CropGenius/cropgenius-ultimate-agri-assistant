/**
 * Supabase Response Handler
 * Ensures all Supabase API responses are properly formatted
 */

import { ApiResponseHandler, ApiResponse } from './apiResponse';

/**
 * Handles Supabase query responses and converts them to standardized API responses
 * @param queryResult The result from a Supabase query
 * @param context Optional context for error messages
 */
export const handleSupabaseResponse = <T>(
  queryResult: { data: T | null; error: any },
  context?: string
): ApiResponse<T> => {
  const { data, error } = queryResult;
  
  if (error) {
    return ApiResponseHandler.handleSupabaseError(error, context);
  }
  
  if (data === null) {
    return ApiResponseHandler.error(`${context ? `${context}: ` : ''}No data found`, 404);
  }
  
  return ApiResponseHandler.success(data);
};

/**
 * Wraps a Supabase query function to handle responses
 * @param queryFn Function that returns a Supabase query result
 * @param context Optional context for error messages
 */
export const withSupabaseResponse = <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<ApiResponse<T>> => {
  return queryFn()
    .then(result => handleSupabaseResponse(result, context))
    .catch(error => ApiResponseHandler.error(error, 500));
};

/**
 * Handles Supabase RPC responses
 * @param queryResult The result from a Supabase RPC call
 * @param context Optional context for error messages
 */
export const handleSupabaseRpcResponse = <T>(
  queryResult: { data: T | null; error: any },
  context?: string
): ApiResponse<T> => {
  return handleSupabaseResponse(queryResult, context);
};

/**
 * Handles Supabase authentication responses
 * @param authResult The result from a Supabase auth operation
 * @param context Optional context for error messages
 */
export const handleSupabaseAuthResponse = <T>(
  authResult: { data: { user: T } | null; error: any },
  context?: string
): ApiResponse<T> => {
  const { data, error } = authResult;
  
  if (error) {
    // Handle specific auth errors
    const status = error.status || 401;
    return ApiResponseHandler.error(error.message || 'Authentication failed', status);
  }
  
  if (!data || !data.user) {
    return ApiResponseHandler.error(`${context ? `${context}: ` : ''}Authentication failed`, 401);
  }
  
  return ApiResponseHandler.success(data.user);
};

/**
 * Handles Supabase storage responses
 * @param storageResult The result from a Supabase storage operation
 * @param context Optional context for error messages
 */
export const handleSupabaseStorageResponse = <T>(
  storageResult: { data: T | null; error: any },
  context?: string
): ApiResponse<T> => {
  return handleSupabaseResponse(storageResult, context);
};