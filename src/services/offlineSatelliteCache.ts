/**
 * 🛰️ OFFLINE SATELLITE CACHE SERVICE
 * Mobile-first satellite intelligence with offline capabilities
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SatelliteCacheDB extends DBSchema {
  satellite_imagery: {
    key: string;
    value: {
      field_id: string;
      imagery_data: Blob;
      ndvi_data: any;
      analysis_results: any;
      cached_at: string;
      expires_at: string;
    };
  };
  field_analysis: {
    key: string;
    value: {
      field_id: string;
      analysis: any;
      cached_at: string;
      expires_at: string;
    };
  };
  precision_alerts: {
    key: string;
    value: {
      field_id: string;
      alerts: any[];
      cached_at: string;
    };
  };
}

class OfflineSatelliteCache {
  private db: IDBPDatabase<SatelliteCacheDB> | null = null;
  private readonly DB_NAME = 'cropgenius_satellite_cache';
  private readonly DB_VERSION = 1;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<SatelliteCacheDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Satellite imagery store
          if (!db.objectStoreNames.contains('satellite_imagery')) {
            const imageryStore = db.createObjectStore('satellite_imagery', { keyPath: 'field_id' });
            imageryStore.createIndex('expires_at', 'expires_at');
          }

          // Field analysis store
          if (!db.objectStoreNames.contains('field_analysis')) {
            const analysisStore = db.createObjectStore('field_analysis', { keyPath: 'field_id' });
            analysisStore.createIndex('expires_at', 'expires_at');
          }

          // Precision alerts store
          if (!db.objectStoreNames.contains('precision_alerts')) {
            db.createObjectStore('precision_alerts', { keyPath: 'field_id' });
          }
        },
      });
      console.log('✅ Offline satellite cache initialized');
    } catch (error) {
      console.error('❌ Failed to initialize offline satellite cache:', error);
    }
  }

  /**
   * Cache satellite imagery for offline viewing
   */
  async cacheSatelliteImagery(fieldId: string, imageryBlob: Blob, ndviData: any, analysisResults: any): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) return;

    try {
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION).toISOString();
      
      await this.db.put('satellite_imagery', {
        field_id: fieldId,
        imagery_data: imageryBlob,
        ndvi_data: ndviData,
        analysis_results: analysisResults,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt
      });

      console.log(`✅ Cached satellite imagery for field ${fieldId}`);
    } catch (error) {
      console.error('Failed to cache satellite imagery:', error);
    }
  }

  /**
   * Get cached satellite imagery
   */
  async getCachedImagery(fieldId: string): Promise<{
    imagery_data: Blob;
    ndvi_data: any;
    analysis_results: any;
  } | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    try {
      const cached = await this.db.get('satellite_imagery', fieldId);
      
      if (!cached) return null;
      
      // Check if expired
      if (new Date(cached.expires_at) < new Date()) {
        await this.db.delete('satellite_imagery', fieldId);
        return null;
      }

      return {
        imagery_data: cached.imagery_data,
        ndvi_data: cached.ndvi_data,
        analysis_results: cached.analysis_results
      };
    } catch (error) {
      console.error('Failed to get cached imagery:', error);
      return null;
    }
  }

  /**
   * Cache field analysis results
   */
  async cacheFieldAnalysis(fieldId: string, analysis: any): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) return;

    try {
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION).toISOString();
      
      await this.db.put('field_analysis', {
        field_id: fieldId,
        analysis,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt
      });

      console.log(`✅ Cached field analysis for field ${fieldId}`);
    } catch (error) {
      console.error('Failed to cache field analysis:', error);
    }
  }

  /**
   * Get cached field analysis
   */
  async getCachedAnalysis(fieldId: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    try {
      const cached = await this.db.get('field_analysis', fieldId);
      
      if (!cached) return null;
      
      // Check if expired
      if (new Date(cached.expires_at) < new Date()) {
        await this.db.delete('field_analysis', fieldId);
        return null;
      }

      return cached.analysis;
    } catch (error) {
      console.error('Failed to get cached analysis:', error);
      return null;
    }
  }

  /**
   * Cache precision agriculture alerts
   */
  async cachePrecisionAlerts(fieldId: string, alerts: any[]): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) return;

    try {
      await this.db.put('precision_alerts', {
        field_id: fieldId,
        alerts,
        cached_at: new Date().toISOString()
      });

      console.log(`✅ Cached precision alerts for field ${fieldId}`);
    } catch (error) {
      console.error('Failed to cache precision alerts:', error);
    }
  }

  /**
   * Get cached precision alerts
   */
  async getCachedAlerts(fieldId: string): Promise<any[] | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    try {
      const cached = await this.db.get('precision_alerts', fieldId);
      return cached ? cached.alerts : null;
    } catch (error) {
      console.error('Failed to get cached alerts:', error);
      return null;
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) return;

    try {
      const now = new Date().toISOString();
      
      // Clean expired imagery
      const imageryTx = this.db.transaction('satellite_imagery', 'readwrite');
      const imageryStore = imageryTx.objectStore('satellite_imagery');
      const imageryIndex = imageryStore.index('expires_at');
      
      for await (const cursor of imageryIndex.iterate(IDBKeyRange.upperBound(now))) {
        await cursor.delete();
      }

      // Clean expired analysis
      const analysisTx = this.db.transaction('field_analysis', 'readwrite');
      const analysisStore = analysisTx.objectStore('field_analysis');
      const analysisIndex = analysisStore.index('expires_at');
      
      for await (const cursor of analysisIndex.iterate(IDBKeyRange.upperBound(now))) {
        await cursor.delete();
      }

      console.log('✅ Cleaned expired satellite cache entries');
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    imageryCount: number;
    analysisCount: number;
    alertsCount: number;
    totalSize: number;
  }> {
    if (!this.db) await this.initialize();
    if (!this.db) return { imageryCount: 0, analysisCount: 0, alertsCount: 0, totalSize: 0 };

    try {
      const [imageryCount, analysisCount, alertsCount] = await Promise.all([
        this.db.count('satellite_imagery'),
        this.db.count('field_analysis'),
        this.db.count('precision_alerts')
      ]);

      // Estimate total size (rough calculation)
      const totalSize = imageryCount * 1024 * 1024 + analysisCount * 10 * 1024 + alertsCount * 5 * 1024; // MB estimate

      return {
        imageryCount,
        analysisCount,
        alertsCount,
        totalSize
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { imageryCount: 0, analysisCount: 0, alertsCount: 0, totalSize: 0 };
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) return;

    try {
      await Promise.all([
        this.db.clear('satellite_imagery'),
        this.db.clear('field_analysis'),
        this.db.clear('precision_alerts')
      ]);

      console.log('✅ Cleared all satellite cache data');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Singleton instance
export const offlineSatelliteCache = new OfflineSatelliteCache();

/**
 * MOBILE-OPTIMIZED SATELLITE SERVICE
 * Handles online/offline satellite intelligence with automatic caching
 */
export class MobileSatelliteService {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('📡 Back online - satellite services restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Offline mode - using cached satellite data');
    });

    // Initialize cache
    offlineSatelliteCache.initialize();

    // Clean expired cache daily
    setInterval(() => {
      offlineSatelliteCache.cleanExpiredCache();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Get field analysis with offline fallback
   */
  async getFieldAnalysis(fieldId: string, coordinates: { lat: number; lng: number }[], forceRefresh = false): Promise<any> {
    // Try cache first if offline or not forcing refresh
    if (!this.isOnline || !forceRefresh) {
      const cached = await offlineSatelliteCache.getCachedAnalysis(fieldId);
      if (cached) {
        console.log(`📱 Using cached analysis for field ${fieldId}`);
        return cached;
      }
    }

    // If online, try to get fresh data
    if (this.isOnline) {
      try {
        const { analyzeFieldEnhanced } = await import('@/intelligence/enhancedFieldIntelligence');
        const analysis = await analyzeFieldEnhanced(coordinates, fieldId);
        
        // Cache the results
        await offlineSatelliteCache.cacheFieldAnalysis(fieldId, analysis);
        
        return analysis;
      } catch (error) {
        console.error('Online analysis failed, trying cache:', error);
        
        // Fallback to cache
        const cached = await offlineSatelliteCache.getCachedAnalysis(fieldId);
        if (cached) {
          return cached;
        }
        
        throw error;
      }
    }

    throw new Error('No cached data available and device is offline');
  }

  /**
   * Get precision agriculture alerts with offline support
   */
  async getPrecisionAlerts(fieldId: string, coordinates: { lat: number; lng: number }[], cropType: string): Promise<any> {
    // Try cache first if offline
    if (!this.isOnline) {
      const cached = await offlineSatelliteCache.getCachedAlerts(fieldId);
      if (cached) {
        console.log(`📱 Using cached alerts for field ${fieldId}`);
        return { alerts: cached, variableRateZones: [], recommendations: [] };
      }
    }

    // If online, get fresh alerts
    if (this.isOnline) {
      try {
        const { monitorFieldPrecisionAgriculture } = await import('@/services/satelliteAlertService');
        const results = await monitorFieldPrecisionAgriculture(fieldId, coordinates, cropType);
        
        // Cache the alerts
        await offlineSatelliteCache.cachePrecisionAlerts(fieldId, results.alerts);
        
        return results;
      } catch (error) {
        console.error('Online alerts failed, trying cache:', error);
        
        const cached = await offlineSatelliteCache.getCachedAlerts(fieldId);
        if (cached) {
          return { alerts: cached, variableRateZones: [], recommendations: [] };
        }
        
        throw error;
      }
    }

    throw new Error('No cached alerts available and device is offline');
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get cache statistics for user
   */
  async getCacheInfo(): Promise<any> {
    return await offlineSatelliteCache.getCacheStats();
  }

  /**
   * Clear cache (for settings/storage management)
   */
  async clearCache(): Promise<void> {
    await offlineSatelliteCache.clearAllCache();
  }
}

// Export singleton
export const mobileSatelliteService = new MobileSatelliteService();