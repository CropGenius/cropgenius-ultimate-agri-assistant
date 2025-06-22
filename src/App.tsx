import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import { UserMetaProvider } from "@/context/UserMetaContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { WifiOff } from "lucide-react";
import { AppRoutes } from "./AppRoutes";
import DevDebugPanel from "@/components/debug/DevDebugPanel";
import { diagnostics } from "@/utils/diagnosticService";

// Configure React Query with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      meta: {
        onError: (error) => {
          console.error("❌ [Query Error]", error);
          diagnostics.logError(error as Error, { source: 'react-query' });
        }
      }
    },
    mutations: {
      meta: {
        onError: (error) => {
          console.error("❌ [Mutation Error]", error);
          diagnostics.logError(error as Error, { source: 'react-query-mutation' });
        }
      }
    }
  }
});

// Global unhandled error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error("❌ [Unhandled Error]", event.error || event.message);
    diagnostics.logError(
      event.error || new Error(event.message), 
      { source: 'window.error', lineno: event.lineno, colno: event.colno }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error("❌ [Unhandled Promise Rejection]", event.reason);
    diagnostics.logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { source: 'unhandledrejection' }
    );
  });
}

const App = () => {
  // Development environment detection
  const isDev = import.meta.env.MODE === "development";
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🌐 [App] Network connection restored");
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("🌐 [App] Network connection lost");
      diagnostics.logOperation('network', 'error', { error: 'Network connection lost' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="text-red-500 p-4">Something went wrong.</div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserMetaProvider>
            <Toaster />
            <Sonner position="top-center" closeButton />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </UserMetaProvider>
        </TooltipProvider>
      </QueryClientProvider>
      {(isDev || localStorage.getItem('DEV_MODE') === 'true') && <DevDebugPanel />}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-lg z-50 flex items-center">
          <WifiOff className="h-4 w-4 mr-2" />
          <span>You're offline. Some features may be unavailable.</span>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;
