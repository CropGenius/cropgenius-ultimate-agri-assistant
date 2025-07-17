import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMissionControl } from '../useMissionControl';
import { fetchUsers, deleteUser, getSystemStats, updateUserRole } from '@/api/missionControlApi';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/api/missionControlApi', () => ({
  fetchUsers: vi.fn(),
  deleteUser: vi.fn(),
  getSystemStats: vi.fn(),
  updateUserRole: vi.fn()
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Helper to create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMissionControl', () => {
  const mockToken = 'valid-token';
  const mockSession = { access_token: mockToken };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth context with a valid session
    (useAuthContext as any).mockReturnValue({
      session: mockSession
    });
    
    // Mock API responses
    (fetchUsers as any).mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 'user1', email: 'user1@example.com', role: 'farmer' },
          { id: 'user2', email: 'user2@example.com', role: 'admin' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    });
    
    (getSystemStats as any).mockResolvedValue({
      success: true,
      data: {
        userCount: 42,
        fieldsCount: 100,
        scansCount: 500,
        lastUpdated: new Date().toISOString()
      }
    });
  });
  
  it('should fetch users and stats on initial render', async () => {
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Initial state should be loading
    expect(result.current.isLoadingUsers).toBe(true);
    expect(result.current.isLoadingStats).toBe(true);
    
    // Wait for queries to resolve
    await waitFor(() => !result.current.isLoadingUsers && !result.current.isLoadingStats);
    
    // Verify API calls
    expect(fetchUsers).toHaveBeenCalledWith(mockToken, 1, 10, '');
    expect(getSystemStats).toHaveBeenCalledWith(mockToken);
    
    // Verify data
    expect(result.current.users).toHaveLength(2);
    expect(result.current.stats).toEqual({
      userCount: 42,
      fieldsCount: 100,
      scansCount: 500,
      lastUpdated: expect.any(String)
    });
  });
  
  it('should handle pagination changes', async () => {
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers);
    
    // Change page
    act(() => {
      result.current.handlePageChange(2);
    });
    
    // Verify page state updated
    expect(result.current.page).toBe(2);
    
    // Wait for query to be called with new page
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(mockToken, 2, 10, '');
    });
    
    // Change limit
    act(() => {
      result.current.handleLimitChange(20);
    });
    
    // Verify limit state updated and page reset to 1
    expect(result.current.limit).toBe(20);
    expect(result.current.page).toBe(1);
    
    // Wait for query to be called with new limit
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(mockToken, 1, 20, '');
    });
  });
  
  it('should handle search', async () => {
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers);
    
    // Perform search
    act(() => {
      result.current.handleSearch('test');
    });
    
    // Verify search state updated and page reset to 1
    expect(result.current.searchQuery).toBe('test');
    expect(result.current.page).toBe(1);
    
    // Wait for query to be called with search query
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(mockToken, 1, 10, 'test');
    });
  });
  
  it('should handle user deletion', async () => {
    // Mock successful deletion
    (deleteUser as any).mockResolvedValue({
      success: true,
      data: { deleted: true, userId: 'user1' }
    });
    
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers);
    
    // Delete user
    act(() => {
      result.current.handleDeleteUser('user1');
    });
    
    // Verify deletion in progress
    expect(result.current.isDeleting).toBe(true);
    
    // Wait for mutation to complete
    await waitFor(() => !result.current.isDeleting);
    
    // Verify API call
    expect(deleteUser).toHaveBeenCalledWith(mockToken, 'user1');
    
    // Verify toast notification
    expect(toast.success).toHaveBeenCalledWith('User deleted successfully');
  });
  
  it('should handle user role update', async () => {
    // Mock successful role update
    (updateUserRole as any).mockResolvedValue({
      success: true,
      data: { id: 'user1', role: 'admin' }
    });
    
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers);
    
    // Update user role
    act(() => {
      result.current.handleUpdateUserRole('user1', 'admin');
    });
    
    // Verify update in progress
    expect(result.current.isUpdatingRole).toBe(true);
    
    // Wait for mutation to complete
    await waitFor(() => !result.current.isUpdatingRole);
    
    // Verify API call
    expect(updateUserRole).toHaveBeenCalledWith(mockToken, 'user1', 'admin');
    
    // Verify toast notification
    expect(toast.success).toHaveBeenCalledWith('User role updated successfully');
  });
  
  it('should handle error in user deletion', async () => {
    // Mock failed deletion
    (deleteUser as any).mockResolvedValue({
      success: false,
      error: 'Permission denied'
    });
    
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers);
    
    // Delete user
    act(() => {
      result.current.handleDeleteUser('user1');
    });
    
    // Wait for mutation to complete
    await waitFor(() => !result.current.isDeleting);
    
    // Verify toast error notification
    expect(toast.error).toHaveBeenCalledWith('Permission denied');
  });
  
  it('should refresh all data', async () => {
    const { result, waitFor } = renderHook(() => useMissionControl(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial queries to resolve
    await waitFor(() => !result.current.isLoadingUsers && !result.current.isLoadingStats);
    
    // Clear mock calls
    vi.clearAllMocks();
    
    // Refresh all data
    act(() => {
      result.current.refreshAll();
    });
    
    // Verify API calls
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(mockToken, 1, 10, '');
      expect(getSystemStats).toHaveBeenCalledWith(mockToken);
    });
  });
});