/// <reference types="@supabase/supabase-js" />

export interface Database {
  public: {
    Tables: {
      // Add your table definitions here
    }
  }
}

export interface EnhancedSupabaseClient {
  from: any;
  insert: any;
  select: any;
  rpc: any;
  auth: {
    autoRefreshToken: boolean;
    persistSession: boolean;
    detectSessionInUrl: boolean;
    flowType: string;
  };
  storage: any;
  functions: any;
  healthCheck: any;
  client: any;
}
