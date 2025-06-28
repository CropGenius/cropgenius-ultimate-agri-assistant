// Environment validation and configuration
interface Environment {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_MAPBOX_ACCESS_TOKEN?: string;
  VITE_SENTRY_DSN?: string;
  VITE_POSTHOG_API_KEY?: string;
  VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
}

const DEFAULTS = {
  VITE_SUPABASE_URL: 'https://bapqlyvfwxsichlyjxpd.supabase.co',
  // Public anon key – safe to expose client-side. Replace with your own if needed.
  VITE_SUPABASE_ANON_KEY: undefined,
  // Public demo Mapbox token – replace with your own for production maps.
  VITE_MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoidGVzdCIsImEiOiJjanR1eHZqc2owMGpxMnhxYjRlYzFscjRmIn0.demo-token'
};

const validateEnv = (): Required<Environment> => {
  const env = import.meta.env;
  return {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || DEFAULTS.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || DEFAULTS.VITE_SUPABASE_ANON_KEY,
    VITE_MAPBOX_ACCESS_TOKEN: env.VITE_MAPBOX_ACCESS_TOKEN || DEFAULTS.VITE_MAPBOX_ACCESS_TOKEN,
    VITE_SENTRY_DSN: env.VITE_SENTRY_DSN,
    VITE_POSTHOG_API_KEY: env.VITE_POSTHOG_API_KEY,
    VITE_ENVIRONMENT: (env.VITE_ENVIRONMENT as Environment['VITE_ENVIRONMENT']) || 'development',
  };
};

export const config = validateEnv();

export const APP_CONFIG = {
  name: 'CropGenius',
  version: '2.0.0',
  api: {
    supabase: {
      url: 'https://bapqlyvfwxsichlyjxpd.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g',
    },
    mapbox: {
      accessToken: config.VITE_MAPBOX_ACCESS_TOKEN,
    },
  },
  features: {
    offlineMode: true,
    analytics: !!config.VITE_POSTHOG_API_KEY,
    errorTracking: !!config.VITE_SENTRY_DSN,
  },
  performance: {
    queryStaleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retryDelay: 1000,
    maxRetries: 3,
  },
} as const;