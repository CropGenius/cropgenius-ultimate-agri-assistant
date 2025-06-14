
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
  // Initialize with proper loading state for production
  const [authState, setAuthState] = useState<AuthState>(() => {
    return {
      user: null,
      session: null,
      isLoading: true,
      error: null,
      farmId: null,
      isDevPreview: false,
    };
  });
  
  // Real session refresh function
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        throw error;
      }
      console.log("Session refreshed successfully");
      return data;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw error;
    }
  };

  // Real sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      console.log("Signed out successfully");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out");
      throw error;
    }
  };

  // Set up authentication state management
  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    
    // Initialize with loading state for production
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      isDevPreview: false
    }));
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Auth state changed: ${event}`, session?.user?.id);
        setAuthState(prev => ({
          ...prev,
          user: session?.user || null,
          session: session,
          isLoading: false,
          isDevPreview: false
        }));
        
        if (event === 'SIGNED_IN') {
          console.log("Auth success: User signed in", session?.user?.id);
          toast.success(`Logged in as ${session?.user?.email}`);
          
          // Check if user has a farm (using setTimeout to avoid deadlocks)
          if (session?.user?.id) {
            setTimeout(() => {
              checkUserFarm(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Auth state: User signed out");
          toast.info("Logged out successfully");
          localStorage.removeItem("farmId");
          setAuthState(prev => ({
            ...prev,
            farmId: null
          }));
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Auth state: Token refreshed");
        } else if (event === 'USER_UPDATED') {
          console.log("Auth state: User updated");
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
          setAuthState(prev => ({
            ...prev,
            error: error.message,
            isLoading: false,
            isDevPreview: false
          }));
          return;
        }
        
        if (session) {
          console.log("Existing session found:", session.user.id);
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session: session,
            isLoading: false,
            isDevPreview: false
          }));
          
          // Check if user has a farm (using setTimeout to avoid deadlocks)
          setTimeout(() => {
            checkUserFarm(session.user.id);
          }, 0);
          
          // Set up session refresh timer
          const refreshTimer = setInterval(() => {
            checkAndRefreshSession();
          }, 10 * 60 * 1000); // Check every 10 minutes
          
          return () => clearInterval(refreshTimer);
        } else {
          console.log("No session found");
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isDevPreview: false
          }));
        }
      } catch (error: any) {
        console.error("Unexpected auth error:", error.message);
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
          isDevPreview: false
        }));
      }
    };
    
    // Small delay to ensure context is fully set up
    setTimeout(() => {
      initializeAuth();
    }, 0);
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);
  
  // Check if user has a farm and store farmId
  const checkUserFarm = async (userId: string) => {
    try {
      console.log("Checking if user has a farm...");
      const { data: farms, error } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (error) {
        console.error("Error checking farm:", error.message);
        return;
      }
      
      if (farms && farms.length > 0) {
        const farmId = farms[0].id;
        console.log("Farm found:", farmId);
        localStorage.setItem("farmId", farmId);
        setAuthState(prev => ({ ...prev, farmId }));
        toast.success("Farm data loaded", { description: "Your farm information is ready" });
      } else {
        console.log("No farm found for user");
        localStorage.removeItem("farmId");
        setAuthState(prev => ({ ...prev, farmId: null }));
      }
    } catch (error: any) {
      console.error("Error checking farm:", error.message);
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
