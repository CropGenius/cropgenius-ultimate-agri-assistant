import { useCallback, useEffect } from 'react';
import { useLocalStorage } from '../storage/useLocalStorage';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { v4 as uuidv4 } from 'uuid';

export interface QueuedOperation<T = unknown> {
  id: string;
  type: 'mutation' | 'query';
  variables: T;
  meta: Record<string, unknown>;
  timestamp: string;
  retry: boolean;
  retryDelay: number;
  retryCount?: number;
  lastError?: string;
}

const QUEUE_STORAGE_KEY = 'offline-queue';

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useLocalStorage<QueuedOperation[]>(
    QUEUE_STORAGE_KEY,
    []
  );

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      retryQueue();
    }
  }, [isOnline, queue.length]);

  const addToQueue = useCallback(
    async <T = unknown>(
      operation: Omit<QueuedOperation<T>, 'id' | 'timestamp'>
    ) => {
      const newOperation: QueuedOperation<T> = {
        ...operation,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      setQueue((prev) => [...prev, newOperation as QueuedOperation]);
      return newOperation;
    },
    [setQueue]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      setQueue((prev) => prev.filter((op) => op.id !== id));
    },
    [setQueue]
  );

  const updateOperation = useCallback(
    <T = unknown>(id: string, updates: Partial<QueuedOperation<T>>) => {
      setQueue((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...updates } : op))
      );
    },
    [setQueue]
  );

  const retryOperation = useCallback(
    async (operation: QueuedOperation) => {
      try {
        // In a real implementation, this would call the original mutation/query
        // For now, we'll just simulate a successful operation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        removeFromQueue(operation.id);
        return true;
      } catch (error) {
        const retryCount = (operation.retryCount || 0) + 1;
        const shouldRetry = operation.retry && retryCount < 3; // Max 3 retries

        if (shouldRetry) {
          updateOperation(operation.id, {
            retryCount,
            lastError: error instanceof Error ? error.message : 'Unknown error',
          });
          return false;
        }

        // Give up after max retries
        updateOperation(operation.id, {
          retry: false,
          lastError: `Max retries exceeded: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
        return false;
      }
    },
    [removeFromQueue, updateOperation]
  );

  const retryQueue = useCallback(async () => {
    if (!isOnline) return;

    const operationsToRetry = queue.filter((op) => op.retry);
    const results = await Promise.all(
      operationsToRetry.map((op) => retryOperation(op))
    );

    // Remove successfully processed operations
    operationsToRetry.forEach((op, index) => {
      if (results[index]) {
        removeFromQueue(op.id);
      }
    });
  }, [isOnline, queue, retryOperation, removeFromQueue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    updateOperation,
    retryQueue,
    retryOperation,
  };
}
