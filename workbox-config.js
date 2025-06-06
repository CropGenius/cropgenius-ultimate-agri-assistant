// workbox-config.js - Service Worker Configuration for CropGenius

module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf,otf,ico,json}',
  ],
  swDest: 'dist/service-worker.js',
  // Don't allow the service worker to cache the following URLs
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^gclid$/, /^ref$/],
  skipWaiting: true,
  clientsClaim: true,
  // Define runtime caching rules
  runtimeCaching: [
    // Cache API responses from OpenWeatherMap
    {
      urlPattern: new RegExp('https://api\\.openweathermap\\.org/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'openweathermap-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    // Cache API responses from Supabase
    {
      urlPattern: /.*\.supabase\.co\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    // Cache map tiles and assets
    {
      urlPattern: /.*mapbox\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'mapbox-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Cache images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache other static assets (JS, CSS)
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
    // Offline fallback
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkOnly',
      options: {
        plugins: [
          {
            handlerDidError: async ({ request }) => {
              return caches.match('/offline.html');
            },
          },
        ],
      },
    },
  ],
  // Don't precache these files
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^source$/],
  // Don't allow the service worker to cache the following URLs
  navigateFallback: '/offline.html',
  navigateFallbackDenylist: [
    // Avoid intercepting API calls
    new RegExp('/api/.*'),
    // Avoid intercepting admin routes
    new RegExp('/admin/.*'),
  ],
};
