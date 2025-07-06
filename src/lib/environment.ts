/**
 * Environment Configuration and Validation
 * Ensures all required environment variables are properly configured
 */

interface EnvironmentConfig {
  // Core Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_NAME: string;
  APP_VERSION: string;
  
  // Supabase Configuration
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // External APIs - ALL REQUIRED
  OPENWEATHERMAP_API_KEY: string;
  GEMINI_API_KEY: string;
  PLANTNET_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  
  // Satellite & Field Analysis - REQUIRED
  SENTINEL_HUB_CLIENT_ID: string;
  SENTINEL_HUB_CLIENT_SECRET: string;
  
  // WhatsApp Business API - REQUIRED
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: string;
  
  // Feature Flags
  ENABLE_WHATSAPP: boolean;
  ENABLE_SATELLITE_ANALYSIS: boolean;
  ENABLE_WEATHER_INTELLIGENCE: boolean;
  ENABLE_DISEASE_DETECTION: boolean;
  ENABLE_OFFLINE_MODE: boolean;
  
  // Performance & Monitoring
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_TRACKING: boolean;
  SENTRY_DSN?: string;
  POSTHOG_API_KEY?: string;
}

// Default configuration for development
const DEFAULT_CONFIG: Partial<EnvironmentConfig> = {
  APP_NAME: 'CropGenius',
  APP_VERSION: '2.0.0',
  NODE_ENV: 'development',
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_TRACKING: false,
};

