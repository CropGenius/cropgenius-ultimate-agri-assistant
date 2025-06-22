import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can replace this with a beautiful loading spinner component
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they log in.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};
