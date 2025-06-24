interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  serviceWorkerUrl?: string;
  scope?: string;
  debug?: boolean;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  const {
    onSuccess,
    onUpdate,
    onError,
    serviceWorkerUrl = '/service-worker.js',
    scope = '/',
    debug = process.env.NODE_ENV === 'development'
  } = config;

  if (!('serviceWorker' in navigator)) {
    const error = new Error('Service workers are not supported');
    onError?.(error);
    throw error;
  }

  if (!window.isSecureContext && !isLocalhost) {
    const error = new Error('Service workers require HTTPS (or localhost)');
    onError?.(error);
    throw error;
  }

  try {
    if (debug) console.log('[ServiceWorker] Registering service worker...');
    
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl, { scope });
    
    if (debug) {
      console.log('[ServiceWorker] Registration successful with scope: ', registration.scope);
    }

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      if (debug) console.log('[ServiceWorker] New service worker found');

      newWorker.addEventListener('statechange', () => {
        if (debug) console.log(`[ServiceWorker] New worker state: ${newWorker.state}`);
        
        switch (newWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              // New update available
              if (debug) console.log('[ServiceWorker] New content available');
              onUpdate?.(registration);
            } else {
              // First installation
              if (debug) console.log('[ServiceWorker] Content is cached for offline use');
              onSuccess?.(registration);
            }
            break;
            
          case 'redundant':
            const error = new Error('Service worker became redundant');
            if (debug) console.error('[ServiceWorker] Service worker redundant:', error);
            onError?.(error);
            break;
        }
      });
    });

    // Check for updates every hour
    const updateInterval = setInterval(async () => {
      try {
        await registration.update();
        if (debug) console.log('[ServiceWorker] Update check completed');
      } catch (err) {
        if (debug) console.warn('[ServiceWorker] Update check failed:', err);
      }
    }, 60 * 60 * 1000);

    // Cleanup interval on unload
    window.addEventListener('beforeunload', () => clearInterval(updateInterval));

    return registration;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[ServiceWorker] Registration failed:', err);
    onError?.(err);
    throw err;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}

export async function isServiceWorkerRegistered(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.length > 0;
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return undefined;
  }
}

export function checkServiceWorkerSupport(): boolean {
  return 'serviceWorker' in navigator && 'serviceWorker' in window;
}
