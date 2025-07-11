import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AuthPage from './pages/AuthPage';
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
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
      <Route path="/fields/:id" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} />
      <Route path="/manage-fields" element={<ProtectedRoute><ManageFields /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
      <Route path="/market-insights" element={<ProtectedRoute><MarketInsightsPage /></ProtectedRoute>} />
      <Route path="/farm-planning" element={<ProtectedRoute><FarmPlanningPage /></ProtectedRoute>} />
      <Route path="/mission-control" element={<ProtectedRoute><MissionControlPage /></ProtectedRoute>} />
      <Route path="/yield-predictor" element={<ProtectedRoute><YieldPredictor /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/farms" element={<ProtectedRoute><Farms /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/super" element={<ProtectedRoute><SuperDashboard /></ProtectedRoute>} />
      <Route path="/backend" element={<ProtectedRoute><BackendDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}