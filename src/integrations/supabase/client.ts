
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://bapqlyvfwxsichlyjxpd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g";

// Create a simple Supabase client without authentication
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'CROPGenius',
    },
    fetch: fetch.bind(globalThis)
  },
});

// Mock auth state that always returns a default user
export const logAuthState = async () => ({
  data: { 
    session: { 
      user: { id: 'default-user' },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    } 
  }, 
  error: null 
});

// Mock function for token refresh (no-op in no-auth mode)
export const proactiveTokenRefresh = async () => ({
  data: { 
    session: { 
      user: { id: 'default-user' },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    } 
  }, 
  error: null 
});

// Mock function to get user metadata
export const getUserMetadata = async () => ({
  data: {
    id: 'default-user',
    email: 'user@example.com',
    user_metadata: { full_name: 'Guest User' }
  },
  error: null
});

// Mock function to check and refresh session
export const checkAndRefreshSession = async () => ({
  session: { 
    user: { id: 'default-user' },
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  },
  error: null
});
