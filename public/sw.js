// CropGenius Service Worker - Advanced Offline-First Strategy
const CACHE_NAME = 'cropgenius-cache-v2';
const RUNTIME_CACHE = 'cropgenius-runtime-v1';
const OFFLINE_URL = '/offline.html';

// Cacheable content types
const CACHEABLE_TYPES = [
  'script',
  'style',
  'document',
  'image',
  'font',
  'manifest',
  'json'
];

// Core assets to cache on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/register-sw.js',
  '/src/main.tsx',
  // Add other core assets here
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  // Cache core assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old caches that don't match the current version
            return cacheName.startsWith('cropgenius-') && 
                  cacheName !== CACHE_NAME && 
                  cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') ||
      !(event.request.url.startsWith('http') || event.request.url.startsWith('https'))) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  
  // Handle API requests with network-first strategy
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (CACHEABLE_TYPES.some(type => event.request.destination === type)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // For all other requests, try network first, then cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the response is good, clone it and store it in the cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If both network and cache fail, show offline page
        return caches.match(OFFLINE_URL);
      })
  );
});

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    // Try to fetch from network first
    const networkResponse = await fetch(request);
    
    // If successful, update the cache and return the response
    if (networkResponse && networkResponse.status === 200) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return a generic error response
    return new Response(JSON.stringify({ error: 'You are offline and no cached data is available.' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // If we have a cached response, update it in the background
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  return fetchAndCache(request, cache);
}

// Helper function to fetch and cache a request
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If fetch fails and we're offline, return the offline page for document requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // For other requests, return a generic error response
    return new Response('You are offline and the requested resource is not available in the cache.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    console.log('[Service Worker] Background sync for failed requests');
    // Implement your background sync logic here
  }
});
