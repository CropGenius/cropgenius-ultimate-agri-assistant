// src/services/supabaseClient.ts

/**
 * @file supabaseClient.ts
 * @description Initializes and exports the Supabase client instance.
 * This is the single source of truth for the Supabase client.
 * It is configured for production use with explicit type safety,
 * schema, and auth settings.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase'; // Adjusted path for robustness

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error is thrown during app initialization, preventing a broken state.
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Create a single, typed Supabase client for the entire application
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    // Explicitly set the database schema to 'public'.
    // This prevents accidental access to other schemas and ensures consistency.
    db: {
      schema: 'public',
    },
    // Configure auth settings for robust session management.
    auth: {
      // Automatically refresh the auth token.
      autoRefreshToken: true,
      // Persist the user's session in localStorage.
      // For native/offline-first, a custom storage adapter might be needed here.
      persistSession: true,
      // Automatically detect and handle sessions from the URL (e.g., for OAuth redirects).
      detectSessionInUrl: true,
    },
    // Optional: Configure global fetch options if needed, e.g., for adding custom headers.
    // global: {
    //   fetch: (...args) => fetch(...args),
    // },
  }
);
