import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// BULLETPROOF SINGLETON - ONE INSTANCE TO RULE THEM ALL
let supabaseInstance: SupabaseClient<Database> | null = null;

const createSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL || 'https://bapqlyvfwxsichlyjxpd.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g';

  supabaseInstance = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'cropgenius-auth'
    }
  });

  return supabaseInstance;
};

export const supabase = createSupabaseClient();
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Debug helper to log authentication state
export const logAuthState = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  return { session, user };
};