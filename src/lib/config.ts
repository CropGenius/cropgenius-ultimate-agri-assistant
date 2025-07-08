import { ENV_CONFIG, isFeatureEnabled, getApiKey } from './environment';

// Legacy config interface for backward compatibility
export const config = {
  VITE_SUPABASE_URL: ENV_CONFIG.SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: ENV_CONFIG.SUPABASE_ANON_KEY,
  VITE_MAPBOX_ACCESS_TOKEN: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
  VITE_POSTHOG_API_KEY: ENV_CONFIG.POSTHOG_API_KEY,
  VITE_ENVIRONMENT: ENV_CONFIG.NODE_ENV,
};

// Enhanced application configuration
export const APP_CONFIG = {
  name: ENV_CONFIG.APP_NAME,
  version: ENV_CONFIG.APP_VERSION,
  environment: ENV_CONFIG.NODE_ENV,
  
  api: {
    supabase: {
      url: ENV_CONFIG.SUPABASE_URL,
      anonKey: ENV_CONFIG.SUPABASE_ANON_KEY,
    },
    mapbox: {
      accessToken: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
    },
    openWeather: {
      apiKey: ENV_CONFIG.OPENWEATHERMAP_API_KEY,
    },
    gemini: {
      apiKey: ENV_CONFIG.GEMINI_API_KEY,
    },
    plantNet: {
      apiKey: ENV_CONFIG.PLANTNET_API_KEY,
    },
    whatsapp: {
      phoneNumberId: ENV_CONFIG.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: ENV_CONFIG.WHATSAPP_ACCESS_TOKEN,
      webhookVerifyToken: ENV_CONFIG.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    },
    sentinelHub: {
      clientId: ENV_CONFIG.SENTINEL_HUB_CLIENT_ID,
      clientSecret: ENV_CONFIG.SENTINEL_HUB_CLIENT_SECRET,
    },
  },
  
  features: {
    offlineMode: ENV_CONFIG.ENABLE_OFFLINE_MODE,
    analytics: ENV_CONFIG.ENABLE_ANALYTICS,
    errorTracking: ENV_CONFIG.ENABLE_ERROR_TRACKING,
    whatsappIntegration: ENV_CONFIG.ENABLE_WHATSAPP,
    satelliteAnalysis: ENV_CONFIG.ENABLE_SATELLITE_ANALYSIS,
    weatherIntelligence: ENV_CONFIG.ENABLE_WEATHER_INTELLIGENCE,
    diseaseDetection: ENV_CONFIG.ENABLE_DISEASE_DETECTION,
  },
  
  performance: {
    queryStaleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retryDelay: 1000,
    maxRetries: 3,
    requestTimeout: 30000, // 30 seconds
  },
  
  ui: {
    theme: {
      primary: '#10b981', // Emerald green for farming
      secondary: '#059669',
      accent: '#34d399',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
    },
    animations: {
      duration: 200,
      easing: 'ease-in-out',
    },
  },
  
  // Helper functions
  isFeatureEnabled,
  getApiKey,
} as const;

// Export environment config for direct access
export { ENV_CONFIG };

// Validation on module load
if (ENV_CONFIG.NODE_ENV === 'production') {
  import('./environment').then(({ validateCriticalFeatures }) => {
    const { valid, errors } = validateCriticalFeatures();
    if (!valid) {
      console.error('❌ Critical configuration errors:', errors);
    }
  }).catch(console.error);
}