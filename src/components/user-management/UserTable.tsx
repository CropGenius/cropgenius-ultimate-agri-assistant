/**
 * UserTable Component
 * Advanced user management table with pagination, search, and actions
 */

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  UserCog, 
  Trash2, 
  Shield, 
  Eye,
  Leaf,
  Microscope,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  role?: 'admin' | 'farmer' | 'agronomist' | 'viewer';
  created_at?: string;
  last_sign_in_at?: string;
  onboarding_completed?: boolean;
  ai_usage_count?: number;
}

export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserTableProps {
  users: User[];
  pagination?: PaginationInfo;
  isLoading?: boolean;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  roleFilter?: string;
  onSearchChange?: (query: string) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onRoleFilterChange?: (role: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onViewUser?: (user: User) => void;
  className?: string;
  pageSize?: number;
}

const ROLE_CONFIG = {
  admin: { 
    label: 'Admin', 
    icon: Shield, 
    variant: 'default' as const,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  farmer: { 
    label: 'Farmer', 
    icon: Leaf, 
    variant: 'secondary' as const,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  agronomist: { 
    label: 'Agronomist', 
    icon: Microscope, 
    variant: 'outline' as const,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  viewer: { 
    label: 'Viewer', 
    icon: Eye, 
    variant: 'outline' as const,
    color: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const UserTable: React.FC<UserTableProps> = ({
  users,
  pagination,
  isLoading = false,
  searchQuery = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  roleFilter = 'all',
  onSearchChange,
  onSortChange,
  onRoleFilterChange,
  onPageChange,
  onPageSizeChange,
  onEditUser,
  onDeleteUser,
  onViewUser,
  className,
  pageSize = 10
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle sort change
  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange?.(field, newOrder);
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  // Render role badge
  const renderRoleBadge = (role?: User['role']) => {
    if (!role) return <Badge variant="outline">Unknown</Badge>;
    
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNext, hasPrev, total } = pagination;
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {total} users
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(1)}
            disabled={!hasPrev}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Page</span>
            <span className="text-sm font-medium">{currentPage}</span>
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(totalPages)}
            disabled={!hasNext}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="agronomist">Agronomist</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('full_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {getSortIcon('full_name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center space-x-1">
                  <span>Role</span>
                  {getSortIcon('role')}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Joined</span>
                  {getSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('last_sign_in_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Active</span>
                  {getSortIcon('last_sign_in_at')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || roleFilter !== 'all' 
                    ? 'No users found matching your criteria' 
                    : 'No users found'
                  }
                </TableCell>
              </TableRow>
            ) : (
              // User rows
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.full_name || 'Unnamed User'}
                      </span>
                      {user.phone_number && (
                        <span className="text-xs text-muted-foreground">
                          {user.phone_number}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.email || 'No email'}</span>
                  </TableCell>
                  <TableCell>
                    {renderRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        variant={user.onboarding_completed ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {user.onboarding_completed ? 'Active' : 'Pending'}
                      </Badge>
                      {user.ai_usage_count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {user.ai_usage_count} AI uses
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.created_at 
                        ? format(new Date(user.created_at), 'MMM d, yyyy')
                        : 'Unknown'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.last_sign_in_at 
                        ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                        : 'Never'
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onViewUser && (
                          <DropdownMenuItem onClick={() => onViewUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEditUser && (
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDeleteUser && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteUser(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};