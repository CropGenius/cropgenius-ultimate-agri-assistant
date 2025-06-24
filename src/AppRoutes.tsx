import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ResponsiveLayout from './components/layout/ResponsiveLayout';

// Route-level code-splitting. These pages are fetched only when the route is visited.
const Dashboard = lazy(() => import('./pages/MissionControlPage'));
const MobileHomePage = lazy(() => import('./pages/home/MobileHomePage'));
const FieldDetailPage = lazy(() => import('./pages/FieldDetail'));
const FarmPlanningPage = lazy(() => import('./pages/FarmPlanningPage'));
const MarketInsightsPage = lazy(() => import('./pages/MarketInsightsPage'));

// Onboarding wizard is a named export (no default), so map it to `default` for React.lazy
const OnboardingWizard = lazy(() =>
  import('./features/onboarding/OnboardingWizard').then((m) => ({
    default: m.OnboardingWizard,
  }))
);

// Create a component that wraps routes with ResponsiveLayout
interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return (
    <ResponsiveLayout isMobile={isMobile}>
      {children}
    </ResponsiveLayout>
  );
};

const AppLayout = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  return (
    <Routes>
      {/* Wrap all routes that need the layout */}
      <Route element={
        <LayoutWrapper>
          <Outlet />
        </LayoutWrapper>
      }>
        {/* Mobile-specific routes */}
        {isMobile && (
          <Route path="/home" element={<ProtectedRoute><MobileHomePage /></ProtectedRoute>} />
        )}
        
        {/* Common routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/field/:fieldId" element={<ProtectedRoute><FieldDetailPage /></ProtectedRoute>} />
        <Route path="/farm-plan" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />
        
        {/* Redirect root based on device */}
        <Route 
          path="/" 
          element={
            <Navigate to={isMobile ? "/home" : "/dashboard"} replace /> 
          } 
        />
        
        {/* Fallback route */}
        <Route 
          path="*" 
          element={
            <Navigate to={isMobile ? "/home" : "/dashboard"} replace /> 
          } 
        />
      </Route>
    </Routes>
  );
};

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
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Loading your farm dashboard...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route 
            path="/auth" 
            element={
              <Navigate to={/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? "/home" : "/dashboard"} replace />
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <Navigate to={
                /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? "/home" : "/dashboard"
              } replace />
            } 
          />
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
