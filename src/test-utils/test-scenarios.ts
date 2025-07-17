import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createMockQueryClient } from './render';
import { 
  createTestUser, 
  createTestFarms, 
  createTestFields,
  createTestMarketListings,
  createTestWeatherData,
  createTestCropDiseaseDetection,
  createFarmerWithMultipleFarms,
  createMarketScenario,
  createWeatherScenario,
  createCropDiseaseScenario
} from './factories';

// INFINITY-LEVEL Test Scenarios 🚀
// Pre-configured test scenarios for comprehensive testing

export interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<any>;
  cleanup?: () => Promise<void>;
}

// Authentication Scenarios
export const authScenarios = {
  authenticatedFarmer: {
    name: 'Authenticated Farmer',
    description: 'A logged-in farmer with complete profile',
    setup: async () => {
      const { user, farms, fields } = createFarmerWithMultipleFarms();
      
      const mockAuthValue = {
        user,
        profile: user,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateProfile: vi.fn().mockResolvedValue({ error: null }),
        isAuthenticated: true,
      };

      return { user, farms, fields, mockAuthValue };
    },
  },

  unauthenticatedUser: {
    name: 'Unauthenticated User',
    description: 'A visitor who is not logged in',
    setup: async () => {
      const mockAuthValue = {
        user: null,
        profile: null,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateProfile: vi.fn().mockResolvedValue({ error: null }),
        isAuthenticated: false,
      };

      return { mockAuthValue };
    },
  },

  newFarmer: {
    name: 'New Farmer',
    description: 'A newly registered farmer without farms or fields',
    setup: async () => {
      const user = createTestUser({
        credits_balance: 100, // New user bonus
        subscription_tier: 'free',
      });

      const mockAuthValue = {
        user,
        profile: user,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateProfile: vi.fn().mockResolvedValue({ error: null }),
        isAuthenticated: true,
      };

      return { user, mockAuthValue };
    },
  },

  premiumFarmer: {
    name: 'Premium Farmer',
    description: 'A farmer with premium subscription and unlimited credits',
    setup: async () => {
      const { user, farms, fields } = createFarmerWithMultipleFarms();
      user.subscription_tier = 'premium';
      user.credits_balance = 1000;

      const mockAuthValue = {
        user,
        profile: user,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateProfile: vi.fn().mockResolvedValue({ error: null }),
        isAuthenticated: true,
      };

      return { user, farms, fields, mockAuthValue };
    },
  },
};

// Market Data Scenarios
export const marketDataScenarios = {
  activeMarket: {
    name: 'Active Market',
    description: 'Market with active listings and current prices',
    setup: async () => {
      const { listings, prices } = createMarketScenario();
      
      const queryClient = createMockQueryClient({
        'market-listings': listings,
        'market-prices': prices,
      });

      return { listings, prices, queryClient };
    },
  },

  emptyMarket: {
    name: 'Empty Market',
    description: 'Market with no listings or price data',
    setup: async () => {
      const queryClient = createMockQueryClient({
        'market-listings': [],
        'market-prices': [],
      });

      return { listings: [], prices: [], queryClient };
    },
  },

  highDemandMarket: {
    name: 'High Demand Market',
    description: 'Market with high prices and many buy orders',
    setup: async () => {
      const listings = createTestMarketListings(50, {
        listing_type: 'buy',
        price: 150, // Higher than average
      });
      
      const prices = [
        { crop_name: 'maize', price: 180, trend: 'up' },
        { crop_name: 'beans', price: 220, trend: 'up' },
        { crop_name: 'wheat', price: 160, trend: 'stable' },
      ];

      const queryClient = createMockQueryClient({
        'market-listings': listings,
        'market-prices': prices,
      });

      return { listings, prices, queryClient };
    },
  },

  volatileMarket: {
    name: 'Volatile Market',
    description: 'Market with rapidly changing prices',
    setup: async () => {
      const listings = createTestMarketListings(30);
      const prices = [
        { crop_name: 'maize', price: 45, trend: 'down', volatility: 'high' },
        { crop_name: 'beans', price: 120, trend: 'up', volatility: 'high' },
        { crop_name: 'tomatoes', price: 80, trend: 'volatile', volatility: 'extreme' },
      ];

      const queryClient = createMockQueryClient({
        'market-listings': listings,
        'market-prices': prices,
      });

      return { listings, prices, queryClient };
    },
  },
};

