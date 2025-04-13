
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthState } from "@/utils/authService";
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

const queryClient = new QueryClient();

const App = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState((prev) => ({
        ...prev,
        user: session?.user || null,
        session,
        isLoading: false,
        error: error?.message || null,
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user || null,
          session,
          isLoading: false,
          error: null,
        });
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/farm-plan" element={<FarmPlan />} />
            <Route path="/predictions" element={<YieldPredictor />} />
            <Route path="/market" element={<Market />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ai-assistant" element={<Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
