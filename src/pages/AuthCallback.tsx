import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

/**
 * This page handles the callback from Supabase OAuth flows.
 * Its only job is to display a loading indicator while the
 * onAuthStateChange listener in useAuth handles the session
 * and redirects the user appropriately.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // If the auth state is resolved and the user is authenticated,
    // redirect them to the dashboard. This will be handled by the
    // onAuthStateChange listener, but this effect serves as a final
    // check and redirect mechanism.
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
    
    // As a fallback, if something goes wrong and we're stuck here,
    // redirect to login after a timeout.
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/auth', { replace: true });
      }
    }, 5000); // 5-second timeout

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="text-xl font-medium mt-4">Signing in...</h1>
    </div>
  );
}
