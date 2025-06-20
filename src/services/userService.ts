import { supabase } from './supabaseClient';
import type { Profile } from '@/types/supabase';

/**
 * Fetches a user's public profile.
 * @param userId - The UUID of the user.
 */
export const getUserProfile = async (userId: string): Promise<Profile> => {
  if (!userId) {
    throw new Error('User ID is required to fetch a profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    // Use a custom error type or be more specific in a real app
    throw new Error('Failed to fetch user profile. Please try again.');
  }

  if (!data) {
    throw new Error('User profile not found.');
  }

  return data;
}; 