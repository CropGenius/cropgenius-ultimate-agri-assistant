import { useState, useEffect, useCallback, useRef } from 'react';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForServiceWorkerUpdate,
  getServiceWorkerRegistration,
  checkServiceWorkerSupport,
  type ServiceWorkerConfig
} from '@/utils/sw-utils';

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
  isUpdating: boolean;
  isSupported: boolean;
  isActive: boolean;
}

interface ServiceWorkerHook {
  isOnline: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  updateApp: () => void;
  state: ServiceWorkerState;
  error: Error | null;
}

export function useServiceWorker(): ServiceWorkerHook {
  const [state, setState] = useState<ServiceWorkerState>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return;
    
    try {
      updateState({ error: null });
      await state.registration.update();
      console.log('[useServiceWorker] Update check completed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useServiceWorker] Update check failed:', error);
      updateState({ error });
    }
  }, [state.registration, updateState]);

  // Skip waiting and reload the page to apply the update
  const applyUpdate = useCallback(async () => {
    if (!state.registration?.waiting) return;

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
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useServiceWorker] Failed to apply update:', error);
      updateState({ error, isUpdating: false });
    }
  }, [state.registration, updateState]);

  // Setup service worker event listeners
  useEffect(() => {
    if (!state.isSupported) {
      console.warn('[useServiceWorker] Service workers are not supported in this browser');
      return;
    }

    let isMounted = true;
    const controllerChangeHandlers: (() => void)[] = [];

    // Handle controller change
    const handleControllerChange = () => {
      console.log('[useServiceWorker] Controller changed, reloading...');
      window.location.reload();
    };

    // Handle message from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SKIP_WAITING') {
        console.log('[useServiceWorker] Received SKIP_WAITING message');
        handleControllerChange();
      }
    };

    // Set up periodic update checks (every 1 hour)
    const setupUpdateChecks = () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      
      updateInterval.current = window.setInterval(() => {
        checkForUpdates();
      }, 60 * 60 * 1000);
    };

    // Register service worker and set up event listeners
    const setupServiceWorker = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[useServiceWorker] Skipping registration in development mode');
          return;
        }

        const isSWRegistered = await isRegistered();
        
            updateState({
              registration: reg,
              isActive: true,
              error: null,
            });
            config.onSuccess?.(reg);
          },
          onUpdate: (reg) => {
            if (!isMounted.current) return;
            console.log('[useServiceWorker] Service worker update available');
            updateState({
              registration: reg,
              updateAvailable: true,
              error: null,
            });
            config.onUpdate?.(reg);
          },
          onError: (error) => {
            if (!isMounted.current) return;
            console.error('[useServiceWorker] Service worker error:', error);
            updateState({ error });
            config.onError?.(error);
          },
        });

        // Set up periodic update checks (every 1 hour)
        updateInterval.current = window.setInterval(() => {
          checkForUpdates();
        }, 60 * 60 * 1000);

        return registration;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[useServiceWorker] Failed to register service worker:', err);
        updateState({ error: err });
      }
    };

    registerSW();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [state.isSupported, config, updateState, checkForUpdates]);

  return {
    // State
    registration: state.registration,
    updateAvailable: state.updateAvailable,
    error: state.error,
    isUpdating: state.isUpdating,
    isSupported: state.isSupported,
    isActive: state.isActive,
    isInstalling: state.isInstalling,
    isWaiting: state.isWaiting,
    
    // Methods
    checkForUpdates,
    applyUpdate,
    
    // Unregister function if needed
    unregister: async () => {
      try {
        const success = await unregister();
        if (success) {
          updateState({
            registration: null,
            updateAvailable: false,
            isActive: false,
            isWaiting: false,
          });
        }
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        updateState({ error });
        return false;
      }
    },
  };
}

// Custom hook to show a toast notification when an update is available
export function useUpdateNotification() {
  const { isUpdateAvailable, applyUpdate } = useServiceWorker();
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isUpdateAvailable]);
  
  const handleUpdate = () => {
    updateApp();
    setShowNotification(false);
  };
  
  const dismissNotification = () => {
    setShowNotification(false);
  };
  
  return {
    showNotification,
    handleUpdate,
    dismissNotification
  };
}
