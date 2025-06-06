// src/hooks/useOfflineStatus.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to track online/offline status
 *
 * Enables components to respond appropriately to connectivity changes
 * and implement offline-first behavior by providing the current network status.
 *
 * @returns {boolean} isOffline - Whether the user is currently offline
 */
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
