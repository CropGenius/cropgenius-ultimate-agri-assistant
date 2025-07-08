import { openDB } from 'idb';
import { supabase } from '@/lib/supabase';
import { PerformanceService } from '@/services/performance';
import { ErrorHandler } from '@/services/errorHandler';

const performanceService = new PerformanceService();
const errorHandler = new ErrorHandler();

interface OfflineManager {
  initialize: () => Promise<void>;
  save: <T>(key: string, data: T) => Promise<void>;
  get: <T>(key: string) => Promise<T | null>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  isOffline: () => boolean;
  addOnlineListener: (callback: () => void) => () => void;
  addOfflineListener: (callback: () => void) => () => void;
}

export const offlineManager: OfflineManager = {
  async initialize() {
    try {
      await openDB('cropgenius-offline', 1, {
        upgrade(db) {
          db.createObjectStore('data', { keyPath: 'key' });
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        },
      });
    } catch (error) {
      errorHandler.handleError('Offline initialization failed', error);
    }
  },

  async save<T>(key: string, data: T) {
    try {
      const db = await openDB('cropgenius-offline');
      await db.put('data', { key, value: data });
    } catch (error) {
      errorHandler.handleError('Failed to save offline data', error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await openDB('cropgenius-offline');
      const result = await db.get('data', key);
      return result?.value as T | null;
    } catch (error) {
      errorHandler.handleError('Failed to get offline data', error);
      return null;
    }
  },

  async remove(key: string) {
    try {
      const db = await openDB('cropgenius-offline');
      await db.delete('data', key);
    } catch (error) {
      errorHandler.handleError('Failed to remove offline data', error);
    }
  },

  async clear() {
    try {
      const db = await openDB('cropgenius-offline');
      await db.clear('data');
      await db.clear('syncQueue');
    } catch (error) {
      errorHandler.handleError('Failed to clear offline data', error);
    }
  },

  isOffline() {
    return !navigator.onLine;
  },

  addOnlineListener(callback: () => void): () => void {
    const handleOnline = () => {
      callback();
      performanceService.retryPendingOperations();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  },

  addOfflineListener(callback: () => void): () => void {
    const handleOffline = () => {
      callback();
    };

    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }
};
