
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
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

const queryClient = new QueryClient();

const App = () => {
  // Development environment detection
  const isDev = import.meta.env.MODE === "development";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner position="top-center" closeButton />
          <BrowserRouter>
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
            
            {isDev && <DevDebugPanel />}
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
