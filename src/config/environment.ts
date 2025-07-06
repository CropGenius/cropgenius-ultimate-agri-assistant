/**
 * PRODUCTION ENVIRONMENT CONFIGURATION
 * Validates and manages all environment variables
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  apis: {
    openWeather?: string;
    plantNet?: string;
    sentinelHub?: {
      clientId: string;
      clientSecret: string;
    };
    whatsapp?: {
      accessToken: string;
      phoneNumberId: string;
    };
  };
  features: {
    weatherEnabled: boolean;
    diseaseDetectionEnabled: boolean;
    satelliteEnabled: boolean;
    whatsappEnabled: boolean;
    marketEnabled: boolean;
  };
}

const validateEnvironment = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    },
    apis: {
      openWeather: import.meta.env.VITE_OPENWEATHERMAP_API_KEY,
      plantNet: import.meta.env.VITE_PLANTNET_API_KEY,
      sentinelHub: {
        clientId: import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET || ''
      },
      whatsapp: {
        accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
        phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || ''
      }
    },
    features: {
      weatherEnabled: !!import.meta.env.VITE_OPENWEATHERMAP_API_KEY,
      diseaseDetectionEnabled: !!import.meta.env.VITE_PLANTNET_API_KEY,
      satelliteEnabled: !!(import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID && import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET),
      whatsappEnabled: !!(import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN && import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID),
      marketEnabled: true
    }
  };

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase configuration is required');
  }

  return config;
};

export const env = validateEnvironment();

export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  return env.features[feature];
};

export const getApiKey = (service: string): string | undefined => {
  switch (service) {
    case 'openWeather':
      return env.apis.openWeather;
    case 'plantNet':
      return env.apis.plantNet;
    default:
      return undefined;
  }
};