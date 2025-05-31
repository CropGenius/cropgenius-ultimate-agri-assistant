import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '@/lib/env';
import { logError } from '@/utils/debugPanel';

const isDev = process.env.NODE_ENV === 'development';

// Custom fetch handler with debug logging
const debugFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    const url = typeof input === 'string' ? input : input.toString();
    const startTime = performance.now();
    
    const response = await fetch(input, init);
    const duration = performance.now() - startTime;
    
    // Only log non-200 responses as errors
    if (!response.ok) {
      let responseData = '';
      try {
        responseData = await response.clone().text();
      } catch (e) {
        responseData = 'Could not read response body';
      }
      
      logError({
        type: 'api-error',
        severity: response.status >= 500 ? 'critical' : 'error',
        message: `Supabase API Error: ${response.status} ${response.statusText}`,
        details: responseData,
        origin: url,
        context: {
          url,
          method: init?.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration: `${duration.toFixed(2)}ms`,
          headers: init?.headers ? JSON.stringify(init.headers) : undefined,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return response;
  } catch (error) {
    // Network errors or other exceptions
    const errorMessage = error instanceof Error ? error.message : String(error);
    const url = typeof input === 'string' ? input : input.toString();
    
    logError({
      type: 'network-error',
      severity: 'error',
      message: `Supabase Network Error: ${errorMessage}`,
      stack: error instanceof Error ? error.stack : undefined,
      origin: url,
      context: {
        url,
        method: init?.method || 'GET',
        headers: init?.headers ? JSON.stringify(init.headers) : undefined,
        timestamp: new Date().toISOString()
      }
    });
    
    throw error;
  }
};

// Singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage,
        },
        global: {
          headers: {
            'x-application-name': 'CROPGenius',
          },
          fetch: debugFetch
        }
      }
    );
  }
  return supabaseInstance;
};

// Export singleton instance
export const supabase = getSupabase();

// Real auth state check
export const logAuthState = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    logError({
      type: 'network-error',
      severity: 'error',
      message: 'Failed to get session',
      details: error instanceof Error ? error.message : String(error)
    });
    return { data: null, error: error instanceof Error ? error : new Error('Unknown auth error') };
  }
};

// Mock function for token refresh (no-op in no-auth mode)
export const proactiveTokenRefresh = async () => ({
  data: { 
    session: { 
      user: { id: require('../../utils/fallbackUser').FALLBACK_USER_ID },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    } 
  }, 
  error: null 
});

// Get real user metadata
export const getUserMetadata = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { data: user, error };
};

// Mock function to check and refresh session
export const checkAndRefreshSession = async () => ({
  session: { 
    user: { id: require('../../utils/fallbackUser').FALLBACK_USER_ID },
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  },
  error: null
});
