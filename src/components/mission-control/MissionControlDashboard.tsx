/**
 * Mission Control Dashboard Component
 * Admin-only dashboard for system-wide management with enhanced user management
 */

import React, { useState } from 'react';
import { 
  Users, 
  RefreshCw, 
  Leaf,
  Map,
  Activity
} from 'lucide-react';
import { useMissionControl } from '@/hooks/useMissionControl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserTable } from '@/components/user-management/UserTable';
import { UserDeleteConfirmation } from '@/components/user-management/UserDeleteConfirmation';
import { RoleEditor } from '@/components/user-management/RoleEditor';
import { format } from 'date-fns';
import type { User } from '@/components/user-management/UserTable';

const MissionControlDashboard: React.FC = () => {
  const {
    users,
    pagination,
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
    stats,
    isLoadingStats,
    statsError,
    handleDeleteUser,
    handleUpdateUserRole,
    isDeleting,
    isUpdatingRole,
    refreshAll
  } = useMissionControl();
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  // Convert users to the UserTable format
  const tableUsers: User[] = users.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone_number: user.phone_number,
    role: user.role as User['role'],
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    onboarding_completed: user.onboarding_completed,
    ai_usage_count: user.ai_usage_count
  }));
  
  // Handle user actions
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
  };
  
  const handleDeleteUserAction = (userId: string) => {
    const user = tableUsers.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };
  
  const handleConfirmDelete = (userId: string) => {
    handleDeleteUser(userId);
    setUserToDelete(null);
  };
  
  const handleUpdateRole = (userId: string, newRole: string) => {
    handleUpdateUserRole(userId, newRole);
    setUserToEdit(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.fieldsCount || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.scansCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>Advanced user management with enhanced controls</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAll}
              disabled={isLoadingUsers || isLoadingStats}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable
            users={tableUsers}
            pagination={pagination}
            isLoading={isLoadingUsers}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            roleFilter={roleFilter}
            pageSize={limit}
            onSearchChange={handleSearch}
            onSortChange={handleSortChange}
            onRoleFilterChange={handleRoleFilterChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handleLimitChange}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUserAction}
          />
          
          {/* Error Display */}
          {usersError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-destructive" />
                <p className="font-medium text-destructive">Error loading users</p>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                {usersError instanceof Error ? usersError.message : 'An unknown error occurred'}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Last updated: {stats?.lastUpdated ? format(new Date(stats.lastUpdated), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
          </p>
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">System Status: Operational</span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Enhanced Delete Confirmation */}
      <UserDeleteConfirmation
        user={userToDelete}
        isOpen={!!userToDelete}
        isDeleting={isDeleting}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        requireConfirmation={true}
        showUserDetails={true}
      />
      
      {/* Enhanced Role Editor */}
      <RoleEditor
        user={userToEdit}
        isOpen={!!userToEdit}
        isUpdating={isUpdatingRole}
        onClose={() => setUserToEdit(null)}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default MissionControlDashboard;