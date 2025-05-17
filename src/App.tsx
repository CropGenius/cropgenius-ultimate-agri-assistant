import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/debug-panel.css";
import { useState, useEffect } from "react";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { WifiOff } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Scan from "./pages/Scan";
import FarmPlan from "./pages/FarmPlan";
import YieldPredictor from "./pages/YieldPredictor";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import Chat from "./pages/Chat";
import Fields from "./pages/Fields";
import FieldDetail from "./pages/FieldDetail";
import ManageFields from "./pages/ManageFields";
import DevDebugPanel from "@/components/debug/DevDebugPanel";
import { diagnostics } from "@/utils/diagnosticService";
import { DebugPanel, logError } from "@/utils/debugPanel";

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
    
    // Log to our surgical debug panel with full details
    logError({
      type: 'global-error',
      severity: 'error',
      message: event.error?.message || event.message || 'Unknown Error',
      details: `File: ${event.filename}\nLine: ${event.lineno}\nColumn: ${event.colno}`,
      stack: event.error?.stack,
      origin: event.filename,
      context: {
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error("❌ [Unhandled Promise Rejection]", event.reason);
    diagnostics.logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { source: 'unhandledrejection' }
    );
    
    // Log to our surgical debug panel with full details
    logError({
      type: 'promise-error',
      severity: event.reason?.name === 'SyntaxError' ? 'critical' : 'error',
      message: event.reason?.message || String(event.reason) || 'Unknown Promise Rejection',
      stack: event.reason?.stack,
      details: typeof event.reason === 'object' ? JSON.stringify(event.reason, null, 2) : String(event.reason),
      context: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });
  });
}

const App = () => {
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

    // Report successful application initialization
    console.log(`✅ [App] CROPGenius initialized (${import.meta.env.MODE} mode)`);
    diagnostics.reportComponentMount('App');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" closeButton />
          <BrowserRouter>
            <ErrorBoundary>
              <div className="content-stable">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/farm-plan" element={<FarmPlan />} />
                  <Route path="/predictions" element={<YieldPredictor />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/ai-assistant" element={<Chat />} />
                  <Route path="/fields" element={<Fields />} />
                  <Route path="/fields/:id" element={<FieldDetail />} />
                  <Route path="/manage-fields" element={<ManageFields />} />
                  <Route path="/alerts" element={<NotFound />} />
                  <Route path="/referrals" element={<NotFound />} />
                  <Route path="/community" element={<NotFound />} />
                  <Route path="/challenges" element={<NotFound />} />
                  <Route path="/farm-clans" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Offline indicator */}
                {!isOnline && (
                  <div className="fixed bottom-20 left-4 bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-lg z-40 flex items-center">
                    <WifiOff className="h-4 w-4 mr-2" />
                    You're offline. Some features may be unavailable.
                  </div>
                )}
              </div>
            </ErrorBoundary>
            
            {/* Debug panels in their own layer to prevent UI interference */}
            <div className="debug-layer fixed">
              {/* Hidden by default - activated with Ctrl+Shift+D shortcut */}
              <DebugPanel />
              
              {/* Development mode debug panel */}
              {(isDev || localStorage.getItem('DEV_MODE') === 'true') && <DevDebugPanel />}
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