// Weather Scenarios
export const weatherScenarios = {
  normalWeather: {
    name: 'Normal Weather',
    description: 'Typical weather conditions for farming',
    setup: async () => {
      const { currentWeather, forecast } = createWeatherScenario();
      
      const queryClient = createMockQueryClient({
        'weather-current': currentWeather,
        'weather-forecast': forecast,
      });

      return { currentWeather, forecast, queryClient };
    },
  },

  severeWeatherAlert: {
    name: 'Severe Weather Alert',
    description: 'Dangerous weather conditions requiring immediate action',
    setup: async () => {
      const currentWeather = createTestWeatherData({
        weather_condition: 'thunderstorm',
        rainfall: 75,
        wind_speed: 45,
        temperature: 18,
      });

      const forecast = Array.from({ length: 7 }, (_, index) => 
        createTestWeatherData({
          weather_condition: index < 3 ? 'heavy_rain' : 'cloudy',
          rainfall: index < 3 ? 25 : 5,
        })
      );

      const queryClient = createMockQueryClient({
        'weather-current': currentWeather,
        'weather-forecast': forecast,
        'weather-alerts': [
          {
            id: 'alert-1',
            type: 'severe_weather',
            severity: 'high',
            title: 'Severe Thunderstorm Warning',
            message: 'Heavy rains and strong winds expected. Secure crops and equipment.',
            issued_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
      });

      return { currentWeather, forecast, queryClient };
    },
  },

  droughtConditions: {
    name: 'Drought Conditions',
    description: 'Extended dry period affecting crop growth',
    setup: async () => {
      const currentWeather = createTestWeatherData({
        weather_condition: 'sunny',
        rainfall: 0,
        humidity: 25,
        temperature: 35,
      });

      const forecast = Array.from({ length: 14 }, () => 
        createTestWeatherData({
          weather_condition: 'sunny',
          rainfall: 0,
          humidity: 20,
          temperature: 33,
        })
      );

      const queryClient = createMockQueryClient({
        'weather-current': currentWeather,
        'weather-forecast': forecast,
        'weather-alerts': [
          {
            id: 'alert-2',
            type: 'drought',
            severity: 'medium',
            title: 'Drought Advisory',
            message: 'Extended dry period. Consider water conservation measures.',
            issued_at: new Date().toISOString(),
          }
        ],
      });

      return { currentWeather, forecast, queryClient };
    },
  },

  optimalGrowingConditions: {
    name: 'Optimal Growing Conditions',
    description: 'Perfect weather for crop growth',
    setup: async () => {
      const currentWeather = createTestWeatherData({
        weather_condition: 'partly_cloudy',
        rainfall: 15,
        humidity: 65,
        temperature: 25,
        wind_speed: 8,
      });

      const forecast = Array.from({ length: 7 }, () => 
        createTestWeatherData({
          weather_condition: 'partly_cloudy',
          rainfall: 12,
          humidity: 60,
          temperature: 24,
        })
      );

      const queryClient = createMockQueryClient({
        'weather-current': currentWeather,
        'weather-forecast': forecast,
      });

      return { currentWeather, forecast, queryClient };
    },
  },
};

// Crop Disease Scenarios
export const cropDiseaseScenarios = {
  healthyCrops: {
    name: 'Healthy Crops',
    description: 'No disease detections, all crops healthy',
    setup: async () => {
      const detections = createTestCropDiseaseDetection({
        disease_name: 'No Disease Detected',
        confidence_score: 0.95,
        severity: 'low',
        affected_area_percentage: 0,
      });

      const queryClient = createMockQueryClient({
        'disease-detections': [detections],
        'disease-history': [],
      });

      return { detections: [detections], queryClient };
    },
  },

  diseaseOutbreak: {
    name: 'Disease Outbreak',
    description: 'Multiple high-severity disease detections',
    setup: async () => {
      const detections = [
        createTestCropDiseaseDetection({
          disease_name: 'Corn Leaf Blight',
          confidence_score: 0.92,
          severity: 'high',
          affected_area_percentage: 75,
        }),
        createTestCropDiseaseDetection({
          disease_name: 'Bean Rust',
          confidence_score: 0.88,
          severity: 'medium',
          affected_area_percentage: 45,
        }),
        createTestCropDiseaseDetection({
          disease_name: 'Tomato Blight',
          confidence_score: 0.94,
          severity: 'high',
          affected_area_percentage: 80,
        }),
      ];

      const queryClient = createMockQueryClient({
        'disease-detections': detections,
        'disease-history': detections,
        'disease-alerts': [
          {
            id: 'disease-alert-1',
            type: 'disease_outbreak',
            severity: 'high',
            title: 'Disease Outbreak Alert',
            message: 'Multiple high-severity diseases detected in your area.',
            crops_affected: ['maize', 'beans', 'tomatoes'],
            recommended_actions: [
              'Apply fungicide treatment immediately',
              'Isolate affected areas',
              'Contact agricultural extension officer',
            ],
          }
        ],
      });

      return { detections, queryClient };
    },
  },

  earlyDetection: {
    name: 'Early Disease Detection',
    description: 'Low-severity disease caught early',
    setup: async () => {
      const detection = createTestCropDiseaseDetection({
        disease_name: 'Early Blight',
        confidence_score: 0.78,
        severity: 'low',
        affected_area_percentage: 15,
        treatment_recommendation: 'Apply preventive fungicide spray',
        prevention_tips: 'Improve air circulation and reduce leaf wetness',
      });

      const queryClient = createMockQueryClient({
        'disease-detections': [detection],
        'disease-history': [],
      });

      return { detection, queryClient };
    },
  },
};

// Network Scenarios
export const networkScenarios = {
  onlineMode: {
    name: 'Online Mode',
    description: 'Full internet connectivity',
    setup: async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Mock fetch to succeed
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      });

      return { isOnline: true };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },

  offlineMode: {
    name: 'Offline Mode',
    description: 'No internet connectivity',
    setup: async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      return { isOnline: false };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },

  slowNetwork: {
    name: 'Slow Network',
    description: 'Poor internet connectivity with delays',
    setup: async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Mock fetch with delays
      global.fetch = vi.fn().mockImplementation(async (...args) => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        };
      });

      return { isOnline: true, isSlowNetwork: true };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },

  intermittentConnection: {
    name: 'Intermittent Connection',
    description: 'Unstable internet that connects and disconnects',
    setup: async () => {
      let isConnected = true;
      
      // Toggle connection every 2 seconds
      const interval = setInterval(() => {
        isConnected = !isConnected;
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: isConnected,
        });
        
        // Dispatch online/offline events
        window.dispatchEvent(new Event(isConnected ? 'online' : 'offline'));
      }, 2000);

      global.fetch = vi.fn().mockImplementation(async () => {
        if (!isConnected) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        };
      });

      return { isOnline: true, interval };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },
};

