import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './features/auth/context/AuthContext';
import Dashboard from './pages/MissionControlPage'; // Renamed to Dashboard for consistency in routes
import FieldDetailPage from './pages/FieldDetail';
import FarmPlanningPage from './pages/FarmPlanningPage';
import MarketInsightsPage from './pages/MarketInsightsPage';

// A component to handle the main app layout could be introduced here
const AppLayout = () => {
    // This could wrap around the main content pages, containing navbars, sidebars etc.
    return (
        <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/field/:fieldId" element={<ProtectedRoute><FieldDetailPage /></ProtectedRoute>} />
            <Route path="/farm-plan" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    )
}

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
      return <div>Loading application...</div> // Or a splash screen
  }

  return (
      <Routes>
        {/* If user is logged in, redirect from /auth to dashboard */}
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        
        {/* All other routes are handled by the AppLayout, which includes protection */}
        <Route path="*" element={<AppLayout />} />
      </Routes>
  );
};
