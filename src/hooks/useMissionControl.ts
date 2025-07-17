/**
 * Mission Control Hook
 * Custom hook for accessing mission control functionality
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';
import { fetchUsers, deleteUser, getSystemStats, updateUserRole } from '@/api/missionControlApi';

export const useMissionControl = () => {
  const { session } = useAuthContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const token = session?.access_token;
  
  // Fetch users with pagination and search
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['mission-control', 'users', page, limit, searchQuery],
    queryFn: () => fetchUsers(token!, page, limit, searchQuery),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
  
  // Fetch system stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['mission-control', 'stats'],
    queryFn: () => getSystemStats(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(token!, userId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['mission-control', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['mission-control', 'stats'] });
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Failed to delete user'}`);
    }
  });
  
  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      updateUserRole(token!, userId, role),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User role updated successfully');
        queryClient.invalidateQueries({ queryKey: ['mission-control', 'users'] });
      } else {
        toast.error(data.error || 'Failed to update user role');
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Failed to update user role'}`);
    }
  });
  
  // Handle pagination change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  // Handle limit change
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);
  
  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  }, []);
  
  // Handle sort change
  const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1); // Reset to first page when sorting
  }, []);
  
  // Handle role filter change
  const handleRoleFilterChange = useCallback((role: string) => {
    setRoleFilter(role);
    setPage(1); // Reset to first page when filtering
  }, []);
  
  // Handle user deletion
  const handleDeleteUser = useCallback((userId: string) => {
    deleteUserMutation.mutate(userId);
  }, [deleteUserMutation]);
  
  // Handle user role update
  const handleUpdateUserRole = useCallback((userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  }, [updateUserRoleMutation]);
  
  // Refresh all data
  const refreshAll = useCallback(() => {
    refetchUsers();
    refetchStats();
  }, [refetchUsers, refetchStats]);
  
  return {
    // Users data and pagination
    users: usersData?.data?.items || [],
    pagination: usersData?.data?.pagination,
    isLoadingUsers,
    usersError,
    page,
    limit,
    searchQuery,
    sortBy,
    sortOrder,
    roleFilter,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleSortChange,
    handleRoleFilterChange,
    
    // System stats
    stats: statsData?.data,
    isLoadingStats,
    statsError,
    
    // Actions
    handleDeleteUser,
    handleUpdateUserRole,
    isDeleting: deleteUserMutation.isPending,
    isUpdatingRole: updateUserRoleMutation.isPending,
    
    // Refresh
    refreshAll
  };
};