/**
 * 💾 OFFLINE STORAGE - Trillion-Dollar Persistence
 * IndexedDB + React Query persistence for offline magic
 */

import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create persister for React Query
export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'CROPGENIUS_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Persist query client
export const setupOfflinePersistence = (queryClient: any) => {
  persistQueryClient({
    queryClient,
    persister: queryPersister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    buster: '1.0.0', // App version
  });
};

// Offline status management
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));
  }

  private setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Offline data cache
export const OfflineCache = {
  // Store critical farm data
  storeFarmData: (farmId: string, data: any) => {
    localStorage.setItem(`farm_${farmId}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      version: '1.0.0'
    }));
  },

  // Get cached farm data
  getFarmData: (farmId: string) => {
    const cached = localStorage.getItem(`farm_${farmId}`);
    if (!cached) return null;
    
    try {
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000; // 24 hours
      return isExpired ? null : parsed.data;
    } catch {
      return null;
    }
  },

  // Store last known location
  storeLocation: (lat: number, lng: number) => {
    localStorage.setItem('last_location', JSON.stringify({ lat, lng, timestamp: Date.now() }));
  },

  // Get last known location
  getLocation: () => {
    const cached = localStorage.getItem('last_location');
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  },

  // Store offline queue
  addToOfflineQueue: (action: { type: string; payload: any; timestamp: number }) => {
    const queue = OfflineCache.getOfflineQueue();
    queue.push(action);
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  },

  // Get offline queue
  getOfflineQueue: () => {
    const queue = localStorage.getItem('offline_queue');
    return queue ? JSON.parse(queue) : [];
  },

  // Clear offline queue
  clearOfflineQueue: () => {
    localStorage.removeItem('offline_queue');
  },

  // Clear all cache
  clearAll: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('farm_') || key.startsWith('CROPGENIUS_')) {
        localStorage.removeItem(key);
      }
    });
  }
};