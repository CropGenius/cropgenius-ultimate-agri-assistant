import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";

// Re-export canonical AuthProvider and useAuth hook for backward compatibility.
import { AuthProvider as RootAuthProvider, useAuthContext } from '@/providers/AuthProvider';

export interface UserProfile {
  id: string;
  onboarding_completed: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  farmId: string | null;
  profile: UserProfile | null;
  isDevPreview?: boolean;
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = RootAuthProvider;
export const useAuth = useAuthContext;
