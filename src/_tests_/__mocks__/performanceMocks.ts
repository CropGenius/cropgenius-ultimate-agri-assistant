import { vi } from 'vitest';
import { PerformanceService } from '@/services/performance';

// Mock the PerformanceService
export const mockPerformanceService = {
  getInstance: vi.fn(() => mockPerformanceService),
  configureCache: vi.fn(),
  getFromCache: vi.fn(),
  clearCache: vi.fn(),
  useOptimizedQuery: vi.fn(),
  useInfiniteQuery: vi.fn(),
  optimizeImageUpload: vi.fn(),
  optimizeWeatherFetch: vi.fn(),
  optimizeMarketDataFetch: vi.fn()
};

// Mock the cache configuration
export const mockCacheConfig = {
  key: 'test-cache',
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
};

// Mock data
export const mockWeatherData = {
  temperature: 25,
  humidity: 70,
  windSpeed: 5,
  conditions: 'Sunny',
  timestamp: '2025-07-07T08:30:00+03:00'
};

export const mockMarketData = {
  price: 3500,
  unit: 'KES/kg',
  quantity: 1000,
  location: 'Nairobi Market',
  cropType: 'Maize',
  timestamp: '2025-07-07T08:30:00+03:00'
};

// Mock file for image optimization
export const mockFile = new File(
  ['test data'],
  'test-image.jpg',
  { type: 'image/jpeg' }
);

// Mock Supabase response
export const mockSupabaseResponse = {
  data: mockMarketData,
  error: null
};

// Mock query response
export const mockQueryResponse = {
  data: mockWeatherData,
  error: null,
  isLoading: false,
  isSuccess: true
};

// Mock infinite query response
export const mockInfiniteQueryResponse = {
  data: {
    pages: [mockWeatherData, mockWeatherData],
    pageParams: [0, 1]
  },
  error: null,
  isLoading: false,
  isSuccess: true
};

// Mock cache item
export const mockCacheItem = {
  value: mockWeatherData,
  timestamp: Date.now()
};
