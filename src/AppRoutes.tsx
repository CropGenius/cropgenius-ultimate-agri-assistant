import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileLayout } from './components/mobile/MobileLayout';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Fields from './pages/Fields';
import Weather from './pages/Weather';
import Scan from './pages/Scan';
import Chat from './pages/Chat';
import Market from './pages/Market';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import OnboardingPage from './pages/OnboardingPage';
import AuthCallback from './pages/AuthCallback';
import OAuthCallback from './pages/OAuthCallback';
import FieldDetail from './pages/FieldDetail';
import ManageFields from './pages/ManageFields';
import FarmPlanningPage from './pages/FarmPlanningPage';
import MarketInsightsPage from './pages/MarketInsightsPage';
import MissionControlPage from './pages/MissionControlPage';
import YieldPredictor from './pages/YieldPredictor';
import Community from './pages/Community';
import Farms from './pages/Farms';
import { SuperDashboard } from './components/SuperDashboard';
import { BackendDashboard } from './pages/BackendDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - NO mobile layout */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Dashboard routes - WITH mobile layout */}
      <Route path="/" element={
        <MobileLayout>
          <ProtectedRoute><Index /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/fields" element={
        <MobileLayout>
          <ProtectedRoute><Fields /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/fields/:id" element={
        <MobileLayout>
          <ProtectedRoute><FieldDetail /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/manage-fields" element={
        <MobileLayout>
          <ProtectedRoute><ManageFields /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/weather" element={
        <MobileLayout>
          <ProtectedRoute><Weather /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/scan" element={
        <MobileLayout>
          <ProtectedRoute><Scan /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/chat" element={
        <MobileLayout>
          <ProtectedRoute><Chat /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/market" element={
        <MobileLayout>
          <ProtectedRoute><Market /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/market-insights" element={
        <MobileLayout>
          <ProtectedRoute><MarketInsightsPage /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/farm-planning" element={
        <MobileLayout>
          <ProtectedRoute><FarmPlanningPage /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/mission-control" element={
        <MobileLayout>
          <ProtectedRoute><MissionControlPage /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/yield-predictor" element={
        <MobileLayout>
          <ProtectedRoute><YieldPredictor /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/community" element={
        <MobileLayout>
          <ProtectedRoute><Community /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/farms" element={
        <MobileLayout>
          <ProtectedRoute><Farms /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/settings" element={
        <MobileLayout>
          <ProtectedRoute><Settings /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/super" element={
        <MobileLayout>
          <ProtectedRoute><SuperDashboard /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="/backend" element={
        <MobileLayout>
          <ProtectedRoute><BackendDashboard /></ProtectedRoute>
        </MobileLayout>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}