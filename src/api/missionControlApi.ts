/**
 * Mission Control API
 * Secure API endpoints for admin-only mission control functionality
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponseHandler } from '@/utils/apiResponse';

/**
 * Fetch users for the admin dashboard with pagination
 */
export const fetchUsers = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  searchQuery?: string
) => {
  try {
    // First verify the user has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return ApiResponseHandler.error('Authentication failed', 401);
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return ApiResponseHandler.error('Failed to verify permissions', 500);
    }
    
    if (profile?.role !== 'admin') {
      return ApiResponseHandler.error('Access forbidden: admin role required', 403);
    }
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Build query
    let query = supabase
      .from('profiles')
      .select('id, email, role, created_at, last_sign_in_at, full_name, phone_number', { count: 'exact' });
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
    }
    
    // Add pagination
    query = query.range(from, to).order('created_at', { ascending: false });
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      return ApiResponseHandler.error(`Failed to fetch users: ${error.message}`, 500);
    }
    
    // Return paginated response
    return ApiResponseHandler.paginated(
      data || [],
      count || 0,
      page,
      limit
    );
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (token: string, userId: string) => {
  try {
    // First verify the user has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return ApiResponseHandler.error('Authentication failed', 401);
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return ApiResponseHandler.error('Failed to verify permissions', 500);
    }
    
    if (profile?.role !== 'admin') {
      return ApiResponseHandler.error('Access forbidden: admin role required', 403);
    }
    
    // Prevent deleting yourself
    if (userId === user.id) {
      return ApiResponseHandler.error('Cannot delete your own account', 400);
    }
    
    // Delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      return ApiResponseHandler.error(`Failed to delete user: ${deleteError.message}`, 500);
    }
    
    // Return success response
    return ApiResponseHandler.success(
      { deleted: true, userId },
      'User deleted successfully',
      200
    );
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Get system statistics for admin dashboard
 */
export const getSystemStats = async (token: string) => {
  try {
    // First verify the user has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return ApiResponseHandler.error('Authentication failed', 401);
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return ApiResponseHandler.error('Failed to verify permissions', 500);
    }
    
    if (profile?.role !== 'admin') {
      return ApiResponseHandler.error('Access forbidden: admin role required', 403);
    }
    
    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (userCountError) {
      return ApiResponseHandler.error(`Failed to get user count: ${userCountError.message}`, 500);
    }
    
    // Get fields count
    const { count: fieldsCount, error: fieldsCountError } = await supabase
      .from('fields')
      .select('*', { count: 'exact', head: true });
    
    if (fieldsCountError) {
      return ApiResponseHandler.error(`Failed to get fields count: ${fieldsCountError.message}`, 500);
    }
    
    // Get scans count
    const { count: scansCount, error: scansCountError } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true });
    
    if (scansCountError) {
      return ApiResponseHandler.error(`Failed to get scans count: ${scansCountError.message}`, 500);
    }
    
    // Return stats
    return ApiResponseHandler.success({
      userCount: userCount || 0,
      fieldsCount: fieldsCount || 0,
      scansCount: scansCount || 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (token: string, userId: string, newRole: string) => {
  try {
    // First verify the user has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return ApiResponseHandler.error('Authentication failed', 401);
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return ApiResponseHandler.error('Failed to verify permissions', 500);
    }
    
    if (profile?.role !== 'admin') {
      return ApiResponseHandler.error('Access forbidden: admin role required', 403);
    }
    
    // Prevent changing your own role
    if (userId === user.id) {
      return ApiResponseHandler.error('Cannot change your own role', 400);
    }
    
    // Validate role
    const validRoles = ['admin', 'farmer', 'agronomist', 'viewer'];
    if (!validRoles.includes(newRole)) {
      return ApiResponseHandler.error('Invalid role', 400);
    }
    
    // Update user role
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      return ApiResponseHandler.error(`Failed to update user role: ${error.message}`, 500);
    }
    
    // Return success response
    return ApiResponseHandler.success(
      data,
      'User role updated successfully',
      200
    );
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};