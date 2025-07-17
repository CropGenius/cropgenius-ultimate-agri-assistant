/**
 * API Response Middleware
 * Ensures all API endpoints return properly formatted JSON responses
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler, isApiResponse } from '../utils/apiResponse';

/**
 * Middleware to ensure all API responses are properly formatted
 */
export const apiResponseMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override the res.json method to ensure all responses are properly formatted
  res.json = function(body: any) {
    // If the response is already a properly formatted API response, send it as is
    if (isApiResponse(body)) {
      return originalJson.call(this, body);
    }
    
    // Otherwise, wrap it in a success response
    const formattedResponse = ApiResponseHandler.success(body);
    return originalJson.call(this, formattedResponse);
  };
  
  // Add methods to send standardized responses
  res.success = function(data: any, message?: string, status: number = 200) {
    this.status(status).json(ApiResponseHandler.success(data, message, status));
    return this;
  };
  
  res.error = function(error: any, status: number = 500, details?: any) {
    this.status(status).json(ApiResponseHandler.error(error, status, details));
    return this;
  };
  
  res.notFound = function(message: string = 'Resource not found') {
    this.status(404).json(ApiResponseHandler.error(message, 404));
    return this;
  };
  
  res.unauthorized = function(message: string = 'Unauthorized access') {
    this.status(401).json(ApiResponseHandler.error(message, 401));
    return this;
  };
  
  res.forbidden = function(message: string = 'Access forbidden') {
    this.status(403).json(ApiResponseHandler.error(message, 403));
    return this;
  };
  
  res.badRequest = function(message: string = 'Bad request', details?: any) {
    this.status(400).json(ApiResponseHandler.error(message, 400, details));
    return this;
  };
  
  next();
};

// Extend Express Response interface
declare global {
  namespace Express {
    interface Response {
      success(data: any, message?: string, status?: number): Response;
      error(error: any, status?: number, details?: any): Response;
      notFound(message?: string): Response;
      unauthorized(message?: string): Response;
      forbidden(message?: string): Response;
      badRequest(message?: string, details?: any): Response;
    }
  }
}