import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FarmOnboarding from "@/components/onboarding/FarmOnboarding";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Define paths that are accessible even if the user doesn't have a farmId yet.
// For example, a user profile page or a page to create/select a farm if not using FarmOnboarding component directly.
// For now, keeping it empty means FarmOnboarding will be shown for all protected routes if farmId is missing.
const pathsAllowedWithoutFarm: string[] = [/* e.g., '/profile', '/settings/account' */];

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, farmId, isDevPreview, profile } = useAuth();
  const location = useLocation();
  
  // Development bypass - check for dev mode and bypass auth if needed
  const isDevelopment = import.meta.env.DEV;
  const bypassAuth = isDevelopment && window.location.search.includes('bypass=true');

  // Skip loading state if we're in dev preview mode or if loading takes too long
  if (isLoading && !isDevPreview) {
    // Return a simple loading screen instead of null to show something is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CropGenius...</p>
        </div>
      </div>
    );
  }

  // Development bypass - allow access without authentication in dev mode
  if (bypassAuth) {
    return <>{children}</>;
  }

  // If not in dev preview and no user, redirect to auth
  if (!user && !isDevPreview && !bypassAuth) {
    // Use window.location for immediate redirect without loading state
    if (location.pathname !== '/auth') {
      window.location.href = `/auth?redirect=${encodeURIComponent(location.pathname)}`;
      return null;
    }
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If user is authenticated but onboarding not complete, redirect
  if (user && profile && profile.onboarding_completed === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is authenticated (or in dev preview), check for farmId
  // The isDevPreview check allows development with mock farmId without triggering onboarding
  if (user && !farmId && !isDevPreview && !pathsAllowedWithoutFarm.includes(location.pathname)) {
    console.log("ProtectedRoute: User authenticated, no farmId, showing FarmOnboarding for", location.pathname);
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Welcome to CROPGenius!</h2>
          <p className="text-center mb-8 text-muted-foreground text-lg">
            Let's get your farm set up to unlock all features.
          </p>
          <FarmOnboarding />
        </div>
      </div>
    );
  }

  // If user is authenticated (or in dev preview) AND (has farmId OR path is allowed without farmId OR in dev preview with mock farmId)
  return <>{children}</>;
};

export default ProtectedRoute;
