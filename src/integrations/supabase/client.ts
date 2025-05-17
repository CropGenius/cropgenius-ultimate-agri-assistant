import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '@/lib/env';
import { logError } from '@/utils/debugPanel';

const isDev = import.meta.env.DEV;

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

// Create a simple Supabase client without authentication
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
      auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-application-name': 'CROPGenius',
      },
      fetch: debugFetch
    }
  }
);

// Mock auth state that always returns a default user
export const logAuthState = async () => ({
  data: { 
    session: isDev 
      ? { 
          user: { id: 'dev-user', email: 'dev@example.com' },
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          access_token: 'dummy-access-token',
          refresh_token: 'dummy-refresh-token'
        }
      : null
  }, 
  error: null
});

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

// Mock function to get user metadata
export const getUserMetadata = async () => ({
  data: {
    id: require('../../utils/fallbackUser').FALLBACK_USER_ID,
    email: 'user@example.com',
    user_metadata: { full_name: 'Guest User' }
  },
  error: null
});

// Mock function to check and refresh session
export const checkAndRefreshSession = async () => ({
  session: { 
    user: { id: require('../../utils/fallbackUser').FALLBACK_USER_ID },
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  },
  error: null
});
