import { supabase } from '../services/supabaseClient';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items to cache
}

export class PerformanceService {
  private static instance: PerformanceService;
  private cache: Map<string, any> = new Map();
  private cacheConfig: CacheConfig[] = [];

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  public configureCache(config: CacheConfig) {
    this.cacheConfig.push(config);
  }

  public async getFromCache(key: string, fetchFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached.value;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, {
        value: data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      if (cached) {
        // Return stale data if available
        return cached.value;
      }
      throw error;
    }
  }

  private isExpired(cacheItem: any): boolean {
    const config = this.cacheConfig.find(c => c.key === cacheItem.key);
    return config ? Date.now() - cacheItem.timestamp > config.ttl : false;
  }

  public async clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  public useOptimizedQuery<T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options?: {
      staleTime?: number;
      cacheTime?: number;
      retry?: number;
    }
  ) {
    return useQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
      cacheTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes
      retry: options?.retry || 2,
      onError: (error) => {
        toast.error('Failed to fetch data');
        console.error('Query error:', error);
      }
    });
  }

  public useInfiniteQuery<T>(
    queryKey: string[],
    queryFn: (pageParam?: any) => Promise<T>,
    options?: {
      getNextPageParam?: (lastPage: T, allPages: T[]) => any;
      staleTime?: number;
      cacheTime?: number;
      retry?: number;
    }
  ) {
    return useInfiniteQuery({
      queryKey,
      queryFn,
      getNextPageParam: options?.getNextPageParam,
      staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
      cacheTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes
      retry: options?.retry || 2,
      onError: (error) => {
        toast.error('Failed to fetch data');
        console.error('Infinite query error:', error);
      }
    });
  }

  public async optimizeImageUpload(
    file: File,
    maxSize?: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;

          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('Could not get canvas context');

            // Calculate new dimensions
            const maxWidth = 1920;
            const maxHeight = 1080;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              } else {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64
            const base64 = canvas.toDataURL(file.type);
            
            // Convert back to blob
            const response = await fetch(base64);
            const blob = await response.blob();
            
            // Create new file
            const optimizedFile = new File(
              [blob],
              file.name,
              { type: file.type }
            );

            resolve(optimizedFile);
          };
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
    });
  }

  public async optimizeWeatherFetch(
    latitude: number,
    longitude: number,
    cacheKey: string
  ) {
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.value;
    }

    try {
      // Simulate weather API fetch with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = {
        temperature: 25,
        humidity: 70,
        windSpeed: 5,
        conditions: 'Sunny',
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        value: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (cached) {
        return cached.value;
      }
      throw error;
    }
  }

  public async optimizeMarketDataFetch(
    cropType: string,
    location: string,
    cacheKey: string
  ) {
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.value;
    }

    try {
      // Simulate market data fetch with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = {
        price: 3500,
        unit: 'KES/kg',
        quantity: 1000,
        location,
        cropType,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        value: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (cached) {
        return cached.value;
      }
      throw error;
    }
  }
}
