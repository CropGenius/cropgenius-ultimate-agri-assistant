
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Scan from "./pages/Scan";
import FarmPlan from "./pages/FarmPlan";
import YieldPredictor from "./pages/YieldPredictor";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
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

export default App;
