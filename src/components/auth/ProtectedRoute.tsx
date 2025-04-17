
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import FarmOnboarding from "@/components/onboarding/FarmOnboarding";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, farmId, refreshSession, isDevPreview } = useAuth();
  const location = useLocation();
  const isOnline = navigator.onLine;

  useEffect(() => {
    // If not loading and not authenticated, show toast
    if (!isLoading && !user && !isDevPreview) {
      toast.error("Authentication required", {
        description: "Please sign in to access this feature",
        duration: 3000
      });
    }
  }, [isLoading, user, isDevPreview]);

  // If loading, show loading state
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

  // If not authenticated, redirect to login
  if (!user && !isDevPreview) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Check if session expired or needs refresh
  const sessionExpiryCheck = () => {
    // Skip for dev preview
    if (isDevPreview) return false;
    
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
  
  // Display offline warning when offline
  const OfflineWarning = () => {
    if (isOnline) return null;
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-800 dark:text-amber-200" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          You're offline. Using cached data.
        </p>
      </div>
    );
  };
  
  // If authenticated but no farm, show farm onboarding
  // Skip this check for paths that should be accessible without a farm
  const pathsAllowedWithoutFarm = ['/auth', '/auth/callback', '/auth/retry'];
  if (!farmId && !pathsAllowedWithoutFarm.includes(location.pathname) && !isDevPreview) {
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
      
      <OfflineWarning />
      
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
