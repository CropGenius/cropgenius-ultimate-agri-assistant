import { z } from 'zod';

// Helper function to make fields optional in development
const createEnvSchema = () => {
  const isDev = import.meta.env.MODE === 'development';
  
  // Base schema with default values for development
  return z.object({
    // Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    
    // Supabase - optional in development
    VITE_SUPABASE_URL: z.string().default('https://bapqlyvfwxsichlyjxpd.supabase.co'),
    VITE_SUPABASE_ANON_KEY: z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g'),
    VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().default('dummy-service-role-key'),
    
    // Mapbox - optional in development
    VITE_MAPBOX_ACCESS_TOKEN: z.string().default('pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4N29iZTAxZzIycXJ4b3gydXhkMjYifQ.g6Q50VYV0Gp4P1pJnOtj0w'),
    
    // App URLs
    VITE_APP_URL: z.string().default('http://localhost:8080'),
    VITE_SUPABASE_REDIRECT_URL: z.string().default('http://localhost:8080/auth/callback'),
    
    // Feature Flags
    VITE_ENABLE_OFFLINE: z.string().transform((val) => val === 'true').default('true'),
    VITE_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
    
    // Rate Limiting
    VITE_API_RATE_LIMIT: z.string().transform(Number).default('100'),
    VITE_API_RATE_WINDOW_MS: z.string().transform(Number).default('60000'),
  });
};

const envSchema = createEnvSchema();

type Env = z.infer<typeof envSchema>;

// Validate environment variables at startup
const validateEnv = (): Env => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `• ${e.path.join('.')}: ${e.message}`)
        .join('\n');
      throw new Error(`❌ Invalid environment variables:\n${errorMessage}`);
    }
    throw new Error('❌ Failed to validate environment variables');
  }
};

export const env = validateEnv();

// Export type for use in other modules
export type { Env };
