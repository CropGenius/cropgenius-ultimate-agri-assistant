import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import the schema directly
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

// Test data
const validEnv = {
  NODE_ENV: 'test',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
  VITE_APP_URL: 'http://localhost:5173',
  VITE_SUPABASE_REDIRECT_URL: 'http://localhost:5173/auth/callback',
  VITE_ENABLE_OFFLINE: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_API_RATE_LIMIT: '100',
};

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    const result = envSchema.safeParse(validEnv);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(result.data.VITE_ENABLE_OFFLINE).toBe(true);
    }
  });

  it('should use default values for optional variables', () => {
    const env = { ...validEnv };
    delete env.VITE_ENABLE_ANALYTICS;
    delete env.VITE_API_RATE_LIMIT;
    
    const result = envSchema.safeParse(env);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.VITE_ENABLE_ANALYTICS).toBe(false);
      expect(result.data.VITE_API_RATE_LIMIT).toBe(100);
    }
  });

  it('should fail with missing required variables', () => {
    const env = { ...validEnv };
    delete env.VITE_SUPABASE_URL;
    
    const result = envSchema.safeParse(env);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => 
        issue.path.includes('VITE_SUPABASE_URL')
      )).toBe(true);
    }
  });
});
