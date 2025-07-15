
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, logAuthState } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { debugAuthState, exchangeCodeForSession } from "@/utils/authService";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to check for farm and handle navigation
  const checkFarmAndNavigate = async (userId: string) => {
    try {
      // Check if user has a farm
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (farmError) {
        console.error("Farm check error:", farmError);
        // Continue with navigation despite farm check error
        navigate("/", { replace: true });
        return;
      }
      
      console.log("Farm check result:", farmData);
      
      if (farmData && farmData.length > 0) {
        // Store farm ID in localStorage
        localStorage.setItem("farmId", farmData[0].id);
      } else {
        // No farm, they'll be shown the onboarding
        console.log("No farm found, will show onboarding flow");
        localStorage.removeItem("farmId");
      }
      
      // Redirect to home in both cases
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error checking farm:", error);
      // Continue with navigation despite error
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    console.log("Auth callback: Processing authentication");
    debugAuthState();
    
    // Process the OAuth callback
    const processOAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // Get the URL hash and search params
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL params
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }
        
        let session = null;
        
        // Exchange code for session if present in URL
        if (searchParams.has('code') || hash.includes('access_token')) {
          console.log("Auth code or token found in URL, exchanging for session");
          const { data, error } = await exchangeCodeForSession();
          
          if (error) {
            console.error("Code exchange error:", error);
            throw new Error(error);
          }
          
          if (data?.session) {
            session = data.session;
          }
        }
        
        // If no session from code exchange, try a regular session check
        if (!session) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session retrieval error:", error);
            throw error;
          }
          
          console.log("Auth callback session check:", data.session?.user?.id || "No session found");
          session = data.session;
        }
        
        if (session) {
          // Show success toast
          toast.success("Successfully signed in!", {
            duration: 3000,
          });
          
          // Check farm and navigate
          await checkFarmAndNavigate(session.user.id);
        } else {
          // If no session found but we expect one, try checking again after a delay
          // This is necessary because sometimes sessions aren't immediately available after redirect
          console.log("No session found on initial check. Implementing recovery strategy...");
          
          timeoutRef.current = setTimeout(async () => {
            const { data: retryData } = await logAuthState();
            
            if (retryData.session) {
              toast.success("Authentication successful!");
              await checkFarmAndNavigate(retryData.session.user.id);
            } else {
              // If still no session, redirect to login
              toast.error("Authentication failed", {
                description: "Please try signing in again",
              });
              navigate("/auth", { replace: true });
            }
          }, 1500);
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message);
        toast.error("Authentication error", {
          description: error.message,
          duration: 5000,
        });
        
        // Redirect to login page after a delay
        timeoutRef.current = setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure the component has mounted
    timeoutRef.current = setTimeout(() => {
      processOAuthCallback();
    }, 100);
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {error ? (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm">Redirecting to login page...</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate("/auth", { replace: true })}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="text-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Completing Authentication...</h1>
          <p className="text-muted-foreground">Please wait while we log you in.</p>
          
          {!isProcessing && (
            <div className="mt-6">
              <p className="text-amber-500 mb-2">Taking longer than expected</p>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => navigate("/auth", { replace: true })}
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
