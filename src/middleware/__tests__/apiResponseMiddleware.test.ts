import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiResponseMiddleware } from '../apiResponseMiddleware';
import { ApiResponseHandler } from '../../utils/apiResponse';

describe('apiResponseMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;
  
  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });
  
  it('should call next function', () => {
    apiResponseMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  
  it('should override res.json method', () => {
    const originalJson = res.json;
    apiResponseMiddleware(req, res, next);
    expect(res.json).not.toBe(originalJson);
  });
  
  it('should add helper methods to res object', () => {
    apiResponseMiddleware(req, res, next);
    expect(typeof res.success).toBe('function');
    expect(typeof res.error).toBe('function');
    expect(typeof res.notFound).toBe('function');
    expect(typeof res.unauthorized).toBe('function');
    expect(typeof res.forbidden).toBe('function');
    expect(typeof res.badRequest).toBe('function');
  });
  
  describe('res.json override', () => {
    beforeEach(() => {
      apiResponseMiddleware(req, res, next);
    });
    
    it('should wrap non-ApiResponse objects in success response', () => {
      const data = { id: 1, name: 'Test' };
      res.json(data);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data,
        status: 200,
        timestamp: expect.any(String)
      }));
    });
    
    it('should not modify ApiResponse objects', () => {
      const apiResponse = ApiResponseHandler.success({ test: true });
      res.json(apiResponse);
      
      expect(res.json).toHaveBeenCalledWith(apiResponse);
    });
  });
  
  describe('helper methods', () => {
    beforeEach(() => {
      apiResponseMiddleware(req, res, next);
    });
    
    it('res.success should send success response with correct status', () => {
      const data = { id: 1 };
      const message = 'Success message';
      const status = 201;
      
      res.success(data, message, status);
      
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data,
        message,
        status
      }));
    });
    
    it('res.error should send error response with correct status', () => {
      const error = 'Error message';
      const status = 500;
      
      res.error(error, status);
      
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error,
        status
      }));
    });
    
    it('res.notFound should send 404 error response', () => {
      const message = 'Custom not found message';
      
      res.notFound(message);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: message,
        status: 404
      }));
    });
    
    it('res.unauthorized should send 401 error response', () => {
      res.unauthorized();
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Unauthorized access',
        status: 401
      }));
    });
    
    it('res.forbidden should send 403 error response', () => {
      res.forbidden();
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Access forbidden',
        status: 403
      }));
    });
    
    it('res.badRequest should send 400 error response with optional details', () => {
      const message = 'Invalid input';
      const details = { field: 'email', error: 'required' };
      
      res.badRequest(message, details);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: message,
        status: 400,
        details
      }));
    });
  });
});