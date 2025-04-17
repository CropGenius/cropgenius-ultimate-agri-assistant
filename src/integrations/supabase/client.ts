
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://bapqlyvfwxsichlyjxpd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g";

// Get the correct callback URL based on environment
const getCallbackUrl = () => {
  // Try to get current host/origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // List of domains that should work with auth
  const validDomains = [
    'https://cropgenius.lovable.dev',   // Lovable.dev domain
    'http://localhost:3000',            // Local development
    'http://localhost:54323',           // Supabase local development
    'https://cropgenius.netlify.app',   // Netlify preview
    'https://*.cropgenius.com',         // Production domain with wildcard
  ];
  
  // Use current origin if it's a valid domain, otherwise default to Lovable domain
  const baseUrl = validDomains.includes(origin) 
    ? origin 
    : 'https://cropgenius.lovable.dev';
    
  return `${baseUrl}/auth/callback`;
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,       // Critical for OAuth redirects
    storageKey: 'cropgenius-auth',  // Consistent storage key
    storage: typeof window !== 'undefined' ? localStorage : undefined,  // Safe check for SSR
    flowType: 'pkce',               // Use PKCE for added security
    onAuthStateChange: (event, session) => {
      // Log authentication state changes for debugging
      console.log(`[Auth] State changed: ${event}`, session?.user?.id || 'No user');
      
      // Store authentication state timestamp
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cropgenius-auth-timestamp', Date.now().toString());
        } catch (e) {
          console.error("[Auth] Error storing auth timestamp:", e);
        }
        
        // Store expiry time
        if (session?.expires_at) {
          try {
            localStorage.setItem('cropgenius-auth-expires', 
              new Date(session.expires_at * 1000).toISOString()
            );
          } catch (e) {
            console.error("[Auth] Error storing expiry:", e);
          }
        }
      }
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'CROPGenius',
    },
  },
});

// Debugging helper
export const logAuthState = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log("[Auth Debug] Current session:", data.session?.user?.id || "None", error);
  return { data, error };
};

// Add function to refresh token proactively
export const proactiveTokenRefresh = async () => {
  try {
    // Check if token is close to expiry (within 10 minutes)
    if (typeof window === 'undefined') return false; // Skip in SSR

    const expiryTime = localStorage.getItem('cropgenius-auth-expires');
    
    if (expiryTime) {
      const expiryDate = new Date(expiryTime);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      // Only refresh if less than 10 minutes remaining
      if (timeDiff < 10 * 60 * 1000) {
        console.log("[Auth] Token close to expiry, refreshing...");
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("[Auth] Token refresh failed:", error.message);
          return false;
        }
        if (data.session) {
          console.log("[Auth] Token refreshed successfully");
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error("[Auth] Error during token refresh:", err);
    return false;
  }
};

// Helper to extract user metadata from session
export const getUserMetadata = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }
  
  return {
    id: data.session.user.id,
    email: data.session.user.email,
    metadata: data.session.user.user_metadata
  };
};
