import { useState, useEffect, useCallback, useRef } from 'react';
import { register, unregister, isRegistered, getRegistration } from '@/utils/serviceWorkerRegistration';

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
  isUpdating: boolean;
  isSupported: boolean;
  isActive: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
}

/**
 * A comprehensive hook for managing service worker registration, updates, and lifecycle events
 * with full TypeScript support and offline capabilities.
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    updateAvailable: false,
    error: null,
    isUpdating: false,
    isSupported: 'serviceWorker' in navigator,
    isActive: false,
    isInstalling: false,
    isWaiting: false,
  });

  const updateInterval = useRef<number>();

  // Update state helper
  const updateState = useCallback((updates: Partial<ServiceWorkerState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
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

  // Setup service worker event listeners and registration
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
        
        if (!isSWRegistered) {
          console.log('[useServiceWorker] Registering service worker...');
          
          await register({
            onSuccess: (reg) => {
              if (!isMounted) return;
              console.log('[useServiceWorker] Registration successful');
              updateState({
                registration: reg,
                isActive: true,
                error: null,
              });
              setupUpdateChecks();
            },
            onUpdate: (reg) => {
              if (!isMounted) return;
              console.log('[useServiceWorker] Update available');
              updateState({
                registration: reg,
                updateAvailable: true,
                isWaiting: !!reg.waiting,
                error: null,
              });
            },
            onError: (error) => {
              if (!isMounted) return;
              console.error('[useServiceWorker] Registration error:', error);
              updateState({ error });
            },
          });
        } else {
          console.log('[useServiceWorker] Service worker already registered');
          const reg = await getRegistration();
          if (reg && isMounted) {
            updateState({
              registration: reg,
              isActive: !!reg.active,
              isWaiting: !!reg.waiting,
              updateAvailable: !!reg.waiting,
            });
            setupUpdateChecks();
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[useServiceWorker] Setup error:', error);
        if (isMounted) {
          updateState({ error });
        }
      }
    };

    // Add event listeners
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    // Initial setup
    setupServiceWorker();

    // Cleanup function
    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      controllerChangeHandlers.forEach(cleanup => cleanup());
      
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [checkForUpdates, state.isSupported, updateState]);

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

/**
 * A simple hook that returns whether an update is available and provides a function to apply it
 */
export function useUpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    if (updateAvailable) {
      setShowNotification(true);
    }
  }, [updateAvailable]);
  
  const handleUpdate = useCallback(() => {
    applyUpdate();
    setShowNotification(false);
  }, [applyUpdate]);
  
  return {
    showUpdateNotification: showNotification,
    onUpdate: handleUpdate,
    onDismiss: () => setShowNotification(false),
  };
}
