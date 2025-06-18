import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthState, signOut } from '@/utils/authService';
import { Loader2 } from 'lucide-react';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // Provide a loading state while initial auth check happens
  if (auth.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...auth, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
