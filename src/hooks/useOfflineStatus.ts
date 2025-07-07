/**
 * 🔌 OFFLINE STATUS HOOK - Trillion-Dollar Connectivity
 * Real-time online/offline status with visual indicators
 */

import { useState, useEffect } from 'react';
import { OfflineManager } from '@/lib/offlineStorage';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    
    const unsubscribe = offlineManager.subscribe((online) => {
      if (!online && isOnline) {
        setWasOffline(true);
      }
      setIsOnline(online);
    });

    return unsubscribe;
  }, [isOnline]);

  const getStatusConfig = () => {
    if (isOnline && wasOffline) {
      return {
        status: 'reconnected',
        color: 'bg-green-500',
        glow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
        text: 'Back Online',
        icon: '🟢'
      };
    } else if (isOnline) {
      return {
        status: 'online',
        color: 'bg-green-500',
        glow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
        text: 'Online',
        icon: '🟢'
      };
    } else {
      return {
        status: 'offline',
        color: 'bg-red-500',
        glow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        text: 'Offline Mode',
        icon: '🔴'
      };
    }
  };

  return {
    isOnline,
    wasOffline,
    statusConfig: getStatusConfig(),
    clearOfflineFlag: () => setWasOffline(false)
  };
};