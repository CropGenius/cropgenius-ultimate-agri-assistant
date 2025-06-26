import { useState, useEffect, useCallback, useRef } from 'react';
import register, {
  unregister as unregisterSW,
  isRegistered,
  getRegistration,
  isServiceWorkerSupported,
  type ServiceWorkerConfig
} from '@/utils/serviceWorkerRegistration';

type ServiceWorkerRegistration = globalThis.ServiceWorkerRegistration;

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
  isUpdating: boolean;
  isSupported: boolean;
  isActive: boolean;
  isOnline: boolean;
}

interface ServiceWorkerHookReturn {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
  isUpdating: boolean;
  isSupported: boolean;
  isActive: boolean;
  isOnline: boolean;
  isOffline: boolean;
  checkForUpdates: () => Promise<ServiceWorkerRegistration | null>;
  applyUpdate: () => Promise<void>;
  unregister: () => Promise<boolean>;
  updateApp: () => Promise<void>;
}

/**
 * Custom hook to manage service worker registration, updates, and lifecycle
 */
export function useServiceWorker(config: ServiceWorkerConfig = {}): ServiceWorkerHookReturn {
  const [state, setState] = useState<ServiceWorkerState>(() => ({
    registration: null,
    updateAvailable: false,
    error: null,
    isUpdating: false,
    isSupported: isServiceWorkerSupported(),
    isActive: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }));
  
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const updateInterval = useRef<number>();
  const isMounted = useRef(true);

  // Update state helper
  const updateState = useCallback((updates: Partial<ServiceWorkerState>) => {
    if (!isMounted.current) return;
    
    setState(prev => {
      const newState = { ...prev, ...updates };
      // Keep the ref in sync with the state
      if ('registration' in updates) {
        registrationRef.current = updates.registration || null;
      }
      return newState;
    });
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const handleOnline = () => updateState({ isOnline: true });
    const handleOffline = () => updateState({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateState]);

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!state.isSupported) {
      console.warn('[useServiceWorker] Service workers not supported');
      return null;
    }

    try {
      updateState({ error: null });
      const registration = await getRegistration();
      
      if (registration) {
        await registration.update();
        updateState({ registration });
        return registration;
      }
      
      return null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useServiceWorker] Update check failed:', err);
      updateState({ error: err });
      throw err;
    }
  }, [state.isSupported]);

  // Apply update and reload the page
  const applyUpdate = useCallback(async (): Promise<void> => {
    if (!state.registration?.waiting) {
      console.warn('[useServiceWorker] No waiting service worker found');
      return;
    }

    try {
      updateState({ isUpdating: true });
      
      // Notify the service worker to skip waiting
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Set up a timeout to force reload if the controller doesn't change
      const reloadTimeout = setTimeout(() => {
        console.warn('[useServiceWorker] Forcing reload after update');
        window.location.reload();
      }, 5000);

      // Clean up timeout if the controller changes
      const controllerChangeHandler = () => {
        clearTimeout(reloadTimeout);
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useServiceWorker] Failed to apply update:', err);
      updateState({ error: err, isUpdating: false });
      throw err;
    }
  }, [state.registration, updateState]);

  // Unregister service worker
  const unregisterSW = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    
    try {
      const result = await unregisterSW();
      if (result) {
        updateState({
          registration: null,
          updateAvailable: false,
          isActive: false,
        });
      }
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useServiceWorker] Failed to unregister:', err);
      updateState({ error: err });
      return false;
    }
  }, [state.isSupported, updateState]);

  // Setup service worker registration and event listeners
  useEffect(() => {
    if (!state.isSupported) {
      console.warn('[useServiceWorker] Service workers are not supported in this browser');
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[useServiceWorker] Skipping registration in development mode');
      return;
    }

    // Register service worker with config
    register({
      ...config,
      onSuccess: (reg) => {
        if (!isMounted.current) return;
        console.log('[useServiceWorker] Service worker registered successfully');
        updateState({
          registration: reg,
          isActive: true,
          error: null,
          updateAvailable: false,
        });

        // Set up periodic update checks (every 1 hour)
        updateInterval.current = window.setInterval(() => {
          checkForUpdates().catch(console.error);
        }, 60 * 60 * 1000);
      },
      onUpdate: (reg) => {
        if (!isMounted.current) return;
        console.log('[useServiceWorker] Service worker update available');
        updateState({
          registration: reg,
          updateAvailable: true,
          error: null,
        });
      },
      onError: (error) => {
        if (!isMounted.current) return;
        console.error('[useServiceWorker] Service worker error:', error);
        updateState({ error });
      },
    });

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [state.isSupported, config]);

  // Handle controller change for updates
  useEffect(() => {
    if (!state.isSupported) return;

    const handleControllerChange = () => {
      console.log('[useServiceWorker] Controller changed, reloading...');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [state.isSupported]);

  // Handle messages from service worker
  useEffect(() => {
    if (!state.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SKIP_WAITING') {
        console.log('[useServiceWorker] Received SKIP_WAITING message');
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [state.isSupported]);

  return {
    // State
    registration: state.registration,
    updateAvailable: state.updateAvailable,
    error: state.error,
    isUpdating: state.isUpdating,
    isSupported: state.isSupported,
    isActive: state.isActive,
    isOnline: state.isOnline,
    isOffline: !state.isOnline,
    
    // Methods
    checkForUpdates,
    applyUpdate,
    unregister: unregisterSW,
    updateApp: applyUpdate, // Alias for backward compatibility
  };
}

/**
 * Custom hook to show a toast notification when an update is available
 */
export function useServiceWorkerUpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowNotification(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    applyUpdate().catch(console.error);
    setShowNotification(false);
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  return { showNotification, handleUpdate, dismissNotification };
}
