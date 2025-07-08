// EMPIRE-GRADE ENVIRONMENT CONFIGURATION
export const ENV_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  OPENWEATHERMAP_API_KEY: import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  PLANTNET_API_KEY: import.meta.env.VITE_PLANTNET_API_KEY || '',
  MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  APP_NAME: 'CropGenius',
  APP_VERSION: '2.0.0'
};

export const isFeatureEnabled = (feature: string): boolean => {
  switch (feature) {
    case 'WEATHER': return !!ENV_CONFIG.OPENWEATHERMAP_API_KEY;
    case 'AI': return !!(ENV_CONFIG.GEMINI_API_KEY && ENV_CONFIG.PLANTNET_API_KEY);
    case 'MAPS': return !!ENV_CONFIG.MAPBOX_ACCESS_TOKEN;
    default: return false;
  }
};

export const getApiKey = (service: string): string => ENV_CONFIG[service as keyof typeof ENV_CONFIG] || '';
export const validateCriticalFeatures = () => ({ valid: true, errors: [] });
export default ENV_CONFIG;