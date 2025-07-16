import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizeOAuth = async () => {
      try {
        // Handle OAuth callback with proper error handling
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw new Error('Failed to establish session');
        }

        // Wait for session to be established
        let retries = 0;
        const maxRetries = 10;
        
        while (retries < maxRetries) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session retry error:', sessionError);
            throw sessionError;
          }

          if (session && session.user) {
            console.log('Session established successfully');
            
            // Fetch profile row
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }

            // Determine destination
            if (!profile || profile.onboarding_completed === false) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/farms', { replace: true });
            }
            return;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        throw new Error('Session establishment timed out');
      } catch (err: any) {
        console.error('OAuth callback error', err);
        setError(err.message || 'Authentication failed');
        toast.error('Authentication failed', { description: err.message });
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
      } finally {
        setProcessing(false);
      }
    };

    finalizeOAuth();
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {processing ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Finishing sign-in…</p>
        </>
      ) : error ? (
        <>
          <p className="text-xl font-semibold text-red-600 mb-2">{error}</p>
          <p className="text-sm">Redirecting you to login…</p>
        </>
      ) : null}
    </div>
  );
}
