
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

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Authentication required", {
        description: "Please sign in to access this feature",
        duration: 3000
      });
    } else if (user) {
      // Proactively check and refresh session if needed
      checkAndRefreshSession();
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
    // Save current path for redirect after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // Check if session expired or needs refresh
  const sessionExpiryCheck = () => {
    const sessionStr = localStorage.getItem('cropgenius-auth');
    if (sessionStr) {
      try {
        const sessionData = JSON.parse(sessionStr);
        if (sessionData.expiresAt) {
          const expiresAt = new Date(sessionData.expiresAt).getTime();
          const now = Date.now();
          // If session expires in less than 5 minutes, show refresh button
          if (expiresAt - now < 300000) {
            return true;
          }
        }
      } catch (e) {
        console.error("Error checking session expiry:", e);
      }
    }
    return false;
  };
  
  const sessionNeedsRefresh = sessionExpiryCheck();
  
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

  return (
    <>
      {children}
      
      {/* Session refresh banner */}
      {sessionNeedsRefresh && (
        <div className="fixed bottom-4 right-4 z-40 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <p className="text-sm text-amber-800 dark:text-amber-200">Your session is expiring soon</p>
            <Button size="sm" variant="outline" onClick={refreshSession} className="h-8 gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedRoute;
