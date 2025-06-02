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
  const { user, isLoading, farmId, isDevPreview } = useAuth();
  const location = useLocation();

  if (isLoading && !isDevPreview) { // Don't show loading screen if in dev preview with mock data
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user && !isDevPreview) { // If not loading, and no user (and not in dev preview mode)
    console.log("ProtectedRoute: No user, redirecting to /auth from", location.pathname);
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
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
