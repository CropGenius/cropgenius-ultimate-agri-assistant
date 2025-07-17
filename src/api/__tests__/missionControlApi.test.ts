import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUsers, deleteUser, getSystemStats, updateUserRole } from '../missionControlApi';
import { ApiResponseHandler } from '@/utils/apiResponse';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      admin: {
        deleteUser: vi.fn()
      }
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock ApiResponseHandler
vi.mock('@/utils/apiResponse', () => ({
  ApiResponseHandler: {
    error: vi.fn().mockImplementation((message, status) => ({
      success: false,
      error: message,
      status: status || 500,
      timestamp: expect.any(String)
    })),
    success: vi.fn().mockImplementation((data, message, status) => ({
      success: true,
      data,
      message,
      status: status || 200,
      timestamp: expect.any(String)
    })),
    paginated: vi.fn().mockImplementation((data, total, page, limit) => ({
      success: true,
      data: {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      status: 200,
      timestamp: expect.any(String)
    }))
  }
}));

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client';

describe('missionControlApi', () => {
  const mockToken = 'valid-token';
  const mockAdminUser = { id: 'admin-id', email: 'admin@example.com' };
  const mockFarmerUser = { id: 'farmer-id', email: 'farmer@example.com' };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('fetchUsers', () => {
    it('should return 401 if authentication fails', async () => {
      // Mock auth failure
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });
      
      const result = await fetchUsers(mockToken);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Authentication failed', 401);
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
    
    it('should return 403 if user is not an admin', async () => {
      // Mock successful auth but non-admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockFarmerUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'farmer' },
        error: null
      });
      
      const result = await fetchUsers(mockToken);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Access forbidden: admin role required', 403);
      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
    });
    
    it('should return paginated users for admin users', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock users query result
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', role: 'farmer' },
        { id: 'user2', email: 'user2@example.com', role: 'farmer' }
      ];
      
      (supabase.order as any).mockResolvedValue({
        data: mockUsers,
        error: null,
        count: 10
      });
      
      const result = await fetchUsers(mockToken, 1, 2);
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.range).toHaveBeenCalledWith(0, 1);
      expect(ApiResponseHandler.paginated).toHaveBeenCalledWith(mockUsers, 10, 1, 2);
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockUsers);
      expect(result.data.pagination.total).toBe(10);
    });
    
    it('should apply search filter when provided', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock users query result
      (supabase.order as any).mockResolvedValue({
        data: [],
        error: null,
        count: 0
      });
      
      await fetchUsers(mockToken, 1, 10, 'test');
      
      expect(supabase.or).toHaveBeenCalledWith('email.ilike.%test%,full_name.ilike.%test%');
    });
    
    it('should handle database errors', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock database error
      (supabase.order as any).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null
      });
      
      const result = await fetchUsers(mockToken);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Failed to fetch users: Database error', 500);
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
    });
  });
  
  describe('deleteUser', () => {
    it('should return 401 if authentication fails', async () => {
      // Mock auth failure
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });
      
      const result = await deleteUser(mockToken, 'user-id');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Authentication failed', 401);
      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });
    
    it('should return 403 if user is not an admin', async () => {
      // Mock successful auth but non-admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockFarmerUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'farmer' },
        error: null
      });
      
      const result = await deleteUser(mockToken, 'user-id');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Access forbidden: admin role required', 403);
      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
    });
    
    it('should prevent deleting your own account', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      const result = await deleteUser(mockToken, mockAdminUser.id);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Cannot delete your own account', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should delete user successfully', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock successful user deletion
      (supabase.auth.admin.deleteUser as any).mockResolvedValue({
        error: null
      });
      
      const userIdToDelete = 'user-to-delete';
      const result = await deleteUser(mockToken, userIdToDelete);
      
      expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith(userIdToDelete);
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(
        { deleted: true, userId: userIdToDelete },
        'User deleted successfully',
        200
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ deleted: true, userId: userIdToDelete });
    });
    
    it('should handle deletion errors', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock deletion error
      (supabase.auth.admin.deleteUser as any).mockResolvedValue({
        error: { message: 'User not found' }
      });
      
      const result = await deleteUser(mockToken, 'user-id');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Failed to delete user: User not found', 500);
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
    });
  });
  
  describe('getSystemStats', () => {
    it('should return system stats for admin users', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock count queries
      const mockCounts = { count: 42, error: null };
      (supabase.from as any)
        .mockImplementationOnce(() => ({
          select: () => ({
            count: 'exact',
            head: true,
            ...mockCounts
          })
        }))
        .mockImplementationOnce(() => ({
          select: () => ({
            count: 'exact',
            head: true,
            ...mockCounts
          })
        }))
        .mockImplementationOnce(() => ({
          select: () => ({
            count: 'exact',
            head: true,
            ...mockCounts
          })
        }));
      
      const result = await getSystemStats(mockToken);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        userCount: 42,
        fieldsCount: 42,
        scansCount: 42,
        lastUpdated: expect.any(String)
      });
    });
  });
  
  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any)
        .mockResolvedValueOnce({
          data: { role: 'admin' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { id: 'user-id', role: 'admin' },
          error: null
        });
      
      const result = await updateUserRole(mockToken, 'user-id', 'admin');
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.update).toHaveBeenCalledWith({ role: 'admin' });
      expect(supabase.eq).toHaveBeenCalledWith('id', 'user-id');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'user-id', role: 'admin' });
    });
    
    it('should validate role input', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      const result = await updateUserRole(mockToken, 'user-id', 'invalid-role');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Invalid role', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should prevent changing your own role', async () => {
      // Mock successful auth with admin role
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });
      
      (supabase.single as any).mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      const result = await updateUserRole(mockToken, mockAdminUser.id, 'farmer');
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Cannot change your own role', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });
});