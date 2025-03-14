
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the OAuth callback
    const processOAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          // Redirect to the home page
          navigate("/", { replace: true });
        } else {
          // If no session found, redirect to the login page
          navigate("/auth", { replace: true });
        }
      } catch (error: any) {
        setError(error.message);
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
