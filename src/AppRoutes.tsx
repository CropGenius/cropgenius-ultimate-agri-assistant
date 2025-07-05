import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/components/AuthPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Route-level code-splitting
const Dashboard = lazy(() => import('./pages/MissionControlPage'));
const MobileHomePage = lazy(() => import('./pages/home/MobileHomePage'));
const FieldDetailPage = lazy(() => import('./pages/FieldDetail'));
const FarmPlanningPage = lazy(() => import('./pages/FarmPlanningPage'));
const MarketInsightsPage = lazy(() => import('./pages/MarketInsightsPage'));
const ScanPage = lazy(() => import('./pages/Scan'));
const WeatherPage = lazy(() => import('./pages/Weather'));
const MarketPage = lazy(() => import('./pages/Market'));
const ChatPage = lazy(() => import('./pages/Chat'));
const SettingsPage = lazy(() => import('./pages/Settings'));

// Onboarding wizard
const OnboardingWizard = lazy(() =>
  import('./features/onboarding/OnboardingWizard').then((m) => ({
    default: m.OnboardingWizard,
  }))
);

// Detect mobile device
const isMobile = () => {
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const AppLayout = () => {
  const mobile = isMobile();
  
  return (
    <Routes>
      {/* Core routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><MobileHomePage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Feature routes */}
      <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      {/* Field routes */}
      <Route path="/field/:fieldId" element={<ProtectedRoute><FieldDetailPage /></ProtectedRoute>} />
      <Route path="/farm-plan" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const AppRoutes = () => {
  const { user, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading CropGenius...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Check if user needs onboarding
    if (profile === null || (profile && !profile.onboarding_completed)) {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </Suspense>
      );
    }

    // User is authenticated and onboarded
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
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Suspense>
    );
  }

  // User not authenticated
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Suspense>
  );
};
