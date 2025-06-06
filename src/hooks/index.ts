// Network
import { useNetworkStatus } from './network/useNetworkStatus';

// Storage
import { useLocalStorage } from './storage/useLocalStorage';

// Offline
import { useOfflineQueue } from './offline/useOfflineQueue';
import { useOfflineMutation } from './offline/useOfflineMutation';

export {
  // Network
  useNetworkStatus,

  // Storage
  useLocalStorage,

  // Offline
  useOfflineQueue,
  useOfflineMutation,
};

// Re-export from react-query for convenience
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
