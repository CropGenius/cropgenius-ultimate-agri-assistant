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
      {/* Auth routes - NO mobile layout - MUST be first */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      {/* Dashboard routes - WITH mobile layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <MobileLayout>
            <Index />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/fields" element={
        <ProtectedRoute>
          <MobileLayout>
            <Fields />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/fields/:id" element={
        <ProtectedRoute>
          <MobileLayout>
            <FieldDetail />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/manage-fields" element={
        <ProtectedRoute>
          <MobileLayout>
            <ManageFields />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/weather" element={
        <ProtectedRoute>
          <MobileLayout>
            <Weather />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/scan" element={
        <ProtectedRoute>
          <MobileLayout>
            <Scan />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <MobileLayout>
            <Chat />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/market" element={
        <ProtectedRoute>
          <MobileLayout>
            <Market />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/market-insights" element={
        <ProtectedRoute>
          <MobileLayout>
            <MarketInsightsPage />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/farm-planning" element={
        <ProtectedRoute>
          <MobileLayout>
            <FarmPlanningPage />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/mission-control" element={
        <ProtectedRoute>
          <MobileLayout>
            <MissionControlPage />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/yield-predictor" element={
        <ProtectedRoute>
          <MobileLayout>
            <YieldPredictor />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute>
          <MobileLayout>
            <Community />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/farms" element={
        <ProtectedRoute>
          <MobileLayout>
            <Farms />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MobileLayout>
            <Settings />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/super" element={
        <ProtectedRoute>
          <MobileLayout>
            <SuperDashboard />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="/backend" element={
        <ProtectedRoute>
          <MobileLayout>
            <BackendDashboard />
          </MobileLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}