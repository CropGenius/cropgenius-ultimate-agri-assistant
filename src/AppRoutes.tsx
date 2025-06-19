import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/MissionControlPage';
import FieldDetailPage from './pages/FieldDetail';
import FarmPlanningPage from './pages/FarmPlanningPage';
import MarketInsightsPage from './pages/MarketInsightsPage';
import OnboardingPage from './pages/OnboardingPage';

const AppLayout = () => (
  <Routes>
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/field/:fieldId" element={<ProtectedRoute><FieldDetailPage /></ProtectedRoute>} />
    <Route path="/farm-plan" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
    <Route path="/market" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export const AppRoutes = () => {
  const { user, isLoading, profile } = useAuth();

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  if (user) {
    if (profile === undefined || profile === null) {
        // Profile is loading or user does not have one, needs onboarding
        if (profile === null) {
            return (
                <Routes>
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            );
        }
        return <div>Loading user profile...</div>;
    }

    if (!profile.onboarding_completed) {
      return (
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      );
    }

    return (
      <Routes>
        <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};
