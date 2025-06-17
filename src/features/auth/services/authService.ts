import { AuthError } from '@supabase/supabase-js';

/**
 * Maps Supabase authentication errors to user-friendly messages.
 * @param error The AuthError from Supabase.
 * @returns A user-friendly error string.
 */
export const mapSupabaseAuthError = (error: AuthError): string => {
  if (error.message.includes('User already registered')) {
    return 'This email is already registered. Please try logging in.';
  }
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.message.includes('Password should be at least 6 characters')) {
    return 'Password must be at least 6 characters long.';
  }
   if (error.message.includes('Unable to validate email address: invalid format')) {
    return 'Please enter a valid email address.';
  }
  if (error.message.includes('Email rate limit exceeded')) {
    return 'You have tried to sign up too many times. Please wait a while before trying again.';
  }
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
};
