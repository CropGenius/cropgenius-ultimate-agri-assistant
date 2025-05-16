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
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'cropgenius-auth',
          storage: window.localStorage,
          flowType: 'pkce',
        },
        global: {
          headers: {
            'x-application-name': 'CropGenius',
            'x-app-version': import.meta.env.VITE_APP_VERSION || '1.0.0',
          },
        },
      }
    );

    // Add real-time presence for online status
    supabaseInstance.realtime.setAuth(env.VITE_SUPABASE_ANON_KEY);

    // Log auth state changes for debugging
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] State changed: ${event}`, session?.user?.id);
    });

    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
};

// Export the singleton instance
export const supabase = getSupabaseClient();

/**
 * Get the current session with auto-refresh
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Auth] Error getting session:', error);
      throw error;
    }
    
    // If no session, return null
    if (!session) return null;
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('[Auth] Session expired, attempting refresh...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Auth] Error refreshing session:', refreshError);
        await supabase.auth.signOut();
        return null;
      }
      
      return data.session;
    }
    
    return session;
  } catch (error) {
    console.error('[Auth] Unexpected error in getCurrentSession:', error);
    return null;
  }
};

/**
 * Ensure user is authenticated
 * @throws {Error} If user is not authenticated
 */
export const requireAuth = async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
};

// Types
export type { Session, User } from '@supabase/supabase-js';
export type { Database } from '@/types/supabase';
