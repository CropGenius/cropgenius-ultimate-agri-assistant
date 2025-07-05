import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import './styles/glassmorphism.css';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { GrowthEngineProvider } from './providers/GrowthEngineProvider';
import { initAnalytics } from './analytics';
import { register } from './utils/serviceWorkerRegistration';

// Create a single instance of QueryClient for the entire application.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Disable refetch on window focus for better offline experience
      retryDelay: 3000, // Delay between retries
    },
  },
});

// Enhanced service worker registration with better error handling and update management
const registerServiceWorker = () => {
  register({
    serviceWorkerUrl: '/sw.js',
    debug: process.env.NODE_ENV === 'development',
    onSuccess: (registration) => {
      console.log('[Service Worker] Registered with scope:', registration.scope);
      
      // Check for updates every hour
      setInterval(() => {
        registration.update().catch(err => {
          console.warn('[Service Worker] Update check failed:', err);
        });
      }, 60 * 60 * 1000);
    },
    onUpdate: (registration) => {
      console.log('[Service Worker] New content available; waiting to update.');
      
      // Dispatch a custom event that our UpdateNotification component can listen for
      window.dispatchEvent(new CustomEvent('serviceWorkerUpdate', { 
        detail: { registration } 
      }));
    },
    onError: (error) => {
      console.error('[Service Worker] Registration failed:', error);
      
      // If we're in development, log additional debugging info
      if (process.env.NODE_ENV === 'development') {
        console.warn('Service worker registration error details:', {
          location: window.location.href,
          secureContext: window.isSecureContext,
          serviceWorker: 'serviceWorker' in navigator,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
        });
      }
    },
  });
};

// Register service worker when the app loads in production
if (process.env.NODE_ENV === 'production') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Loading has already finished, register immediately
    registerServiceWorker();
  } else {
    // Wait for the window to load before registering
    window.addEventListener('load', registerServiceWorker);
  }
} else {
  console.log('[Service Worker] Service worker registration is disabled in development mode');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Fatal Error: Root element with id 'root' not found in document.");
}

const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  // eslint-disable-next-line react/display-name
  : () => null;

const root = createRoot(rootElement);

// Render the application with all necessary providers.
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GrowthEngineProvider>
          <App />
        </GrowthEngineProvider>
        <Toaster />
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

// Service worker registration is now handled by Vite PWA plugin

initAnalytics();