// Performance Scenarios
export const performanceScenarios = {
  lowEndDevice: {
    name: 'Low-End Device',
    description: 'Simulates performance on low-end mobile devices',
    setup: async () => {
      // Mock slow performance
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        return originalSetTimeout(callback, (delay || 0) * 3); // 3x slower
      });

      // Mock limited memory
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 1, // 1GB RAM
      });

      return { deviceType: 'low-end' };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },

  highEndDevice: {
    name: 'High-End Device',
    description: 'Simulates performance on high-end devices',
    setup: async () => {
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 8, // 8GB RAM
      });

      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 8, // 8 CPU cores
      });

      return { deviceType: 'high-end' };
    },
  },

  memoryPressure: {
    name: 'Memory Pressure',
    description: 'Simulates low memory conditions',
    setup: async () => {
      // Mock memory pressure
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 0.5, // 512MB RAM
      });

      // Mock memory warnings
      const memoryWarning = new Event('memory-pressure');
      window.dispatchEvent(memoryWarning);

      return { memoryPressure: true };
    },
  },
};

// Error Scenarios
export const errorScenarios = {
  apiErrors: {
    name: 'API Errors',
    description: 'Various API error responses',
    setup: async () => {
      const errorResponses = {
        '400': { error: 'Bad Request', message: 'Invalid request parameters' },
        '401': { error: 'Unauthorized', message: 'Authentication required' },
        '403': { error: 'Forbidden', message: 'Insufficient permissions' },
        '404': { error: 'Not Found', message: 'Resource not found' },
        '429': { error: 'Rate Limited', message: 'Too many requests' },
        '500': { error: 'Internal Server Error', message: 'Server error occurred' },
        '503': { error: 'Service Unavailable', message: 'Service temporarily unavailable' },
      };

      global.fetch = vi.fn().mockImplementation(async (url) => {
        const urlString = url.toString();
        
        if (urlString.includes('error-400')) {
          return { ok: false, status: 400, json: () => Promise.resolve(errorResponses['400']) };
        }
        if (urlString.includes('error-401')) {
          return { ok: false, status: 401, json: () => Promise.resolve(errorResponses['401']) };
        }
        if (urlString.includes('error-500')) {
          return { ok: false, status: 500, json: () => Promise.resolve(errorResponses['500']) };
        }
        
        return { ok: true, json: () => Promise.resolve({ data: 'success' }) };
      });

      return { errorResponses };
    },
    cleanup: async () => {
      vi.restoreAllMocks();
    },
  },

  validationErrors: {
    name: 'Validation Errors',
    description: 'Form validation and data validation errors',
    setup: async () => {
      const validationErrors = {
        email: 'Invalid email format',
        phone: 'Invalid phone number format',
        farmSize: 'Farm size must be greater than 0',
        cropType: 'Please select a valid crop type',
        coordinates: 'Invalid field coordinates',
      };

      return { validationErrors };
    },
  },

  permissionErrors: {
    name: 'Permission Errors',
    description: 'User permission and access control errors',
    setup: async () => {
      const mockAuthValue = {
        user: createTestUser({ subscription_tier: 'free' }),
        profile: null,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ error: 'Invalid credentials' }),
        signUp: vi.fn().mockResolvedValue({ error: 'Email already exists' }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateProfile: vi.fn().mockResolvedValue({ error: 'Insufficient permissions' }),
        isAuthenticated: false,
      };

      return { mockAuthValue };
    },
  },
};

// Utility function to run a scenario
export async function runScenario(scenario: TestScenario) {
  const result = await scenario.setup();
  
  return {
    ...result,
    cleanup: async () => {
      if (scenario.cleanup) {
        await scenario.cleanup();
      }
    },
  };
}

// Utility function to combine multiple scenarios
export function combineScenarios(...scenarios: TestScenario[]): TestScenario {
  return {
    name: scenarios.map(s => s.name).join(' + '),
    description: scenarios.map(s => s.description).join(', '),
    setup: async () => {
      const results = await Promise.all(scenarios.map(s => s.setup()));
      return results.reduce((acc, result) => ({ ...acc, ...result }), {});
    },
    cleanup: async () => {
      await Promise.all(
        scenarios
          .filter(s => s.cleanup)
          .map(s => s.cleanup!())
      );
    },
  };
}

// Export all scenarios
export const allScenarios = {
  auth: authScenarios,
  marketData: marketDataScenarios,
  weather: weatherScenarios,
  cropDisease: cropDiseaseScenarios,
  network: networkScenarios,
  performance: performanceScenarios,
  error: errorScenarios,
};