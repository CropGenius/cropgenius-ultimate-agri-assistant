// src/services/offlineSyncService.ts

/**
 * Offline Sync Service for CropGenius
 *
 * Handles data synchronization between IndexedDB and Supabase
 * Implements background sync capabilities when connectivity is restored
 * Ensures critical farm data persists and syncs even in unreliable network conditions
 */

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Define data stores for offline support
export enum OfflineStore {
  WEATHER = 'weather',
  TASKS = 'tasks',
  CROP_SCANS = 'cropScans',
  MARKET = 'market',
  FARM_PLANS = 'farmPlans',
  OUTBOX = 'outbox',
  SYNC_LOG = 'syncLog',
}

// Sync status tracking
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Interface for sync log entries
export interface SyncLogEntry {
  id: string;
  store: OfflineStore;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  status: SyncStatus;
  attempts: number;
  lastAttempt: string | null;
  error: string | null;
  createdAt: string;
}

// Type for outbox items (pending sync operations)
export interface OutboxItem {
  id: string;
  store: OfflineStore;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

// Supabase table mapping for stores
const storeTableMap: Record<OfflineStore, string> = {
  [OfflineStore.WEATHER]: 'weather_data',
  [OfflineStore.TASKS]: 'tasks',
  [OfflineStore.CROP_SCANS]: 'crop_scans',
  [OfflineStore.MARKET]: 'market_listings',
  [OfflineStore.FARM_PLANS]: 'farm_plans',
  [OfflineStore.OUTBOX]: '', // Internal only
  [OfflineStore.SYNC_LOG]: '', // Internal only
};

/**
 * Initialize the IndexedDB database and create necessary object stores
 * @returns Promise that resolves when the database is ready
 */
export const initOfflineDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cropgenius-offline', 1);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Failed to open IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores for all data types if they don't exist
      Object.values(OfflineStore).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          const objectStore = db.createObjectStore(store, { keyPath: 'id' });

          // Add specific indexes based on store type
          if (store === OfflineStore.WEATHER) {
            objectStore.createIndex('timestamp', 'timestamp', {
              unique: false,
            });
            objectStore.createIndex('farm_id', 'farm_id', { unique: false });
          } else if (store === OfflineStore.TASKS) {
            objectStore.createIndex('due_date', 'due_date', { unique: false });
            objectStore.createIndex('completed', 'completed', {
              unique: false,
            });
            objectStore.createIndex('user_id', 'user_id', { unique: false });
          } else if (store === OfflineStore.OUTBOX) {
            objectStore.createIndex('timestamp', 'timestamp', {
              unique: false,
            });
            objectStore.createIndex('priority', 'priority', { unique: false });
          }
        }
      });
    };
  });
};

/**
 * Save data to local IndexedDB for offline access and queue for sync
 * @param store The store to save to
 * @param data The data to save
 * @param syncImmediately Whether to attempt to sync now if online
 * @returns Promise that resolves when the data is saved
 */
export const saveOfflineData = async <T extends { id?: string }>(
  store: OfflineStore,
  data: T,
  syncImmediately = true
): Promise<T> => {
  try {
    const db = await initOfflineDatabase();

    // Ensure data has an ID
    if (!data.id) {
      data.id = uuidv4();
    }

    // Add timestamp for tracking
    const dataWithMeta = {
      ...data,
      _offlineTimestamp: new Date().toISOString(),
      _syncStatus: SyncStatus.PENDING,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(dataWithMeta);

      request.onsuccess = async () => {
        // Add to outbox for syncing later
        await addToOutbox(store, 'create', dataWithMeta);

        // Try to sync immediately if online and requested
        if (syncImmediately && navigator.onLine) {
          syncOfflineData().catch(console.error);
        }

        resolve(dataWithMeta as T);
      };

      request.onerror = (event) => {
        console.error('Error saving to IndexedDB:', event);
        reject('Failed to save offline data');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in saveOfflineData:', error);
    throw error;
  }
};

/**
 * Retrieve data from IndexedDB
 * @param store The store to retrieve from
 * @param id Optional ID to retrieve specific record
 * @returns Promise that resolves to the retrieved data
 */
export const getOfflineData = async <T>(
  store: OfflineStore,
  id?: string
): Promise<T | T[]> => {
  try {
    const db = await initOfflineDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);

      let request;
      if (id) {
        request = objectStore.get(id);
      } else {
        request = objectStore.getAll();
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result);
      };

      request.onerror = (event) => {
        console.error('Error retrieving from IndexedDB:', event);
        reject('Failed to retrieve offline data');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getOfflineData:', error);
    throw error;
  }
};

/**
 * Add an item to the outbox for later synchronization
 * @param store The data store type
 * @param operation The operation type
 * @param data The data to sync
 * @param priority The priority level
 */
export const addToOutbox = async (
  store: OfflineStore,
  operation: 'create' | 'update' | 'delete',
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> => {
  try {
    const db = await initOfflineDatabase();

    const outboxItem: OutboxItem = {
      id: uuidv4(),
      store,
      operation,
      data,
      timestamp: new Date().toISOString(),
      priority,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OfflineStore.OUTBOX], 'readwrite');
      const objectStore = transaction.objectStore(OfflineStore.OUTBOX);
      const request = objectStore.add(outboxItem);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error adding to outbox:', event);
        reject('Failed to add to outbox');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in addToOutbox:', error);
    throw error;
  }
};

/**
 * Register service worker for background sync
 * @returns Promise that resolves when registration is complete
 */
export const registerBackgroundSync = async (): Promise<void> => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Register for sync events
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-outbox');
      } else {
        console.warn(
          'registration.sync not found, background sync might not be fully supported.'
        );
      }
      console.log('Background sync registered');
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  } else {
    console.warn('Background sync not supported');
  }
};

