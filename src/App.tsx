
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { FieldBrainProvider } from './components/fieldbrain/FieldBrainProvider';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Fields from './pages/Fields';
import ManageFields from './pages/ManageFields';
import FieldDetail from './pages/FieldDetail';
import Weather from './pages/Weather';
import YieldPredictor from './pages/YieldPredictor';
import FarmPlan from './pages/FarmPlan';
import Market from './pages/Market';
import Chat from './pages/Chat';
import Scan from './pages/Scan';
import Community from './pages/Community';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FieldBrainProvider>
            <ErrorBoundary>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
                  <Route path="/fields/manage" element={<ProtectedRoute><ManageFields /></ProtectedRoute>} />
                  <Route path="/fields/:id" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} />
                  <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                  <Route path="/yield" element={<ProtectedRoute><YieldPredictor /></ProtectedRoute>} />
                  <Route path="/plan" element={<ProtectedRoute><FarmPlan /></ProtectedRoute>} />
                  <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              
              <Toaster richColors position="top-center" />
            </ErrorBoundary>
          </FieldBrainProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
