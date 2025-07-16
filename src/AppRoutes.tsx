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
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Index />} />
      <Route path="/fields" element={<Fields />} />
      <Route path="/fields/:id" element={<FieldDetail />} />
      <Route path="/manage-fields" element={<ManageFields />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/market" element={<Market />} />
      <Route path="/market-insights" element={<MarketInsightsPage />} />
      <Route path="/farm-planning" element={<FarmPlanningPage />} />
      <Route path="/mission-control" element={<MissionControlPage />} />
      <Route path="/yield-predictor" element={<YieldPredictor />} />
      <Route path="/community" element={<Community />} />
      <Route path="/farms" element={<Farms />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/super" element={<SuperDashboard />} />
      <Route path="/backend" element={<BackendDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}