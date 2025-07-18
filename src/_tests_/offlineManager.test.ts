import { offlineManager } from '@/services/offlineManager';
import { supabase } from '@/integrations/supabase/client';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { openDB } from 'idb';

describe('OfflineManager', () => {
  beforeEach(async () => {
    // Initialize the offline manager before each test
    await offlineManager.initialize();
  });

  it('should initialize database successfully', async () => {
    const db = await openDB('cropgenius-offline');
    expect(db).toBeDefined();
  });

  it('should save and retrieve data', async () => {
    const testKey = 'test-key';
    const testData = { name: 'test', value: 42 };

    await offlineManager.save(testKey, testData);
    const retrievedData = await offlineManager.get<typeof testData>(testKey);

    expect(retrievedData).toEqual(testData);
  });

  it('should handle offline state detection', () => {
    // Simulate online state
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
    });
    expect(offlineManager.isOffline()).toBe(false);

    // Simulate offline state
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
    });
    expect(offlineManager.isOffline()).toBe(true);
  });

  it('should clear all data', async () => {
    const testKey = 'test-key';
    const testData = { name: 'test', value: 42 };

    await offlineManager.save(testKey, testData);
    await offlineManager.clear();

    const retrievedData = await offlineManager.get<typeof testData>(testKey);
    expect(retrievedData).toBeNull();
  });

  it('should handle online/offline events', async () => {
    const onlineSpy = vi.fn();
    const offlineSpy = vi.fn();

    const onlineCleanup = offlineManager.addOnlineListener(onlineSpy);
    const offlineCleanup = offlineManager.addOfflineListener(offlineSpy);

    // Simulate online event
    window.dispatchEvent(new Event('online'));
    expect(onlineSpy).toHaveBeenCalled();

    // Simulate offline event
    window.dispatchEvent(new Event('offline'));
    expect(offlineSpy).toHaveBeenCalled();

    // Cleanup event listeners
    onlineCleanup();
    offlineCleanup();
  });
});
