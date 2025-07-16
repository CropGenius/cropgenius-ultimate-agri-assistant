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
        // Ensure PKCE flow completes and session is available
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session || !session.user) {
          throw new Error('No active session found');
        }

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
