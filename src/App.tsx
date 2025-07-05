import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load PWA components
const UpdateNotification = lazy(() => import("@/components/UpdateNotification"));
const NetworkStatus = lazy(() => import("@/components/NetworkStatus"));

import { UserMetaProvider } from "@/context/UserMetaContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { AppRoutes } from "./AppRoutes";
import DevDebugPanel from "@/components/debug/DevDebugPanel";
import { diagnostics } from "@/utils/diagnosticService";

// Loading component for Suspense
const PWAComponentsLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-50">
    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
  </div>
);

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

function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // Default to true to avoid hydration mismatch

  // Development environment detection
  const isDev = import.meta.env.MODE === "development";

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
    <ErrorBoundary>
      <UserMetaProvider>
        <BrowserRouter>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <AppRoutes />
              <Toaster />
              <Sonner position="top-right" />
              
              {/* PWA Components */}
              <Suspense fallback={<PWAComponentsLoader />}>
                <UpdateNotification />
                <NetworkStatus />
              </Suspense>
              
              {/* Debug Panel */}
              {process.env.NODE_ENV === 'development' && showDebugPanel && <DevDebugPanel />}
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </UserMetaProvider>
    </ErrorBoundary>
  );
}

export default App;