// Validation functions
const validateRequired = (key: string, value: string | undefined): string => {
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is missing or empty`);
  }
  return value.trim();
};

const validateOptional = (value: string | undefined): string | undefined => {
  return value && value.trim() !== '' ? value.trim() : undefined;
};

const validateBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

// Load and validate environment configuration
export const loadEnvironmentConfig = (): EnvironmentConfig => {
  const env = import.meta.env;
  
  try {
    // Core required variables (MUST have these)
    const SUPABASE_URL = validateRequired('VITE_SUPABASE_URL', env.VITE_SUPABASE_URL);
    const SUPABASE_ANON_KEY = validateRequired('VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY);
    
    // API keys with graceful degradation
    const OPENWEATHERMAP_API_KEY = env.VITE_OPENWEATHERMAP_API_KEY || '';
    const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY || '';
    const PLANTNET_API_KEY = env.VITE_PLANTNET_API_KEY || '';
    const MAPBOX_ACCESS_TOKEN = env.VITE_MAPBOX_ACCESS_TOKEN || '';
    
    // Satellite analysis (optional)
    const SENTINEL_HUB_CLIENT_ID = env.VITE_SENTINEL_HUB_CLIENT_ID || '';
    const SENTINEL_HUB_CLIENT_SECRET = env.VITE_SENTINEL_HUB_CLIENT_SECRET || '';
    
    // WhatsApp Business API (optional)
    const WHATSAPP_PHONE_NUMBER_ID = env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
    const WHATSAPP_ACCESS_TOKEN = env.VITE_WHATSAPP_ACCESS_TOKEN || '';
    const WHATSAPP_WEBHOOK_VERIFY_TOKEN = env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
    
    // Monitoring
    const SENTRY_DSN = validateOptional(env.VITE_SENTRY_DSN);
    const POSTHOG_API_KEY = validateOptional(env.VITE_POSTHOG_API_KEY);
    
    // Features enabled based on available API keys
    const ENABLE_WHATSAPP = !!(WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_ACCESS_TOKEN);
    const ENABLE_SATELLITE_ANALYSIS = !!(SENTINEL_HUB_CLIENT_ID && SENTINEL_HUB_CLIENT_SECRET);
    const ENABLE_WEATHER_INTELLIGENCE = !!OPENWEATHERMAP_API_KEY;
    const ENABLE_DISEASE_DETECTION = !!(PLANTNET_API_KEY && GEMINI_API_KEY);
    const ENABLE_ANALYTICS = !!POSTHOG_API_KEY;
    const ENABLE_ERROR_TRACKING = !!SENTRY_DSN;
    
    const config: EnvironmentConfig = {
      NODE_ENV: (env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
      APP_NAME: env.VITE_APP_NAME || DEFAULT_CONFIG.APP_NAME!,
      APP_VERSION: env.VITE_APP_VERSION || DEFAULT_CONFIG.APP_VERSION!,
      
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      
      OPENWEATHERMAP_API_KEY,
      GEMINI_API_KEY,
      PLANTNET_API_KEY,
      MAPBOX_ACCESS_TOKEN,
      
      SENTINEL_HUB_CLIENT_ID,
      SENTINEL_HUB_CLIENT_SECRET,
      
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      
      SENTRY_DSN,
      POSTHOG_API_KEY,
      
      ENABLE_WHATSAPP,
      ENABLE_SATELLITE_ANALYSIS,
      ENABLE_WEATHER_INTELLIGENCE,
      ENABLE_DISEASE_DETECTION,
      ENABLE_OFFLINE_MODE: validateBoolean(env.VITE_ENABLE_OFFLINE_MODE, true),
      ENABLE_ANALYTICS,
      ENABLE_ERROR_TRACKING,
    };
    
    // Log configuration status (without sensitive data)
    console.log('🔧 Environment Configuration:', {
      NODE_ENV: config.NODE_ENV,
      APP_NAME: config.APP_NAME,
      APP_VERSION: config.APP_VERSION,
      SUPABASE_CONFIGURED: !!config.SUPABASE_URL,
      FEATURES: {
        WHATSAPP: config.ENABLE_WHATSAPP,
        SATELLITE_ANALYSIS: config.ENABLE_SATELLITE_ANALYSIS,
        WEATHER_INTELLIGENCE: config.ENABLE_WEATHER_INTELLIGENCE,
        DISEASE_DETECTION: config.ENABLE_DISEASE_DETECTION,
        OFFLINE_MODE: config.ENABLE_OFFLINE_MODE,
        ANALYTICS: config.ENABLE_ANALYTICS,
        ERROR_TRACKING: config.ENABLE_ERROR_TRACKING,
      }
    });
    
    // Log warnings for missing API keys
    if (!MAPBOX_ACCESS_TOKEN) console.warn('⚠️ Mapbox token missing - maps will use fallback');
    if (!ENABLE_WHATSAPP) console.warn('⚠️ WhatsApp API not configured - chat features disabled');
    if (!ENABLE_SATELLITE_ANALYSIS) console.warn('⚠️ Sentinel Hub not configured - satellite analysis disabled');
    if (!ENABLE_WEATHER_INTELLIGENCE) console.warn('⚠️ OpenWeather API missing - weather features limited');
    if (!ENABLE_DISEASE_DETECTION) console.warn('⚠️ AI APIs missing - disease detection limited');
    
    console.log('🚀 CropGenius initialized with available features!');
    
    return config;
    
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    throw new Error(`Environment configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export singleton configuration
export const ENV_CONFIG = loadEnvironmentConfig();

// Helper functions for feature checks
export const isFeatureEnabled = (feature: keyof Pick<EnvironmentConfig, 
  'ENABLE_WHATSAPP' | 'ENABLE_SATELLITE_ANALYSIS' | 'ENABLE_WEATHER_INTELLIGENCE' | 
  'ENABLE_DISEASE_DETECTION' | 'ENABLE_OFFLINE_MODE' | 'ENABLE_ANALYTICS' | 'ENABLE_ERROR_TRACKING'
>): boolean => {
  return ENV_CONFIG[feature];
};

export const getApiKey = (service: 'openweather' | 'gemini' | 'plantnet' | 'mapbox' | 'whatsapp_token' | 'whatsapp_phone'): string | undefined => {
  switch (service) {
    case 'openweather':
      return ENV_CONFIG.OPENWEATHERMAP_API_KEY;
    case 'gemini':
      return ENV_CONFIG.GEMINI_API_KEY;
    case 'plantnet':
      return ENV_CONFIG.PLANTNET_API_KEY;
    case 'mapbox':
      return ENV_CONFIG.MAPBOX_ACCESS_TOKEN;
    case 'whatsapp_token':
      return ENV_CONFIG.WHATSAPP_ACCESS_TOKEN;
    case 'whatsapp_phone':
      return ENV_CONFIG.WHATSAPP_PHONE_NUMBER_ID;
    default:
      return undefined;
  }
};

// Environment validation for critical features
export const validateCriticalFeatures = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check Supabase (critical)
  if (!ENV_CONFIG.SUPABASE_URL || !ENV_CONFIG.SUPABASE_ANON_KEY) {
    errors.push('Supabase configuration is required for the application to function');
  }
  
  // Warn about missing features but don't fail
  const warnings: string[] = [];
  if (!ENV_CONFIG.ENABLE_DISEASE_DETECTION && !ENV_CONFIG.ENABLE_WEATHER_INTELLIGENCE) {
    warnings.push('No AI features available - consider adding API keys for enhanced functionality');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Feature warnings:', warnings);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default ENV_CONFIG;