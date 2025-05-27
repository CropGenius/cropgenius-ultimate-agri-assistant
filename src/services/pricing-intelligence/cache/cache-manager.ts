import { CacheKey, BasePrice, NormalizedPrice, PricingError, ERROR_CODES } from '../models/types';

/**
 * CacheManager handles in-memory and persistent caching of price data
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, { data: any; expiry: number }>;
  private readonly DEFAULT_TTL: number = 30 * 60 * 1000; // 30 minutes
  private readonly CACHE_VERSION = 'v1';

  private constructor() {
    this.memoryCache = new Map();
    this.cleanupExpiredEntries();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Generate a cache key from parameters
   */
  public generateKey(params: CacheKey): string {
    const { crop, location, currency, date } = params;
    const key = `${this.CACHE_VERSION}:${crop}:${location}:${currency}:${date}`;
    return key.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Get data from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const cachedItem = this.memoryCache.get(key);
      if (cachedItem && cachedItem.expiry > Date.now()) {
        return cachedItem.data as T;
      }

      // Check persistent storage if needed
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const item = localStorage.getItem(`cg_pricing_${key}`);
        if (item) {
          const { data, expiry } = JSON.parse(item);
          if (expiry > Date.now()) {
            // Update memory cache
            this.memoryCache.set(key, { data, expiry });
            return data as T;
          }
          // Clean up expired item
          this.remove(key);
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  public async set<T>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      const expiry = Date.now() + ttl;
      const cacheItem = { data, expiry };

      // Update memory cache
      this.memoryCache.set(key, cacheItem);

      // Update persistent storage
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.setItem(`cg_pricing_${key}`, JSON.stringify(cacheItem));
      }
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't fail if cache set fails
    }
  }

  /**
   * Remove item from cache
   */
  public async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.removeItem(`cg_pricing_${key}`);
    }
  }

  /**
   * Clear all cached data (use with caution)
   */
  public async clearAll(): Promise<void> {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cg_pricing_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Remove expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    // Clean up memory cache
    const now = Date.now();
    for (const [key, { expiry }] of this.memoryCache.entries()) {
      if (expiry <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Clean up localStorage if available
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cg_pricing_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const { expiry } = JSON.parse(item);
              if (expiry <= now) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Remove invalid entries
            localStorage.removeItem(key);
          }
        }
      });
    }

    // Schedule next cleanup
    setTimeout(() => this.cleanupExpiredEntries(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get cache statistics
   */
  public async getStats() {
    const now = Date.now();
    let memoryItems = 0;
    let storageItems = 0;
    let expiredItems = 0;

    // Count memory cache items
    for (const { expiry } of this.memoryCache.values()) {
      memoryItems++;
      if (expiry <= now) expiredItems++;
    }

    // Count storage items if available
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cg_pricing_')) {
          storageItems++;
        }
      }
    }

    return {
      memoryItems,
      storageItems,
      expiredItems,
      totalItems: memoryItems + storageItems,
    };
  }
}
