import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './features/auth/context/AuthContext';
import Home from './pages/Home';
import FieldDetailPage from './pages/FieldDetail';
import FarmPlanningPage from './pages/FarmPlanningPage';
import MarketInsightsPage from './pages/MarketInsightsPage';

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">Loading application...</div>;
  }

  return (
    <Routes>
      {/* AUTHENTICATION */}
      {/* If the user is logged in, navigating to /auth will redirect to the homepage. */}
      {/* Otherwise, it will show the authentication page. */}
      <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />

      {/* CORE APP - PROTECTED ROUTES */}
      {/* The new, futuristic homepage is at the root. */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      
      {/* Legacy /dashboard route redirects to the new homepage at /. */}
      <Route path="/dashboard" element={<Navigate to="/" />} />

      <Route path="/field/:fieldId" element={<ProtectedRoute><FieldDetailPage /></ProtectedRoute>} />
      <Route path="/farm-plan" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />

      {/* FALLBACK */}
      {/* Any other path will redirect to the homepage. A 404 page would be better. */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
