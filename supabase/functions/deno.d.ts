// Type definitions for Deno's native APIs
declare namespace Deno {
  // Define the env interface with its methods
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  // Export env as a property of type Env
  export const env: Env;
}

// Type declarations for Deno HTTP modules
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
  }
  
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: Partial<ServeInit>
  ): Promise<void>;
  
  export function serve(options: ServeInit): Promise<void>;
}

// Type declarations for Supabase JS client
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
