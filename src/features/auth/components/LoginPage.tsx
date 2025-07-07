import { useState } from 'react';
import { simpleAuth } from '@/lib/simpleAuth';
import { mapSupabaseAuthError } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import GoogleIcon from '@/components/icons/GoogleIcon';

interface LoginPageProps {
  onToggle: () => void;
}

export const LoginPage = ({ onToggle }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await simpleAuth.signIn(email, password);

      if (error) {
        console.warn('Login failed:', error.message);
        setError(mapSupabaseAuthError(error));
      }
      // On success, the AuthProvider will redirect automatically.
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await simpleAuth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
          <GoogleIcon className="mr-2 h-4 w-4" /> Google
        </Button>
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">
        Not a member?{' '}
        <button type="button" onClick={onToggle} className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up now
        </button>
      </p>
    </form>
  );
};
