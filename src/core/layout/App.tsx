import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { WifiOff } from 'lucide-react';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Scan from './pages/Scan';
import FarmPlan from './pages/FarmPlan';
import YieldPredictor from './pages/YieldPredictor';
import Market from './pages/Market';
import Weather from './pages/Weather';
import Chat from './pages/Chat';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import ManageFields from './pages/ManageFields';
import FarmTestPage from './pages/FarmTestPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DevDebugPanel from '@/components/debug/DevDebugPanel';
import { diagnostics } from '@/utils/diagnosticService';

// Configure React Query with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      meta: {
        onError: (error) => {
          console.error('❌ [Query Error]', error);
          diagnostics.logError(error as Error, { source: 'react-query' });
        },
      },
    },
    mutations: {
      meta: {
        onError: (error) => {
          console.error('❌ [Mutation Error]', error);
          diagnostics.logError(error as Error, {
            source: 'react-query-mutation',
          });
        },
      },
    },
  },
});

// Global unhandled error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('❌ [Unhandled Error]', event.error || event.message);
    diagnostics.logError(event.error || new Error(event.message), {
      source: 'window.error',
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ [Unhandled Promise Rejection]', event.reason);
    diagnostics.logError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
      { source: 'unhandledrejection' }
    );
  });
}

const App = () => {
  // Development environment detection
  const isDev = import.meta.env.MODE === 'development';
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize immediately - no loading screens
  console.log(`✅ [App] CROPGenius initialized (${import.meta.env.MODE} mode)`);

  // Preload critical assets to prevent any loading screens
  useEffect(() => {
    // Remove any loading elements immediately
    const possibleLoaders = document.querySelectorAll(
      '.loading, .loader, .spinner, [aria-busy="true"], [data-loading="true"]'
    );
    possibleLoaders.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
        el.remove();
      }
    });

    // Force root element to be visible
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
      root.style.opacity = '1';
    }
    // Preload essential images and resources
    const preloadResources = () => {
      const preloadLinks = [
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/src/pages/Index.tsx',
        '/src/components/Layout.tsx',
        '/src/components/home/WeatherPreview.tsx',
      ];

      preloadLinks.forEach((link) => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = link.endsWith('.png') ? 'image' : 'script';
        preloadLink.href = link;
        document.head.appendChild(preloadLink);
      });
    };

    preloadResources();

    // Track online/offline status (non-blocking)
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 [App] Network connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🌐 [App] Network connection lost');
      diagnostics.logOperation('network', 'error', {
        error: 'Network connection lost',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    diagnostics.reportComponentMount('App');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // No loading screens - immediate render
  return (
    <ErrorBoundary fallback={<div className="p-4">CropGenius is ready</div>}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppProvider>
              <Toaster />
              <Sonner position="top-center" closeButton />
              <BrowserRouter>
                <ErrorBoundary
                  fallback={<div className="p-4">CropGenius is ready</div>}
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected Routes */}
                    <Route
                      path="/scan"
                      element={
                        <ProtectedRoute>
                          <Scan />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farm-plan"
                      element={
                        <ProtectedRoute>
                          <FarmPlan />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/predictions"
                      element={
                        <ProtectedRoute>
                          <YieldPredictor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/market"
                      element={
                        <ProtectedRoute>
                          <Market />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/weather"
                      element={
                        <ProtectedRoute>
                          <Weather />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ai-assistant"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fields"
                      element={
                        <ProtectedRoute>
                          <Fields />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fields/:id"
                      element={
                        <ProtectedRoute>
                          <FieldDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-fields"
                      element={
                        <ProtectedRoute>
                          <ManageFields />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/test/farms"
                      element={
                        <ProtectedRoute>
                          <FarmTestPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/alerts"
                      element={
                        <ProtectedRoute>
                          <NotFound />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/referrals"
                      element={
                        <ProtectedRoute>
                          <NotFound />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/community"
                      element={
                        <ProtectedRoute>
                          <NotFound />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/challenges"
                      element={
                        <ProtectedRoute>
                          <NotFound />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farm-clans"
                      element={
                        <ProtectedRoute>
                          <NotFound />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>

                {(isDev || localStorage.getItem('DEV_MODE') === 'true') && (
                  <DevDebugPanel />
                )}

                {!isOnline && (
                  <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-lg z-50 flex items-center">
                    <WifiOff className="h-4 w-4 mr-2" />
                    You're offline. Some features may be unavailable.
                  </div>
                )}
              </BrowserRouter>
            </AppProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
