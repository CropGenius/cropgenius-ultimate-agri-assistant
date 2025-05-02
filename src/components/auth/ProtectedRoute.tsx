import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import FarmOnboarding from "@/components/onboarding/FarmOnboarding";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { checkAndRefreshSession } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, farmId, refreshSession } = useAuth();
  const location = useLocation();

  // TODO: re-enable auth - this useEffect is now just informational
  useEffect(() => {
    console.log("[DEV] Protected route check bypassed:", location.pathname);
  }, [location.pathname]);
  
  // TODO: re-enable auth
  // Bypass authentication checks - always render children
  return (
    <>
      {children}
      
      {/* Commented out authentication checks for development
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading authentication state...</p>
          </div>
        </div>
      ) : !user ? (
        // Save current path for redirect after login
        <Navigate to="/auth" state={{ from: location.pathname }} replace />
      ) : !farmId && !pathsAllowedWithoutFarm.includes(location.pathname) ? (
        <div className="container mx-auto py-8 px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to CROPGenius</h2>
          <p className="text-center mb-8 text-muted-foreground">Complete your farm setup to continue</p>
          <FarmOnboarding />
        </div>
      ) : (children)}
      */}
      
      {/* Session refresh banner - show for development info only */}
      <div className="fixed bottom-4 right-4 z-40 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <p className="text-sm text-amber-800 dark:text-amber-200">DEV MODE: Auth bypassed</p>
          <Button size="sm" variant="outline" onClick={refreshSession} className="h-8 gap-1">
            <RefreshCw className="h-3 w-3" />
            Mock Refresh
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProtectedRoute;
