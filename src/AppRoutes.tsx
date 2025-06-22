import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Route-level code-splitting. These pages are fetched only when the route is visited.
const Dashboard = lazy(() => import('./pages/MissionControlPage'));
const FieldDetailPage = lazy(() => import('./pages/FieldDetail'));
const FarmPlanningPage = lazy(() => import('./pages/FarmPlanningPage'));
const MarketInsightsPage = lazy(() => import('./pages/MarketInsightsPage'));
const OnboardingWizard = lazy(() => import('./features/onboarding/OnboardingWizard'));

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
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path="/onboarding" element={<OnboardingWizard />} />
                        <Route path="*" element={<Navigate to="/onboarding" replace />} />
                    </Routes>
                </Suspense>
            );
        }
        return <div>Loading user profile...</div>;
    }

    if (!profile.onboarding_completed) {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Suspense>
  );
};
