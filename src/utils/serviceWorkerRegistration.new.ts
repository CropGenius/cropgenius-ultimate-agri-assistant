export interface ServiceWorkerConfig {
  /**
   * Called when the service worker has been successfully registered
   */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  
  /**
   * Called when a new service worker is waiting to be activated
   */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  
  /**
   * Called when there's an error during service worker registration
   */
  onError?: (error: Error) => void;
  
  /**
   * The URL of the service worker file (default: '/service-worker.js')
   */
  serviceWorkerUrl?: string;
  
  /**
   * The scope for the service worker (default: '/')
   */
  scope?: string;
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Register a service worker with the specified configuration
 */
export async function register(config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null> {
  const {
    onSuccess,
    onUpdate,
    onError,
    serviceWorkerUrl = '/service-worker.js',
    scope = '/',
    debug = false
  } = config || {};
  
  if (!('serviceWorker' in navigator)) {
    const error = new Error('Service workers are not supported in this browser');
    onError?.(error);
    throw error;
  }
  
  if (!window.isSecureContext) {
    const error = new Error('Service workers require HTTPS (or localhost)');
    onError?.(error);
    throw error;
  }
  
  try {
    if (debug) {
      console.log('[ServiceWorker] Registering service worker...', { serviceWorkerUrl, scope });
    }
    
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl, { scope });
    
    if (debug) {
      console.log('[ServiceWorker] Registration successful with scope: ', registration.scope);
    }
    
    // Track the installing service worker
    if (registration.installing) {
      if (debug) {
        console.log('[ServiceWorker] Installing new service worker...');
      }
      
      registration.installing.addEventListener('statechange', (event) => {
        if (event.target instanceof ServiceWorker) {
          if (debug) {
            console.log(`[ServiceWorker] State changed to: ${event.target.state}`);
          }
          
          if (event.target.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, inform the app
              if (debug) {
                console.log('[ServiceWorker] New content is available; please refresh.');
              }
              onUpdate?.(registration);
            } else {
              // Content is now cached for offline use
              if (debug) {
                console.log('[ServiceWorker] Content is now available offline');
              }
              onSuccess?.(registration);
            }
          } else if (event.target.state === 'redundant') {
            const error = new Error('Service worker became redundant');
            if (debug) {
              console.error('[ServiceWorker] Service worker became redundant', error);
            }
            onError?.(error);
          }
        }
      });
    }
    
    // Check for updates every hour
    setInterval(() => {
      registration.update().catch(err => {
        if (debug) {
          console.warn('[ServiceWorker] Update check failed:', err);
        }
      });
    }, 60 * 60 * 1000);
    
    return registration;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (debug) {
      console.error('[ServiceWorker] Registration failed:', err);
    }
    onError?.(err);
    throw err;
  }
}

/**
 * Unregister the service worker
 */
export async function unregister(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}

/**
 * Check if a service worker is registered
 */
export async function isRegistered(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.length > 0;
}

/**
 * Get the current service worker registration
 */
export async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    return undefined;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return undefined;
  }
}
