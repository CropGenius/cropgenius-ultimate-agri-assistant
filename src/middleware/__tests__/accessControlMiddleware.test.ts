import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  verifyAuth, 
  requireRoles, 
  requireAdmin, 
  requireFarmerOrAdmin,
  requireOwnership,
  UserRole
} from '../accessControlMiddleware';
import { ApiResponseHandler } from '../../utils/apiResponse';

// Mock Supabase client
vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock ApiResponseHandler
vi.mock('../../utils/apiResponse', () => ({
  ApiResponseHandler: {
    error: vi.fn().mockImplementation((message, status) => ({
      success: false,
      error: message,
      status,
      timestamp: expect.any(String)
    }))
  }
}));

// Import the mocked supabase client
import { supabase } from '../../integrations/supabase/client';

describe('accessControlMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;
  
  beforeEach(() => {
    req = {
      headers: {},
      user: undefined
    };
    
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    next = vi.fn();
    
    vi.clearAllMocks();
  });
  
  describe('verifyAuth', () => {
    it('should return 401 if authorization header is missing', async () => {
      await verifyAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Authorization header missing'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is missing', async () => {
      req.headers.authorization = 'Bearer ';
      
      await verifyAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid authorization format'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token verification fails', async () => {
      req.headers.authorization = 'Bearer token123';
      
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });
      
      await verifyAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid or expired token'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should attach user to request and call next if token is valid', async () => {
      req.headers.authorization = 'Bearer validToken';
      
      const mockUser = { id: 'user123', email: 'test@example.com' };
      
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: UserRole.FARMER },
          error: null
        })
      });
      
      await verifyAuth(req, res, next);
      
      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: UserRole.FARMER
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should use default guest role if profile fetch fails', async () => {
      req.headers.authorization = 'Bearer validToken';
      
      const mockUser = { id: 'user123', email: 'test@example.com' };
      
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' }
        })
      });
      
      await verifyAuth(req, res, next);
      
      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: UserRole.GUEST
      });
      expect(next).toHaveBeenCalled();
    });
  });
  
  describe('requireRoles', () => {
    it('should return 401 if user is not authenticated', () => {
      const middleware = requireRoles([UserRole.ADMIN]);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Authentication required'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user does not have required role', () => {
      const middleware = requireRoles([UserRole.ADMIN]);
      
      req.user = {
        id: 'user123',
        role: UserRole.FARMER
      };
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Access forbidden: insufficient permissions'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next if user has required role', () => {
      const middleware = requireRoles([UserRole.ADMIN, UserRole.FARMER]);
      
      req.user = {
        id: 'user123',
        role: UserRole.FARMER
      };
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
  
  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      req.user = {
        id: 'admin123',
        role: UserRole.ADMIN
      };
      
      requireAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should deny access for non-admin users', () => {
      req.user = {
        id: 'farmer123',
        role: UserRole.FARMER
      };
      
      requireAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('requireFarmerOrAdmin', () => {
    it('should allow access for admin users', () => {
      req.user = {
        id: 'admin123',
        role: UserRole.ADMIN
      };
      
      requireFarmerOrAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should allow access for farmer users', () => {
      req.user = {
        id: 'farmer123',
        role: UserRole.FARMER
      };
      
      requireFarmerOrAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should deny access for extension officer users', () => {
      req.user = {
        id: 'officer123',
        role: UserRole.EXTENSION_OFFICER
      };
      
      requireFarmerOrAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('requireOwnership', () => {
    it('should allow access for resource owners', async () => {
      req.user = {
        id: 'user123',
        role: UserRole.FARMER
      };
      
      const getResourceOwnerId = vi.fn().mockResolvedValue('user123');
      const middleware = requireOwnership(getResourceOwnerId);
      
      await middleware(req, res, next);
      
      expect(getResourceOwnerId).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should deny access for non-owners', async () => {
      req.user = {
        id: 'user123',
        role: UserRole.FARMER
      };
      
      const getResourceOwnerId = vi.fn().mockResolvedValue('otherUser');
      const middleware = requireOwnership(getResourceOwnerId);
      
      await middleware(req, res, next);
      
      expect(getResourceOwnerId).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should allow access for admins regardless of ownership', async () => {
      req.user = {
        id: 'admin123',
        role: UserRole.ADMIN
      };
      
      const getResourceOwnerId = vi.fn(); // Should not be called
      const middleware = requireOwnership(getResourceOwnerId);
      
      await middleware(req, res, next);
      
      expect(getResourceOwnerId).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should handle errors in ownership verification', async () => {
      req.user = {
        id: 'user123',
        role: UserRole.FARMER
      };
      
      const error = new Error('Database error');
      const getResourceOwnerId = vi.fn().mockRejectedValue(error);
      const middleware = requireOwnership(getResourceOwnerId);
      
      await middleware(req, res, next);
      
      expect(getResourceOwnerId).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to verify resource ownership'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});