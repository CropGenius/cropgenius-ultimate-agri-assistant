import { createRoot } from 'react-dom/client';
import React, { StrictMode, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { GrowthEngineProvider } from './providers/GrowthEngineProvider';
import { initAnalytics } from './analytics';

// Create a single instance of QueryClient for the entire application.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // Retry failed requests once
    },
  },
});

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
