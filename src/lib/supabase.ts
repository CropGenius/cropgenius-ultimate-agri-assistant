import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '@/types/supabase';

// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get the Supabase client instance with proper typing and error handling
 */
export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient<Database>(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            'x-application-name': 'CropGenius',
            'x-app-version': import.meta.env.VITE_APP_VERSION || '1.0.0',
          },
        },
      }
    );

    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
};

// Export the singleton instance
export const supabase = getSupabaseClient();

/**
 * Mock user ID for development
 */
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Get the current user ID (mocked for now)
 */
export const getCurrentUserId = () => {
  return MOCK_USER_ID;
};

// Types
export type { Database } from '@/types/supabase';
