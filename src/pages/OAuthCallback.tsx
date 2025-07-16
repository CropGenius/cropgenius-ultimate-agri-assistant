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
        // Check if we have an authorization code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        console.log('Exchanging authorization code for session');
        
        // Exchange the authorization code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Code exchange error:', error);
          throw new Error(`Failed to exchange code for session: ${error.message}`);
        }

        if (!data.session || !data.user) {
          throw new Error('No session returned from code exchange');
        }

        console.log('OAuth session established successfully');
        
        // Give the auth context a moment to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          // Continue anyway - profile might be created by trigger
        }

        // Navigate to appropriate page with full page reload to ensure clean state
        if (!profile || profile.onboarding_completed === false) {
          window.location.href = '/onboarding';
        } else {
          window.location.href = '/';
        }
        
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        
        // Clean up any partial auth state
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Sign out error:', signOutError);
        }
        
        // Redirect to auth page after delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
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
