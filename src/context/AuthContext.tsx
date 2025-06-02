
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, checkAndRefreshSession } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  farmId: string | null;
  isDevPreview?: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mock values with valid UUID format for development environment
// Use proper UUID format for development to avoid database type errors
const DEV_USER_ID = "00000000-0000-0000-0000-000000000000"; // Valid UUID format
const DEV_FARM_ID = "00000000-0000-0000-0000-000000000001"; // Valid UUID format

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // TODO: re-enable auth
  // Original auth state
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (import.meta.env.DEV) {
      return {
        user: {
          id: DEV_USER_ID,
          email: "dev@cropgenius.ai",
          app_metadata: {},
          user_metadata: { full_name: "CropGenius Dev" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User,
        session: {
          access_token: "dev-access-token",
          refresh_token: "dev-refresh-token",
          user: {
            id: DEV_USER_ID,
            email: "dev@cropgenius.ai",
            app_metadata: {},
            user_metadata: { full_name: "CropGenius Dev" },
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as User,
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        } as Session,
        isLoading: false,
        error: null,
        farmId: DEV_FARM_ID,
        isDevPreview: true,
      };
    } else {
      return {
        user: null,
        session: null,
        isLoading: true,
        error: null,
        farmId: null,
        isDevPreview: false,
      };
    }
  });
  
  const refreshSession = async () => {
    if (import.meta.env.DEV) {
      console.log("[DEV] Mocked session refresh");
      // Simulate a slight delay for mock refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      setAuthState(prev => ({ ...prev, error: null })); // Clear any mock errors
      toast.info("Dev session refreshed (mock)");
      return;
    }
    try {
      console.log("Refreshing session...");
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error.message);
        setAuthState(prev => ({ ...prev, error: error.message }));
        toast.error("Session refresh failed", { description: error.message });
      } else {
        console.log("Session refreshed successfully");
        // Auth state will be updated by onAuthStateChange listener
        toast.success("Session refreshed");
      }
    } catch (e: any) {
      console.error("Unexpected error refreshing session:", e.message);
      setAuthState(prev => ({ ...prev, error: e.message }));
      toast.error("Session refresh failed", { description: "An unexpected error occurred." });
    }
  };

  const signOut = async () => {
    if (import.meta.env.DEV) {
      console.log("[DEV] Mocked sign out");
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
        farmId: null,
        isDevPreview: true, // Keep dev preview true if it was on
      });
      toast.info("Signed out (mock)");
      return;
    }
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        setAuthState(prev => ({ ...prev, error: error.message }));
        toast.error("Sign out failed", { description: error.message });
      } else {
        console.log("Signed out successfully");
        // Auth state will be updated by onAuthStateChange listener
        // No specific toast here, onAuthStateChange handles SIGNED_OUT event toast
      }
    } catch (e: any) {
      console.error("Unexpected error signing out:", e.message);
      setAuthState(prev => ({ ...prev, error: e.message }));
      toast.error("Sign out failed", { description: "An unexpected error occurred." });
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[DEV] Authentication bypassed for development. Using mock user and farmId:", DEV_FARM_ID);
      // In DEV mode, initial state is already set, and signOut/refreshSession are mocked.
      // No further setup needed for Supabase listeners.
      return;
    }

    console.log("AuthProvider: Setting up Supabase auth listener for production.");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Supabase Auth Event: ${event}`, session?.user?.id ? `User: ${session.user.id}` : "No user");
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
          error: null, // Clear previous errors on auth change
        }));
        
        if (event === 'INITIAL_SESSION') {
          console.log("Initial session processed.", session?.user?.id);
          if (session?.user?.id) {
            checkUserFarm(session.user.id);
          }
        } else if (event === 'SIGNED_IN') {
          console.log("User signed in:", session?.user?.id);
          toast.success(`Logged in as ${session?.user?.email || 'user'}`);
          if (session?.user?.id) {
            checkUserFarm(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out.");
          toast.info("Logged out successfully.");
          localStorage.removeItem("farmId");
          setAuthState(prev => ({ ...prev, farmId: null }));
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed.");
          // Session data in authState is updated automatically.
          // Optionally, re-check farm if it might change or depend on fresh token data.
          if (session?.user?.id) {
             // checkUserFarm(session.user.id); // Usually not needed on token refresh alone
          }
        } else if (event === 'USER_UPDATED') {
          console.log("User data updated.");
          // User data in authState is updated automatically.
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery email sent.");
          toast.info("Password recovery email sent. Check your inbox.");
        }
      }
    );
    
    // Initial check for session is handled by onAuthStateChange with INITIAL_SESSION event
    // No need for a separate getSession() call here as onAuthStateChange fires immediately with current state.

    // Set up a timer to periodically check and refresh the session if needed
    // This is a fallback for cases where onAuthStateChange might not cover all edge cases or browser states
    const sessionRefreshInterval = setInterval(() => {
      if (navigator.onLine) { // Only attempt refresh if online
        checkAndRefreshSession(); // This utility should internally call supabase.auth.refreshSession() if needed
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => {
      console.log("Cleaning up Supabase auth subscription and refresh interval.");
      subscription?.unsubscribe();
      clearInterval(sessionRefreshInterval);
    };
  }, []);
  
  const checkUserFarm = async (userId: string) => {
    if (import.meta.env.DEV) {
      console.log(`[DEV] Mock farm check for user: ${userId}. Using DEV_FARM_ID: ${DEV_FARM_ID}`);
      // In DEV mode, we assume the DEV_FARM_ID is set in the initial state and do nothing further here.
      // If you needed to simulate a fetch, you could add it here.
      return;
    }

    console.log(`Checking farm for user: ${userId}`);
    try {
      const { data: farms, error } = await supabase
        .from('farms') // Ensure 'farms' is the correct table name
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error("Error fetching farm:", error.message);
        toast.error("Failed to load farm data", { description: error.message });
        // Optionally set farmId to null or handle error state
        setAuthState(prev => ({ ...prev, farmId: null, error: `Farm fetch error: ${error.message}` }));
        return;
      }

      if (farms && farms.length > 0) {
        const farmId = farms[0].id;
        console.log("Farm found:", farmId);
        localStorage.setItem("farmId", farmId);
        setAuthState(prev => ({ ...prev, farmId, error: null })); // Clear previous farm-related errors
        // toast.success("Farm data loaded", { description: "Your farm information is ready." }); // This might be too noisy, consider if needed
      } else {
        console.log("No farm found for user:", userId);
        localStorage.removeItem("farmId");
        setAuthState(prev => ({ ...prev, farmId: null }));
        // toast.info("No farm associated with this account.", { description: "You can create or join a farm in settings." }); // Consider UX for this case
      }
    } catch (e: any) {
      console.error("Unexpected error checking farm:", e.message);
      toast.error("Failed to load farm data", { description: "An unexpected error occurred." });
      setAuthState(prev => ({ ...prev, farmId: null, error: `Farm fetch critical error: ${e.message}` }));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      signOut, 
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
