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
  const { user, isLoading, profile } = useAuth();
  const location = useLocation();

  // Development bypass - check for dev mode and bypass auth if needed
  const isDevelopment = import.meta.env.DEV;
  const bypassAuth = isDevelopment && window.location.search.includes('bypass=true');

  // Show loading state while auth is initializing
  if (isLoading) {
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

  // If no user and not bypassing auth, redirect to auth
  if (!user && !bypassAuth) {
    if (location.pathname !== '/auth') {
      return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but onboarding not complete, redirect to onboarding
  if (user && profile && profile.onboarding_completed === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated and onboarding is complete (or no profile yet)
  return <>{children}</>;
};

export default ProtectedRoute;
