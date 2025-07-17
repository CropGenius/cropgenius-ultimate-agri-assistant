/**
 * Access Control Middleware
 * Implements role-based access control for API routes
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../integrations/supabase/client';
import { ApiResponseHandler } from '../utils/apiResponse';

/**
 * User role types
 */
export enum UserRole {
  ADMIN = 'admin',
  FARMER = 'farmer',
  EXTENSION_OFFICER = 'extension_officer',
  GUEST = 'guest'
}

/**
 * Interface for the user object with role information
 */
interface AuthUser {
  id: string;
  role?: UserRole;
  email?: string;
}

/**
 * Middleware to verify JWT token and extract user information
 */
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(ApiResponseHandler.error('Authorization header missing', 401));
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json(ApiResponseHandler.error('Invalid authorization format', 401));
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json(ApiResponseHandler.error('Invalid or expired token', 401));
    }
    
    // Get user role from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }
    
    // Attach user to request object
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: profile?.role || UserRole.GUEST
    };
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json(ApiResponseHandler.error('Authentication failed', 401));
  }
};

/**
 * Middleware to require specific roles for access
 * @param roles Array of allowed roles
 */
export const requireRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    
    if (!user) {
      return res.status(401).json(ApiResponseHandler.error('Authentication required', 401));
    }
    
    if (!user.role || !roles.includes(user.role)) {
      return res.status(403).json(ApiResponseHandler.error('Access forbidden: insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRoles([UserRole.ADMIN]);

/**
 * Middleware to require farmer or admin role
 */
export const requireFarmerOrAdmin = requireRoles([UserRole.FARMER, UserRole.ADMIN]);

/**
 * Middleware to require extension officer or admin role
 */
export const requireExtensionOfficerOrAdmin = requireRoles([UserRole.EXTENSION_OFFICER, UserRole.ADMIN]);

/**
 * Middleware to check if user owns the resource
 * @param getResourceOwnerId Function to extract the owner ID from the request
 */
export const requireOwnership = (
  getResourceOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    
    if (!user) {
      return res.status(401).json(ApiResponseHandler.error('Authentication required', 401));
    }
    
    // Admin can access any resource
    if (user.role === UserRole.ADMIN) {
      return next();
    }
    
    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId || ownerId !== user.id) {
        return res.status(403).json(ApiResponseHandler.error('Access forbidden: you do not own this resource', 403));
      }
      
      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      return res.status(500).json(ApiResponseHandler.error('Failed to verify resource ownership', 500));
    }
  };
};