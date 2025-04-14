
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
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
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Fields from "./pages/Fields";
import FieldDetail from "./pages/FieldDetail";
import ManageFields from "./pages/ManageFields";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DevDebugPanel from "@/components/debug/DevDebugPanel";
import { diagnostics } from "@/utils/diagnosticService";

// Configure React Query with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error("❌ [Query Error]", error);
        diagnostics.logError(error as Error, { source: 'react-query' });
      }
    },
    mutations: {
      onError: (error) => {
        console.error("❌ [Mutation Error]", error);
        diagnostics.logError(error as Error, { source: 'react-query-mutation' });
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
          <AuthProvider>
            <Toaster />
            <Sonner position="top-center" closeButton />
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Protected Routes */}
                  <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
                  <Route path="/farm-plan" element={<ProtectedRoute><FarmPlan /></ProtectedRoute>} />
                  <Route path="/predictions" element={<ProtectedRoute><YieldPredictor /></ProtectedRoute>} />
                  <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                  <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
                  <Route path="/fields/:id" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} />
                  <Route path="/manage-fields" element={<ProtectedRoute><ManageFields /></ProtectedRoute>} />
                  <Route path="/alerts" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                  <Route path="/referrals" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                  <Route path="/challenges" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                  <Route path="/farm-clans" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              
              {(isDev || localStorage.getItem('DEV_MODE') === 'true') && <DevDebugPanel />}
              
              {!isOnline && (
                <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-lg z-50 flex items-center">
                  <WifiOff className="h-4 w-4 mr-2" />
                  You're offline. Some features may be unavailable.
                </div>
              )}
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
