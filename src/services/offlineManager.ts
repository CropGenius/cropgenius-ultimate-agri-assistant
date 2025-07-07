import { openDB } from 'idb';
import { supabase } from './supabaseClient';

export interface OfflineCacheConfig {
  name: string;
  version: number;
  stores: {
    [key: string]: {
      keyPath?: string;
      autoIncrement?: boolean;
      indexes?: Array<{
        name: string;
        keyPath: string | string[];
        options?: {
          unique?: boolean;
          multiEntry?: boolean;
        };
      }>;
    };
  };
}

export class OfflineManager {
  private static instance: OfflineManager;
  private db: IDBDatabase;
  private isOnline: boolean = true;

  private constructor() {
    // Private constructor to prevent instantiation
    this.init();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async init() {
    this.db = await openDB('cropgenius', 1, {
      upgrade(db) {
        // Weather data
        db.createObjectStore('weather', { keyPath: 'timestamp' });
        
        // Market data
        db.createObjectStore('market', { keyPath: 'id' });
        
        // Crop data
        db.createObjectStore('cropData', { keyPath: 'id' });
        
        // User data
        db.createObjectStore('userData', { keyPath: 'userId' });
      }
    });

    // Set up online/offline detection
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncOfflineData();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  private async syncOfflineData() {
    if (!this.isOnline) return;

    // Sync weather data
    const weatherStore = this.db.transaction('weather', 'readonly').objectStore('weather');
    const weatherData = await weatherStore.getAll();
    if (weatherData.length > 0) {
      await this.syncToSupabase('weather', weatherData);
    }

    // Sync market data
    const marketStore = this.db.transaction('market', 'readonly').objectStore('market');
    const marketData = await marketStore.getAll();
    if (marketData.length > 0) {
      await this.syncToSupabase('market', marketData);
    }

    // Sync crop data
    const cropStore = this.db.transaction('cropData', 'readonly').objectStore('cropData');
    const cropData = await cropStore.getAll();
    if (cropData.length > 0) {
      await this.syncToSupabase('cropData', cropData);
    }
  }

  private async syncToSupabase(storeName: string, data: any[]) {
    try {
      const { data: syncData, error } = await supabase
        .from(storeName)
        .upsert(data);

      if (error) throw error;

      // Clear local cache after successful sync
      const store = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
      await store.clear();
    } catch (error) {
      console.error(`Failed to sync ${storeName} data:`, error);
      // Keep data in local cache if sync fails
    }
  }

  public async saveData(storeName: string, data: any) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
    
    // If online, try to sync immediately
    if (this.isOnline) {
      await this.syncOfflineData();
    }
  }

  public async getData(storeName: string, key: any) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return await store.get(key);
  }

  public async getAllData(storeName: string) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return await store.getAll();
  }

  public async deleteData(storeName: string, key: any) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.delete(key);
  }

  public async clearStore(storeName: string) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.clear();
  }

  public isOffline(): boolean {
    return !this.isOnline;
  }

  public async getOfflineStatus() {
    return {
      isOffline: this.isOffline(),
      lastSync: await this.getLastSyncTime()
    };
  }

  private async getLastSyncTime() {
    const userDataStore = this.db.transaction('userData', 'readonly').objectStore('userData');
    const userData = await userDataStore.get('sync');
    return userData?.lastSync || null;
  }

  public async updateLastSyncTime() {
    const userDataStore = this.db.transaction('userData', 'readwrite').objectStore('userData');
    await userDataStore.put({
      userId: 'sync',
      lastSync: new Date().toISOString()
    });
  }
}
