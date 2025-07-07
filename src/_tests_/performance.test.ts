import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceService } from '@/services/performance';
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
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('handles cache expiration', async () => {
      const cacheKey = 'test-key';
      const expiredCacheItem = {
        value: mockWeatherData,
        timestamp: Date.now() - (mockCacheConfig.ttl + 1000)
      };
      
      performanceService.cache.set(cacheKey, expiredCacheItem);
      const fetchFn = vi.fn().mockResolvedValue(mockWeatherData);
      
      await performanceService.getFromCache(cacheKey, fetchFn);
      
      expect(fetchFn).toHaveBeenCalled();
    });

    it('respects cache size limit', async () => {
      const maxSize = 2;
      const cacheConfig = {
        ...mockCacheConfig,
        maxSize
      };
      
      performanceService.configureCache(cacheConfig);
      
      for (let i = 0; i < maxSize + 1; i++) {
        const key = `item-${i}`;
        performanceService.cache.set(key, mockCacheItem);
      }
      
      expect(performanceService.cache.size).toBe(maxSize);
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

    it('handles pagination correctly', async () => {
      const queryKey = ['weather'];
      const getNextPageParam = vi.fn().mockImplementation((lastPage, allPages) => {
        return allPages.length;
      });
      
      performanceService.useInfiniteQuery(queryKey, () => Promise.resolve({
        data: [mockWeatherData],
        error: null,
        isLoading: false,
        isSuccess: true,
        fetchNextPage: vi.fn()
      }), { getNextPageParam });
      
      expect(getNextPageParam).toHaveBeenCalled();
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

    it('optimizes multiple images in parallel', async () => {
      const files = Array(3).fill(null).map(() => mockFile);
      const promises = files.map(file => performanceService.optimizeImageUpload(file));
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(files.length);
      results.forEach(result => {
        expect(result.type).toBe(mockFile.type);
      });
    });

    it('handles large image optimization', async () => {
      const largeFile = new File(['large data'.repeat(1000000)], 'large-image.jpg', { type: 'image/jpeg' });
      const optimizedFile = await performanceService.optimizeImageUpload(largeFile);
      
      expect(optimizedFile.size).toBeLessThan(largeFile.size);
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

    it('handles network errors gracefully', async () => {
      const errorSpy = vi.spyOn(console, 'error');
      
      try {
        await performanceService.optimizeWeatherFetch(1.0, 1.0, 'error-cache');
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
    });

    it('implements retry mechanism', async () => {
      const cacheKey = 'retry-cache';
      let attempts = 0;
      
      const fetchFn = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Temporary error');
        return mockWeatherData;
      });
      
      await performanceService.getFromCache(cacheKey, fetchFn);
      
      expect(attempts).toBeGreaterThan(1);
    });
  });
});
