import { ENV_CONFIG } from './environment';

// EMPIRE-GRADE APPLICATION CONFIGURATION
export const APP_CONFIG = {
  name: ENV_CONFIG.APP_NAME,
  version: ENV_CONFIG.APP_VERSION,
  environment: ENV_CONFIG.NODE_ENV,
  
  api: {
    supabase: {
      url: ENV_CONFIG.SUPABASE_URL,
      anonKey: ENV_CONFIG.SUPABASE_ANON_KEY,
    },
    mapbox: { accessToken: ENV_CONFIG.MAPBOX_ACCESS_TOKEN },
    openWeather: { apiKey: ENV_CONFIG.OPENWEATHERMAP_API_KEY },
    gemini: { apiKey: ENV_CONFIG.GEMINI_API_KEY },
    plantNet: { apiKey: ENV_CONFIG.PLANTNET_API_KEY },
  },
  
  performance: {
    queryStaleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retryDelay: 1000,
    maxRetries: 3,
    requestTimeout: 30000,
  }
} as const;

export { ENV_CONFIG };