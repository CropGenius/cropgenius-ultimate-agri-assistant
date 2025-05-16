import { z } from 'zod';

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Supabase
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required'),
  
  // Mapbox
  VITE_MAPBOX_ACCESS_TOKEN: z.string().min(1, 'Mapbox access token is required'),
  
  // App URLs
  VITE_APP_URL: z.string().url('Invalid app URL').default('http://localhost:5173'),
  VITE_SUPABASE_REDIRECT_URL: z.string().url('Invalid redirect URL'),
  
  // Feature Flags
  VITE_ENABLE_OFFLINE: z.string().transform((val) => val === 'true').default('true'),
  VITE_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
  
  // Rate Limiting
  VITE_API_RATE_LIMIT: z.string().transform(Number).default('100'),
  VITE_API_RATE_WINDOW_MS: z.string().transform(Number).default('60000'),
});

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
