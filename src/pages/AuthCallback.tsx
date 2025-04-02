
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the OAuth callback
    const processOAuthCallback = async () => {
      try {
        // Get the URL hash and search params
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL params
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Auth callback session check:", data.session);
        
        if (data.session) {
          // Show success toast
          toast.success("Successfully signed in!", {
            duration: 3000,
          });
          
          // Redirect to the home page
          navigate("/", { replace: true });
        } else {
          // If no session found but no errors, try to exchange the auth code
          console.log("No session found, checking URL params for auth code");
          
          // If still no session, redirect to the login page
          toast.error("Authentication failed", {
            description: "Please try signing in again",
            duration: 3000,
          });
          
          navigate("/auth", { replace: true });
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message);
        toast.error("Authentication error", {
          description: error.message,
          duration: 5000,
        });
        
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {error ? (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Completing Authentication...</h1>
          <p className="text-muted-foreground">Please wait while we log you in.</p>
        </div>
      )}
    </div>
  );
}
