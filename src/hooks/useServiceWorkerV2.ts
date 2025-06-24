import { useState, useEffect, useCallback, useRef } from 'react';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForServiceWorkerUpdate,
  getServiceWorkerRegistration,
  checkServiceWorkerSupport,
  type ServiceWorkerConfig
} from '@/utils/sw-utils';

/**
 * Service Worker Hook State
 */
interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
  isUpdating: boolean;
  isSupported: boolean;
  isActive: boolean;
  isOnline: boolean;
}

/**
 * Hook Return Type
 */
interface ServiceWorkerHookReturn extends Omit<ServiceWorkerState, 'error'> {
  error: Error | null;
  checkForUpdates: () => Promise<ServiceWorkerRegistration | null>;
  applyUpdate: () => Promise<void>;
  unregister: () => Promise<boolean>;
}

/**
 * Custom hook to manage service worker registration, updates, and lifecycle
 */
export function useServiceWorker(config: ServiceWorkerConfig = {}): ServiceWorkerHookReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    updateAvailable: false,
    error: null,
    isUpdating: false,
    isSupported: checkServiceWorkerSupport(),
    isActive: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const updateInterval = useRef<number>();
  const isMounted = useRef(true);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

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
      const registration = await checkForServiceWorkerUpdate();
      
      if (registration) {
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
  }, [state.isSupported, updateState]);

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
  const unregister = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    
    try {
      const result = await unregisterServiceWorker();
      if (result) {
        updateState({
          registration: null,
          updateAvailable: false,
          isActive: false,
          isUpdating: false,
        });
      }
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useServiceWorker] Failed to unregister service worker:', err);
      updateState({ error: err });
      throw err;
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

    const registerSW = async () => {
      try {
        const registration = await registerServiceWorker({
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

        if (registration) {
          // Set up periodic update checks (every 1 hour)
          updateInterval.current = window.setInterval(() => {
            checkForUpdates().catch(console.error);
          }, 60 * 60 * 1000);
        }

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
    
    // Methods
    checkForUpdates,
    applyUpdate,
    unregister,
  };
}

/**
 * Custom hook to show a toast notification when an update is available
 */
export function useServiceWorkerUpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  
  useEffect(() => {
    if (updateAvailable) {
      // You can integrate with your notification system here
      const shouldUpdate = window.confirm('A new version is available. Would you like to update now?');
      if (shouldUpdate) {
        applyUpdate().catch(console.error);
      }
    }
  }, [updateAvailable, applyUpdate]);
}

// Export default for backward compatibility
const useSW = useServiceWorker;
export default useSW;
