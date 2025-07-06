import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import './styles/glassmorphism.css';
import './styles/glass-empire.css';
import './styles/force-glass.css';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { GrowthEngineProvider } from './providers/GrowthEngineProvider';
import { initAnalytics } from './analytics';
import { register } from './utils/serviceWorkerRegistration';
import { handleError } from './utils/errorHandler';
import { env } from './config/environment';

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
      if (import.meta.env.DEV) {
        console.log('[Service Worker] Registered');
      }
      
      // Check for updates every hour
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);
    },
    onUpdate: (registration) => {
      // Dispatch update event silently
      window.dispatchEvent(new CustomEvent('serviceWorkerUpdate', { 
        detail: { registration } 
      }));
    },
    onError: (error) => {
      // Silent in production, only log in development
      if (import.meta.env.DEV) {
        console.error('[Service Worker] Registration failed:', error);
      }
    },
  });
};

// Only register service worker in production with proper checks
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
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

// Global error handling
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    handleError(event.error || new Error(event.message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    event.preventDefault();
  });
}

// Initialize analytics silently
try {
  initAnalytics();
} catch (error) {
  handleError(error as Error, { source: 'analytics' });
}

// Log environment status in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    features: env.features,
    supabaseConfigured: !!(env.supabase.url && env.supabase.anonKey)
  });
  console.log('🚀 ALL FEATURES ENABLED FOR 100M AFRICAN FARMERS!');
}
