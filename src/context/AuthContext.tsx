import React, { createContext, useContext, ReactNode } from 'react';

// Define the shape of our auth context
type AuthContextType = {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  session: any;
  farmId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: {
    id: 'default-user',
    email: 'user@example.com',
    user_metadata: {
      full_name: 'Guest User',
      avatar_url: undefined,
    },
  },
  session: {},
  farmId: 'default-farm-id',
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Default user with a consistent ID
  const defaultUser = {
    id: 'default-user',
    email: 'user@example.com',
    user_metadata: {
      full_name: 'Guest User',
    },
  };

  const value = {
    user: defaultUser,
    session: { user: defaultUser },
    farmId: 'default-farm-id',
    isLoading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
