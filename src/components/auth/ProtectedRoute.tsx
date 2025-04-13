
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import FarmOnboarding from "@/components/onboarding/FarmOnboarding";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, farmId } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Authentication required", {
        description: "Please sign in to access this feature",
        duration: 3000
      });
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // If authenticated but no farm, show farm onboarding
  // Skip this check for paths that should be accessible without a farm
  const pathsAllowedWithoutFarm = ['/auth', '/auth/callback'];
  if (!farmId && !pathsAllowedWithoutFarm.includes(location.pathname)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to CROPGenius</h2>
        <p className="text-center mb-8 text-muted-foreground">Complete your farm setup to continue</p>
        <FarmOnboarding />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
