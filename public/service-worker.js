// CropGenius Offline-First Service Worker

const CACHE_NAME = 'cropgenius-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMG = '/offline-placeholder.png';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/offline-placeholder.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
  '/index.css',
  '/index.js',
  '/assets/logo.svg',
  // Add more critical files here
];

// Install event - Precache critical resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Sync failed requests when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'cropgenius-sync') {
    console.log('[ServiceWorker] Syncing background data');
    event.waitUntil(syncData());
  }
});

// Store IndexedDB data in periodic intervals
const syncData = async () => {
  const dbPromise = indexedDB.open('cropgenius-offline', 1);
  // Logic to sync stored data with Supabase when back online
  // Including pending weather updates, crop scans, yield predictions, etc.

  // Get any queued API requests
  const db = await dbPromise;
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');

  const requests = await store.getAll();

  // Process each request
  for (const request of requests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: 'include',
      });

      // If successful, remove from outbox
      await store.delete(request.id);
    } catch (error) {
      console.error('[ServiceWorker] Failed to replay request', error);
      // Keep in outbox to try again
    }
  }

  await tx.complete;
};

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API handling strategy - different from asset strategy
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase') ||
    event.request.url.includes('openweathermap') ||
    event.request.url.includes('googleapis')
  ) {
    // For API requests, try network first, then cache as fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache valid responses for offline use
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If no cache, store request in outbox
            if (navigator.serviceWorker.controller) {
              storeRequestInOutbox(event.request.clone());
            }

            // Return offline placeholder for images
            if (event.request.destination === 'image') {
              return caches.match(OFFLINE_IMG);
            }

            // Return offline page for navigation
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            // Return empty response for other resources
            return new Response(
              JSON.stringify({
                error: 'Network offline',
                offline: true,
                success: false,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
  } else {
    // For non-API requests (assets, pages), use cache-first strategy
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Cache valid responses
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // If offline and no cache, return offline placeholders
            if (event.request.destination === 'image') {
              return caches.match(OFFLINE_IMG);
            }

            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            // Return empty response for other resources
            return new Response('', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
    );
  }
});

// Function to store failed requests in IndexedDB for later sync
const storeRequestInOutbox = async (request) => {
  try {
    const serialized = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const dbPromise = indexedDB.open('cropgenius-offline', 1);
    dbPromise.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id' });
      }
    };

    const db = await dbPromise;
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    await store.add(serialized);
    await tx.complete;

    // Register for sync when online
    await self.registration.sync.register('cropgenius-sync');
  } catch (error) {
    console.error('[ServiceWorker] Failed to store request', error);
  }
};
