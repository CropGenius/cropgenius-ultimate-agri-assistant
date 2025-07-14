import { FC } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthPage: FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) throw error;
      if (!data?.url) {
        navigate('/dashboard');
      } else {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error('Google sign-in failed', { description: err.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            data-testid="google-signin-button"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.6h5.054c-.216 1.176-1.308 3.447-5.054 3.447-3.042 0-5.518-2.478-5.518-5.524 0-3.045 2.476-5.522 5.518-5.522 1.732 0 2.896.737 3.558 1.376l2.432-2.358C16.724 3.47 14.573 2.4 12 2.4 6.648 2.4 2.4 6.65 2.4 12s4.248 9.6 9.6 9.6c5.52 0 9.2-3.858 9.2-9.3 0-.62-.07-1.092-.156-1.6H12z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
