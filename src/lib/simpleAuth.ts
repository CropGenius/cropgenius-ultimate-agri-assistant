import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bapqlyvfwxsichlyjxpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g';

export const simpleSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const simpleAuth = {
  signIn: async (email: string, password: string) => {
    return await simpleSupabase.auth.signInWithPassword({ email, password });
  },
  signUp: async (email: string, password: string) => {
    return await simpleSupabase.auth.signUp({ email, password });
  },
  signOut: async () => {
    return await simpleSupabase.auth.signOut();
  },
  getUser: () => {
    return simpleSupabase.auth.getUser();
  }
};