/**
 * Synchronize all pending offline data with Supabase
 * @param maxAttempts Maximum number of sync attempts
 * @returns Promise that resolves when sync is complete
 */
export const syncOfflineData = async (maxAttempts = 3): Promise<void> => {
  if (!navigator.onLine) {
    console.log('Offline, skipping sync');
    return;
  }

  try {
    const db = await initOfflineDatabase();
    const outboxItems = await getOfflineData<OutboxItem>(OfflineStore.OUTBOX);

    if (!Array.isArray(outboxItems) || outboxItems.length === 0) {
      console.log('No items to sync');
      return;
    }

    console.log(`Syncing ${outboxItems.length} offline items`);

    // Sort by priority (high first)
    const sortedItems = [...outboxItems].sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });

    for (const item of sortedItems) {
      try {
        const { store, operation, data } = item;
        const tableName = storeTableMap[store];

        if (!tableName) {
          console.log(`Skipping internal store: ${store}`);
          await removeFromOutbox(item.id);
          continue;
        }

        let result;

        // Clean up internal metadata fields before sending to server
        const cleanData = { ...data };
        delete cleanData._offlineTimestamp;
        delete cleanData._syncStatus;

        switch (operation) {
          case 'create':
          case 'update':
            result = await supabase.from(tableName).upsert(cleanData);
            break;
          case 'delete':
            result = await supabase.from(tableName).delete().eq('id', data.id);
            break;
        }

        if (result.error) {
          throw result.error;
        }

        // Successfully synced, remove from outbox
        await removeFromOutbox(item.id);

        // Update sync log
        await addSyncLogEntry({
          id: uuidv4(),
          store,
          recordId: data.id,
          operation,
          status: SyncStatus.COMPLETED,
          attempts: 1,
          lastAttempt: new Date().toISOString(),
          error: null,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);

        // Update sync log with failure
        await addSyncLogEntry({
          id: uuidv4(),
          store: item.store,
          recordId: item.data.id,
          operation: item.operation,
          status: SyncStatus.FAILED,
          attempts: 1,
          lastAttempt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error in syncOfflineData:', error);
    throw error;
  }
};

/**
 * Remove an item from the outbox after successful sync
 * @param id The outbox item ID to remove
 */
const removeFromOutbox = async (id: string): Promise<void> => {
  try {
    const db = await initOfflineDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OfflineStore.OUTBOX], 'readwrite');
      const objectStore = transaction.objectStore(OfflineStore.OUTBOX);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error removing from outbox:', event);
        reject('Failed to remove from outbox');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in removeFromOutbox:', error);
    throw error;
  }
};

/**
 * Add an entry to the sync log
 * @param entry The log entry to add
 */
const addSyncLogEntry = async (entry: SyncLogEntry): Promise<void> => {
  try {
    const db = await initOfflineDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OfflineStore.SYNC_LOG], 'readwrite');
      const objectStore = transaction.objectStore(OfflineStore.SYNC_LOG);
      const request = objectStore.add(entry);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error adding to sync log:', event);
        reject('Failed to add to sync log');
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in addSyncLogEntry:', error);
    throw error;
  }
};

/**
 * Initialize offline synchronization
 * @returns Promise that resolves when initialization is complete
 */
export const initOfflineSync = async (): Promise<void> => {
  try {
    // Initialize database
    await initOfflineDatabase();

    // Register for background sync
    await registerBackgroundSync();

    // Set up online/offline event listeners
    window.addEventListener('online', () => {
      console.log('Back online, syncing data...');
      syncOfflineData().catch(console.error);
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      await syncOfflineData();
    }

    console.log('Offline sync initialized');
  } catch (error) {
    console.error('Error initializing offline sync:', error);
    throw error;
  }
};

// Export a unified API for offline data operations
export default {
  initOfflineDatabase,
  initOfflineSync,
  saveOfflineData,
  getOfflineData,
  syncOfflineData,
  registerBackgroundSync,
};
