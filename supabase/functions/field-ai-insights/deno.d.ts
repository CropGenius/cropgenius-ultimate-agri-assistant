// Type declarations for Deno standard library modules
declare module "std/http/server" {
  export interface ConnInfo {
    readonly remoteAddr: Deno.Addr;
  }
  
  export interface Handler {
    (request: Request, connInfo: ConnInfo): Response | Promise<Response>;
  }
  
  export function serve(handler: Handler, options?: { port?: number; hostname?: string; }): void;
}

// Type declarations for Supabase JS client
declare module "https://esm.sh/@supabase/supabase-js@2.39.0" {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }
  
  export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
    storage: any;
  }
  
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions): SupabaseClient;
}
