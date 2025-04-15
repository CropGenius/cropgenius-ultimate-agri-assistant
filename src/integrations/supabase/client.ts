
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://bapqlyvfwxsichlyjxpd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Critical for OAuth redirects
    storageKey: 'cropgenius-auth', // Consistent storage key
    storage: localStorage, // Explicitly use localStorage
    flowType: 'pkce', // Use PKCE for added security
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
    fetch: fetch.bind(globalThis)
  },
});

// Debugging helper
export const logAuthState = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log("[Auth Debug] Current session:", data.session?.user?.id || "None", error);
  return { data, error };
};
