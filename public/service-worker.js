// Service Worker
const CACHE_NAME = 'cropgenius-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
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
  } else if (urlsToCache.includes(new URL(event.request.url).pathname) || event.request.destination) {
    // For other requests (assets, etc.), use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // console.log('[Service Worker] Found in cache:', event.request.url);
            return response;
          }
          // console.log('[Service Worker] Not in cache, fetching:', event.request.url);
          return fetch(event.request).then(networkResponse => {
            // Optionally cache new assets dynamically if needed
            // Be careful with caching opaque responses (e.g., from CDNs without CORS)
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
        .catch(err => {
          console.error('[Service Worker] Fetch failed:', err, event.request.url);
          // You could return a fallback image/resource here if appropriate
        })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
