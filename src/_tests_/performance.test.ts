import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceService } from '@/services/performance';
import {
  mockCacheConfig,
  mockWeatherData,
  mockMarketData,
  mockFile,
  mockSupabaseResponse,
  mockQueryResponse,
  mockInfiniteQueryResponse,
  mockCacheItem
} from './__mocks__/performanceMocks';

// Mock Supabase
vi.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(mockSupabaseResponse)
  }
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue(mockQueryResponse),
  useInfiniteQuery: vi.fn().mockReturnValue(mockInfiniteQueryResponse)
}));

// Mock FileReader
vi.mock('file-api', () => ({
  FileReader: class {
    onload: (event: any) => void;
    onerror: (error: any) => void;

    readAsDataURL(file: File) {
      this.onload({ target: { result: 'mock-data-url' } });
    }
  }
}));

describe('Performance Service', () => {
  let performanceService: PerformanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceService = PerformanceService.getInstance();
  });

  describe('Cache Management', () => {
    it('configures cache correctly', () => {
      performanceService.configureCache(mockCacheConfig);
      
      expect(performanceService.cacheConfig).toContainEqual(mockCacheConfig);
    });

    it('gets data from cache', async () => {
      const cacheKey = 'test-key';
      performanceService.cache.set(cacheKey, mockCacheItem);
      
      const result = await performanceService.getFromCache(cacheKey, () => Promise.resolve(mockWeatherData));
      
      expect(result).toEqual(mockWeatherData);
    });

    it('returns stale data if fetch fails', async () => {
      const cacheKey = 'test-key';
      performanceService.cache.set(cacheKey, mockCacheItem);
      
      const fetchFn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
      const result = await performanceService.getFromCache(cacheKey, fetchFn);
      
      expect(result).toEqual(mockWeatherData);
      expect(fetchFn).toHaveBeenCalled();
    });

    it('clears cache correctly', async () => {
      const cacheKey = 'test-key';
      performanceService.cache.set(cacheKey, mockCacheItem);
      
      await performanceService.clearCache(cacheKey);
      expect(performanceService.cache.has(cacheKey)).toBe(false);
    });
  });

  describe('Query Optimization', () => {
    it('uses optimized query with correct options', () => {
      const queryKey = ['weather'];
      const queryFn = vi.fn().mockResolvedValue(mockWeatherData);
      
      performanceService.useOptimizedQuery(queryKey, queryFn);
      
      expect(queryFn).toHaveBeenCalled();
    });

    it('handles query errors', () => {
      const queryKey = ['weather'];
      const queryFn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
      
      performanceService.useOptimizedQuery(queryKey, queryFn);
      
      expect(queryFn).toHaveBeenCalled();
    });

    it('uses infinite query with correct options', () => {
      const queryKey = ['weather'];
      const queryFn = vi.fn().mockResolvedValue(mockWeatherData);
      
      performanceService.useInfiniteQuery(queryKey, queryFn);
      
      expect(queryFn).toHaveBeenCalled();
    });
  });

  describe('Image Optimization', () => {
    it('optimizes image size', async () => {
      const maxSize = 1000;
      const optimizedFile = await performanceService.optimizeImageUpload(mockFile, maxSize);
      
      expect(optimizedFile.size).toBeLessThanOrEqual(maxSize);
    });

    it('preserves image quality', async () => {
      const optimizedFile = await performanceService.optimizeImageUpload(mockFile);
      
      expect(optimizedFile.type).toBe(mockFile.type);
      expect(optimizedFile.name).toBe(mockFile.name);
    });

    it('handles image optimization errors', async () => {
      const errorSpy = vi.spyOn(console, 'error');
      
      try {
        await performanceService.optimizeImageUpload(new File([], 'invalid-file.txt'));
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Data Fetching', () => {
    it('optimizes weather data fetch', async () => {
      const result = await performanceService.optimizeWeatherFetch(1.0, 1.0, 'weather-cache');
      
      expect(result).toEqual(mockWeatherData);
    });

    it('optimizes market data fetch', async () => {
      const result = await performanceService.optimizeMarketDataFetch('Maize', 'Nairobi', 'market-cache');
      
      expect(result).toEqual(mockMarketData);
    });

    it('returns cached data if available', async () => {
      const cacheKey = 'weather-cache';
      performanceService.cache.set(cacheKey, mockCacheItem);
      
      const result = await performanceService.optimizeWeatherFetch(1.0, 1.0, cacheKey);
      
      expect(result).toEqual(mockWeatherData);
    });
  });
});
