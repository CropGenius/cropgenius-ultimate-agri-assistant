import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { FieldCrop, FieldHistory } from '@/types/field';

// Local storage keys
const OFFLINE_CROPS_KEY = 'cropgenius_offline_crops';
const OFFLINE_HISTORY_KEY = 'cropgenius_offline_history';

// Helper functions for offline data management
const getOfflineData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving offline data for ${key}:`, error);
    return [];
  }
};

const saveOfflineData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving offline data for ${key}:`, error);
    toast.error('Storage error', {
      description:
        'Failed to save data offline. Your device may be out of storage.',
    });
  }
};

// Field Crops
export const getFieldCrops = async (fieldId: string): Promise<FieldCrop[]> => {
  try {
    // Try to fetch from server first if online
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('field_crops')
        .select('*')
        .eq('field_id', fieldId)
        .order('planting_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error fetching field crops:', error);
    // Continue to offline fallback
  }

  // Fall back to offline data
  const offlineCrops = getOfflineData<FieldCrop>(OFFLINE_CROPS_KEY);
  return offlineCrops.filter((crop) => crop.field_id === fieldId);
};

export const createFieldCrop = async (
  crop: Omit<FieldCrop, 'id' | 'created_at' | 'offline_id' | 'is_synced'>
): Promise<{ data: FieldCrop | null; error: string | null }> => {
  const newCrop: FieldCrop = {
    ...crop,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    offline_id: uuidv4(),
    is_synced: false,
  };

  // If online, try to save to server
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('field_crops')
        .insert(newCrop)
        .select()
        .single();

      if (error) throw error;

      // Update local cache
      const offlineCrops = getOfflineData<FieldCrop>(OFFLINE_CROPS_KEY);
      const updatedCrops = offlineCrops.filter(
        (c) => c.offline_id !== newCrop.offline_id
      );
      updatedCrops.push({
        ...data,
        offline_id: newCrop.offline_id,
        is_synced: true,
      });
      saveOfflineData(OFFLINE_CROPS_KEY, updatedCrops);

      return { data, error: null };
    } catch (error) {
      console.error('Error creating field crop:', error);
      // Continue to offline save
    }
  }

  // Save to offline storage
  const offlineCrops = getOfflineData<FieldCrop>(OFFLINE_CROPS_KEY);
  saveOfflineData(OFFLINE_CROPS_KEY, [...offlineCrops, newCrop]);

  return { data: newCrop, error: null };
};

// Field History
export const getFieldHistory = async (
  fieldId: string
): Promise<FieldHistory[]> => {
  try {
    // Try to fetch from server first if online
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('field_history')
        .select('*')
        .eq('field_id', fieldId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error fetching field history:', error);
    // Continue to offline fallback
  }

  // Fall back to offline data
  const offlineHistory = getOfflineData<FieldHistory>(OFFLINE_HISTORY_KEY);
  return offlineHistory.filter((record) => record.field_id === fieldId);
};

export const createFieldHistory = async (
  history: Omit<FieldHistory, 'id' | 'created_at' | 'offline_id' | 'is_synced'>
): Promise<{ data: FieldHistory | null; error: string | null }> => {
  const newHistory: FieldHistory = {
    ...history,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    offline_id: uuidv4(),
    is_synced: false,
  };

  // If online, try to save to server
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('field_history')
        .insert(newHistory)
        .select()
        .single();

      if (error) throw error;

      // Update local cache
      const offlineHistory = getOfflineData<FieldHistory>(OFFLINE_HISTORY_KEY);
      const updatedHistory = offlineHistory.filter(
        (h) => h.offline_id !== newHistory.offline_id
      );
      updatedHistory.push({
        ...data,
        offline_id: newHistory.offline_id,
        is_synced: true,
      });
      saveOfflineData(OFFLINE_HISTORY_KEY, updatedHistory);

      return { data, error: null };
    } catch (error) {
      console.error('Error creating field history:', error);
      // Continue to offline save
    }
  }

  // Save to offline storage
  const offlineHistory = getOfflineData<FieldHistory>(OFFLINE_HISTORY_KEY);
  saveOfflineData(OFFLINE_HISTORY_KEY, [...offlineHistory, newHistory]);

  return { data: newHistory, error: null };
};

// Sync offline data
const syncOfflineData = async (): Promise<void> => {
  if (!navigator.onLine) return;

  try {
    // Sync crops
    const offlineCrops = getOfflineData<FieldCrop>(OFFLINE_CROPS_KEY).filter(
      (crop) => !crop.is_synced
    );

    for (const crop of offlineCrops) {
      const { error } = await supabase.from('field_crops').upsert({
        ...crop,
        id: crop.is_synced ? crop.id : undefined,
      });

      if (!error) {
        // Update sync status
        const updatedCrops = getOfflineData<FieldCrop>(OFFLINE_CROPS_KEY);
        const index = updatedCrops.findIndex(
          (c) => c.offline_id === crop.offline_id
        );
        if (index !== -1) {
          updatedCrops[index] = { ...updatedCrops[index], is_synced: true };
          saveOfflineData(OFFLINE_CROPS_KEY, updatedCrops);
        }
      }
    }

    // Sync history
    const offlineHistory = getOfflineData<FieldHistory>(
      OFFLINE_HISTORY_KEY
    ).filter((record) => !record.is_synced);

    for (const record of offlineHistory) {
      const { error } = await supabase.from('field_history').upsert({
        ...record,
        id: record.is_synced ? record.id : undefined,
      });

      if (!error) {
        // Update sync status
        const updatedHistory =
          getOfflineData<FieldHistory>(OFFLINE_HISTORY_KEY);
        const index = updatedHistory.findIndex(
          (h) => h.offline_id === record.offline_id
        );
        if (index !== -1) {
          updatedHistory[index] = { ...updatedHistory[index], is_synced: true };
          saveOfflineData(OFFLINE_HISTORY_KEY, updatedHistory);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing offline data:', error);
    throw error;
  }
};

// Initialize sync on app start
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
  syncOfflineData(); // Initial sync
}
