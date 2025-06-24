interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function checkServiceWorkerSupport(): boolean {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  const { onSuccess, onUpdate, onError, debug = false } = config;

  if (!checkServiceWorkerSupport()) {
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
    
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    
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
        
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            if (debug) console.log('[ServiceWorker] New content available');
            onUpdate?.(registration);
          } else {
            // First installation
            if (debug) console.log('[ServiceWorker] Content is cached for offline use');
            onSuccess?.(registration);
          }
        } else if (newWorker.state === 'redundant') {
          const error = new Error('Service worker became redundant');
          if (debug) console.error('[ServiceWorker] Service worker redundant:', error);
          onError?.(error);
        }
      });
    });

    return registration;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[ServiceWorker] Registration failed:', err);
    onError?.(err);
    throw err;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!checkServiceWorkerSupport()) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}

export async function checkForServiceWorkerUpdate(): Promise<ServiceWorkerRegistration | null> {
  if (!checkServiceWorkerSupport()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    // The update() method returns void, so we'll return the registration instead
    await registration.update();
    return registration;
  } catch (error) {
    console.error('Failed to check for service worker update:', error);
    return null;
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!checkServiceWorkerSupport()) return null;
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
}
