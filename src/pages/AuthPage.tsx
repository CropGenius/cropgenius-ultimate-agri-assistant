import { FC } from 'react';

const AuthPage: FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {/* Google OAuth Sign-In */}
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

        {/* Legacy email/password form kept for fallback but hidden on small screens */}
        <form className="mt-8 space-y-6 hidden" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                data-testid="email-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                data-testid="password-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>



          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              data-testid="signin-button"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ------------ Helpers ------------
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
          redirectTo: `${window.location.origin}/oauth/callback` // ensure this URL is whitelisted in Supabase
        }
      });

      if (error) throw error;
      // Supabase will handle redirect; for SPA fallback, navigate manually
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
        {/* Google button injected above */}
      </div>
    </div>
  );
};

export default AuthPage;
