// Service Worker Registration with enhanced error handling and type safety

// Export the interface first
export interface ServiceWorkerConfig {
  /** Callback when service worker is successfully registered */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when a new service worker is waiting to be activated */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when an error occurs during registration */
  onError?: (error: Error) => void;
  /** Service worker script URL (defaults to '/sw.js') */
  serviceWorkerUrl?: string;
  /** Service worker scope (defaults to '/')
   * @default {scope: '/'}
   */
  scope?: string;
  /** Enable debug logging */
  debug?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ServiceWorkerConfig = {
  serviceWorkerUrl: '/sw.js',
  scope: '/',
  debug: process.env.NODE_ENV === 'development',
};

// Logging helper
const logger = (config: ServiceWorkerConfig) => ({
  log: (...args: any[]) => config.debug && console.log('[Service Worker]', ...args),
  warn: (...args: any[]) => console.warn('[Service Worker]', ...args),
  error: (...args: any[]) => console.error('[Service Worker]', ...args),
});

/**
 * Check if service workers are supported in the current browser
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator && 
         'serviceWorker' in window && 
         window.isSecureContext && // Service workers must be served over HTTPS or localhost
         (window.location.hostname === 'localhost' || !window.location.protocol.startsWith('http:'));
}

/**
 * Register a service worker with the given configuration
 */
export function register(userConfig: ServiceWorkerConfig = {}): void {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const log = logger(config);

  // Early return if service workers aren't supported
  if (!isServiceWorkerSupported()) {
    const error = new Error(
      'Service workers are not supported in this browser or context. ' +
      'This might be because the page is not served over HTTPS or is running in a private/incognito window.'
    );
    config.onError?.(error);
    log.error(error.message);
    return;
  }

  // Don't register in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !config.debug) {
    log.log('Service worker registration is disabled in development mode');
    return;
  }

  const publicUrl = new URL(process.env.PUBLIC_URL || '/', window.location.href);
  
  // Don't register service worker on non-HTTPS or localhost in production
  if (publicUrl.origin !== window.location.origin) {
    const error = new Error(
      'Service worker can only be registered on the same origin as the app. ' +
      `Public URL (${publicUrl.origin}) does not match app origin (${window.location.origin})`
    );
    config.onError?.(error);
    log.error(error.message);
    return;
  }

  const registerWhenReady = () => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      registerSW(config, log);
    } else {
      window.addEventListener('load', () => registerSW(config, log));
    }
  };

  // Start registration
  registerWhenReady();
}

/**
 * Internal function to handle the actual service worker registration
 */
async function registerSW(config: ServiceWorkerConfig, log: ReturnType<typeof logger>): Promise<() => void> {
  try {
    const swUrl = new URL(config.serviceWorkerUrl!, window.location.origin).href;
    log.log(`Registering service worker at: ${swUrl}`);

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: config.scope,
    });

    // Registration successful
    log.log('ServiceWorker registration successful with scope: ', registration.scope);
    config.onSuccess?.(registration);

    // Handle updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) {
        log.warn('No installing worker found in onupdatefound');
        return;
      }

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available; refresh needed
            log.log('New service worker installed. Waiting to activate...');
            config.onUpdate?.(registration);
          } else {
            // First-time load, content is now cached
            log.log('Content is now available offline!');
            config.onSuccess?.(registration);
          }
        } else if (installingWorker.state === 'redundant') {
          log.warn('Service worker became redundant');
        }
      };
    };

    // Handle errors in the service worker
    const handleServiceWorkerError = (event: Event) => {
      let error: Error;
      
      if (event instanceof ErrorEvent) {
        error = new Error(`ServiceWorker error: ${event.message || 'Unknown error'}`);
      } else if (event instanceof PromiseRejectionEvent) {
        const reason = event.reason || 'Unknown rejection';
        error = reason instanceof Error 
          ? reason 
          : new Error(`ServiceWorker promise rejection: ${String(reason)}`);
      } else {
        error = new Error(`ServiceWorker error: ${event.type || 'Unknown error'}`);
      }
      
      log.error('ServiceWorker error:', error);
    
    log.error('ServiceWorker error:', error);
    config.onError?.(error);
  };
  
  // Add error event listener
  navigator.serviceWorker.addEventListener('error', handleServiceWorkerError);
  
  // Cleanup function
  const cleanup = () => {
    navigator.serviceWorker.removeEventListener('error', handleServiceWorkerError);
  };
  
  return cleanup;
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (config.debug) {
      console.error('[ServiceWorker] Registration failed:', err);
    }
    config.onError?.(err);
    throw err;
}
}

/**
 * Unregister the service worker
 */
export const unregister = async (): Promise<boolean> => {
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
};

/**
 * Check if a service worker is registered
 */
export const isRegistered = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length > 0;
  } catch (error) {
    console.error('Failed to check service worker registration:', error);
    return false;
  }
};

/**
 * Get the current service worker registration
 */
export const getRegistration = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (!('serviceWorker' in navigator)) {
    return undefined;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return undefined;
  }
};

// Export all functions
export const serviceWorker = {
  register,
  unregister,
  isRegistered,
  getRegistration,
  isServiceWorkerSupported
};

export default serviceWorker;
