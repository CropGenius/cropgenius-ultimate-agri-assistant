// Service Worker
const CACHE_NAME = 'cropgenius-cache-v1';
const CACHE_NAME = 'cropgenius-cache-v2';  // Updated cache name to force refresh
const urlsToCache = [
  '/',
  '/index.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other assets like CSS, JS, images that you want to cache
  // Be careful with versioned assets if their names change frequently
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event fired');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Cache addAll failed:', err);
      })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event fired');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Become available to all pages
});

self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetch event for:', event.request.url);
  if (event.request.mode === 'navigate') {
    // For navigation requests, try network first, then cache, then fallback to /index.html
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .catch(() => caches.match('/index.html'))
    );
  } else {
    // For all other requests, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response for caching
              const responseToCache = networkResponse.clone();
              
              // Cache successful responses
              if (networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              
              return networkResponse;
            })
            .catch(err => {
              console.error('[Service Worker] Fetch failed:', err, event.request.url);
              // Return fallback for image requests
              if (event.request.destination === 'image') {
                return caches.match('/icons/icon-192x192.png');
              }
            });
        })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
