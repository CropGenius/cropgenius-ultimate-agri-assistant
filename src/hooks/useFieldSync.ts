import { useEffect, useCallback, useState } from 'react';
import { useNetworkStatus } from './network/useNetworkStatus';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useFieldSync = (fieldId?: string) => {
  const { isOnline } = useNetworkStatus();
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  // Sync field data when coming back online
  useEffect(() => {
    if (isOnline && fieldId) {
      syncFieldData();
    }
  }, [isOnline, fieldId]);

  // Manual sync function
  const syncFieldData = useCallback(async () => {
    if (!fieldId || !user?.id) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Invalidate all queries related to this field to trigger refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['field', fieldId] }),
        queryClient.invalidateQueries({ queryKey: ['fieldCrops', fieldId] }),
        queryClient.invalidateQueries({ queryKey: ['fieldHistory', fieldId] }),
        // Add any other queries that need to be synced
      ]);

      setLastSyncTime(new Date());
      toast.success('Field data synced successfully');
    } catch (error) {
      console.error('Error syncing field data:', error);
      const err =
        error instanceof Error ? error : new Error('Failed to sync field data');
      setSyncError(err);
      toast.error('Sync failed', {
        description: err.message,
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [fieldId, user?.id, queryClient]);

  // Check if there are pending changes
  const hasPendingChanges = useCallback((): boolean => {
    if (!fieldId) return false;

    // Check for any pending mutations in the offline queue
    const offlineQueue =
      queryClient.getQueryData<Array<{ fieldId: string }>>(['offlineQueue']) ||
      [];
    return offlineQueue.some((item) => item.fieldId === fieldId);
  }, [fieldId, queryClient]);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    if (!isOnline) return 'offline';
    if (isSyncing) return 'syncing';
    if (syncError) return 'error';
    if (hasPendingChanges()) return 'pending';
    return 'synced';
  }, [isOnline, isSyncing, syncError, hasPendingChanges]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    syncFieldData,
    hasPendingChanges,
    getSyncStatus,
    isOnline,
  };
};
