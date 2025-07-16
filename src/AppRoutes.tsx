import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import { AuthPage } from './features/auth/components/AuthPage';
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
      <Route path="/auth" element={<AuthGuard requireAuth={false}><AuthPage /></AuthGuard>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
      <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
      <Route path="/fields" element={<AuthGuard><Fields /></AuthGuard>} />
      <Route path="/fields/:id" element={<AuthGuard><FieldDetail /></AuthGuard>} />
      <Route path="/manage-fields" element={<AuthGuard><ManageFields /></AuthGuard>} />
      <Route path="/weather" element={<AuthGuard><Weather /></AuthGuard>} />
      <Route path="/scan" element={<AuthGuard><Scan /></AuthGuard>} />
      <Route path="/chat" element={<AuthGuard><Chat /></AuthGuard>} />
      <Route path="/market" element={<AuthGuard><Market /></AuthGuard>} />
      <Route path="/market-insights" element={<AuthGuard><MarketInsightsPage /></AuthGuard>} />
      <Route path="/farm-planning" element={<AuthGuard><FarmPlanningPage /></AuthGuard>} />
      <Route path="/mission-control" element={<AuthGuard><MissionControlPage /></AuthGuard>} />
      <Route path="/yield-predictor" element={<AuthGuard><YieldPredictor /></AuthGuard>} />
      <Route path="/community" element={<AuthGuard><Community /></AuthGuard>} />
      <Route path="/farms" element={<AuthGuard><Farms /></AuthGuard>} />
      <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
      <Route path="/super" element={<AuthGuard><SuperDashboard /></AuthGuard>} />
      <Route path="/backend" element={<AuthGuard><BackendDashboard /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}