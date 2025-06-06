/**
 * Application configuration settings.
 *
 * It's important to use environment variables for sensitive data
 * and to load them using Vite's `import.meta.env` feature.
 */

// Basic application information
const appInfo = {
  name: 'CropGenius',
  version: '1.0.0',
  description: 'The ultimate agricultural assistant powered by AI',
};

// Supabase configuration
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Weather API configuration
const weatherApiConfig = {
  apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
  baseUrl: 'https://api.openweathermap.org/data/2.5',
};

// Mapbox configuration for maps
const mapboxConfig = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
};

// Twilio configuration for notifications
const twilioConfig = {
  accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
  phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
};

// Feature flags to enable/disable parts of the application
const featureFlags = {
  enableWeatherForecast: true,
  enableCropScanner: true,
  enableMarketplace: true,
  enableAiChat: true,
  enableOfflineMode: true,
};

// Combine all configurations into a single exportable object
export const AppConfig = {
  // General app info
  ...appInfo,
  
  // Supabase credentials and URL
  supabaseUrl: supabaseConfig.url,
  supabaseAnonKey: supabaseConfig.anonKey,
  
  // Weather API settings
  weatherApiKey: weatherApiConfig.apiKey,
  weatherApiUrl: weatherApiConfig.baseUrl,

  // Mapbox access token
  mapboxToken: mapboxConfig.accessToken,

  // Twilio credentials
  twilioAccountSid: twilioConfig.accountSid,
  twilioAuthToken: twilioConfig.authToken,
  twilioPhoneNumber: twilioConfig.phoneNumber,

  // Feature flags
  features: featureFlags,

  // Environment setting
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
}; 