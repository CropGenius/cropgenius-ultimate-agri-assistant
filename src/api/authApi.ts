/**
 * Authentication API
 * Handles API requests for authentication
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponseHandler } from '@/utils/apiResponse';

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for signup data
 */
export interface SignupData extends LoginCredentials {
  full_name?: string;
  phone_number?: string;
}

/**
 * Interface for user data
 */
export interface UserData {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
  last_sign_in_at?: string;
}

/**
 * Interface for authentication response
 */
export interface AuthResponse {
  user: UserData;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

/**
 * Login with email and password
 * @param credentials Login credentials
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; data?: AuthResponse; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!credentials.email) {
      return ApiResponseHandler.error('Email is required', 400);
    }
    
    if (!credentials.password) {
      return ApiResponseHandler.error('Password is required', 400);
    }
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return ApiResponseHandler.error('Invalid email or password', 401);
      }
      
      return ApiResponseHandler.error(`Authentication failed: ${error.message}`, 401);
    }
    
    if (!data.user || !data.session) {
      return ApiResponseHandler.error('Authentication failed: No user or session returned', 401);
    }
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Format user data
    const userData: UserData = {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at,
      ...(profile && {
        role: profile.role,
        full_name: profile.full_name,
        phone_number: profile.phone_number
      })
    };
    
    // Format session data
    const sessionData = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    };
    
    return ApiResponseHandler.success({
      user: userData,
      session: sessionData
    });
  } catch (error) {
    console.error('Error in login:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Sign up with email and password
 * @param signupData Signup data
 */
export const signup = async (
  signupData: SignupData
): Promise<{ success: boolean; data?: AuthResponse; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!signupData.email) {
      return ApiResponseHandler.error('Email is required', 400);
    }
    
    if (!signupData.password) {
      return ApiResponseHandler.error('Password is required', 400);
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      return ApiResponseHandler.error('Invalid email format', 400);
    }
    
    // Validate password strength
    if (signupData.password.length < 8) {
      return ApiResponseHandler.error('Password must be at least 8 characters long', 400);
    }
    
    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password
    });
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return ApiResponseHandler.error('Email is already registered', 409);
      }
      
      return ApiResponseHandler.error(`Signup failed: ${error.message}`, 400);
    }
    
    if (!data.user) {
      return ApiResponseHandler.error('Signup failed: No user returned', 500);
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: signupData.full_name,
        phone_number: signupData.phone_number,
        role: 'farmer' // Default role
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
    
    // Format user data
    const userData: UserData = {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
      role: 'farmer',
      full_name: signupData.full_name,
      phone_number: signupData.phone_number
    };
    
    // Format session data
    const sessionData = data.session ? {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    } : null;
    
    return ApiResponseHandler.success({
      user: userData,
      session: sessionData!
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Logout the current user
 * @param token Access token
 */
export const logout = async (
  token: string
): Promise<{ success: boolean; data?: null; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!token) {
      return ApiResponseHandler.error('Access token is required', 400);
    }
    
    // Attempt logout
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return ApiResponseHandler.error(`Logout failed: ${error.message}`, 500);
    }
    
    return ApiResponseHandler.success(null, 'Logged out successfully');
  } catch (error) {
    console.error('Error in logout:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Get the current user
 * @param token Access token
 */
export const getCurrentUser = async (
  token: string
): Promise<{ success: boolean; data?: UserData; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!token) {
      return ApiResponseHandler.error('Access token is required', 400);
    }
    
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return ApiResponseHandler.error(`Authentication failed: ${error.message}`, 401);
    }
    
    if (!user) {
      return ApiResponseHandler.error('Authentication failed: No user found', 401);
    }
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Format user data
    const userData: UserData = {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      ...(profile && {
        role: profile.role,
        full_name: profile.full_name,
        phone_number: profile.phone_number
      })
    };
    
    return ApiResponseHandler.success(userData);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};