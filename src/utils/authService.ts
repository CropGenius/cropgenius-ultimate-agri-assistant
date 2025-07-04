import { supabase } from "@/services/supabaseClient";
import { User, Session } from "@supabase/supabase-js";
import { Database, Profile } from "@/types/supabase";
import { toast } from "sonner";

// Types
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: Profile | null;
  error: Error | null;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
    profile?: Profile | null;
  } | null;
  error: string | null;
  status?: number;
  message?: string;
}

export const isSessionValid = (session: Session | null): boolean => {
  if (!session || !session.expires_at) {
    return false;
  }
  // Check if the token is expired. Supabase times are in seconds.
  return session.expires_at > (Date.now() / 1000);
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log("Signing in with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Sign in successful:", data.user?.id);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
  try {
    console.log("Signing up with email:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      console.error("Sign up error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Sign up successful:", data.user?.id);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing up:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<any> => {
  try {
    const baseUrl = window.location.origin;
    const callbackUrl = `${baseUrl}/auth/callback`;
    
    console.log("Starting Google sign in flow with redirect to:", callbackUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error("Google sign in error:", error.message);
      throw new Error(error.message);
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in with Google:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    console.log("Signing out");
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    
    if (error) {
      console.error("Sign out error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Sign out successful");
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    return { error: error.message };
  }
};

// Get user profile data
export const getUserProfile = async (id: string): Promise<{ profile: Profile | null; error: string | null }> => {
  try {
    console.log("Fetching user profile for:", id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Profile fetch error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("User profile fetched:", data);
    return { profile: data, error: null };
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return { profile: null, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: string | null }> => {
  try {
    console.log("Updating profile for:", userId, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Profile update error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Profile updated:", data);
    return { data: data || null, error: null };
  } catch (error: any) {
    console.error("Error updating user profile:", error.message);
    return { data: null, error: error.message };
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log("Checking authentication status");
    const { data } = await supabase.auth.getSession();
    const isAuth = !!data.session;
    console.log("Is authenticated:", isAuth);
    return isAuth;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log("Getting current user");
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Current user error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Current user:", data.user?.id);
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return { user: null, error: error.message };
  }
};

// Get user farms
export const getUserFarms = async (userId: string): Promise<{ data: any[] | null; error: string | null }> => {
  try {
    console.log("Getting farms for user:", userId);
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Get farms error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Farms found:", data.length);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error getting user farms:", error.message);
    return { data: null, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    console.log("Sending password reset for:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error("Password reset error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Password reset email sent");
    return { error: null };
  } catch (error: any) {
    console.error("Error resetting password:", error.message);
    return { error: error.message };
  }
};

// Update password
export const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
  try {
    console.log("Updating password");
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error("Password update error:", error.message);
      throw new Error(error.message);
    }
    
    console.log("Password updated successfully");
    return { error: null };
  } catch (error: any) {
    console.error("Error updating password:", error.message);
    return { error: error.message };
  }
};

// Debug function to check auth state and URLs
export const debugAuthState = () => {
  console.log("[Auth Debug] Current URL:", window.location.href);
  console.log("[Auth Debug] Origin:", window.location.origin);
  console.log("[Auth Debug] Has hash params:", window.location.hash.length > 0);
  console.log("[Auth Debug] Has search params:", window.location.search.length > 0);
};

// Function to exchange OAuth code for session
export const exchangeCodeForSession = async () => {
  try {
    console.log("[Auth] Exchanging code for session");
    const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    
    if (error) {
      console.error("[Auth] Exchange code error:", error.message);
      return { data: null, error: error.message };
    }
    
    console.log("[Auth] Session obtained successfully:", data.session?.user?.id);
    return { data, error: null };
  } catch (error: any) {
    console.error("[Auth] Error exchanging code for session:", error.message);
    return { data: null, error: error.message };
  }
};

// Function to refresh session
export const refreshSession = async () => {
  try {
    console.log("[Auth] Refreshing session");
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("[Auth] Session refresh error:", error.message);
      return { data: null, error: error.message };
    }
    
    console.log("[Auth] Session refreshed successfully:", data.session?.user?.id);
    return { data, error: null };
  } catch (error: any) {
    console.error("[Auth] Error refreshing session:", error.message);
    return { data: null, error: error.message };
  }
};

// Create a demo profile for testing purposes
export const createDemoProfile = async (): Promise<Profile | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user found to create profile for");
      return null;
    }
    
    // Create a profile for the user
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "New User",
        email: user.email,
        onboarding_completed: false,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating profile:", error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createDemoProfile:", error);
    return null;
  }
};

// Update the user's profile
export const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user found for profile update');
    
    // Ensure updates only include fields from the Profile type
    const sanitizedUpdates: Partial<Profile> = {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      phone_number: updates.phone_number,
      location: updates.location,
      farm_size: updates.farm_size,
      farm_units: updates.farm_units,
      preferred_language: updates.preferred_language
    };
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(sanitizedUpdates).filter(([_, v]) => v !== undefined)
    ) as Partial<Profile>;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error('Failed to update profile', {
      description: error.message
    });
    return null;
  }
};

/*
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { debugAuthState, exchangeCodeForSession } from "@/utils/authService";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading');
        console.log("🔐 AuthCallback: Starting auth flow...");
        
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Handle OAuth errors
        if (error) {
          console.error("❌ OAuth Error:", { error, errorDescription });
          setErrorDetails(errorDescription || error);
          setStatus('error');
          toast.error(`Authentication failed: ${errorDescription || error}`);
          
          // Redirect to auth page after delay
          setTimeout(() => navigate('/auth', { replace: true }), 3000);
          return;
        }

        // Exchange code for session if we have a code
        if (code) {
          console.log("🔄 Exchanging code for session...");
          
          const { data, error: exchangeError } = await exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("❌ Code exchange failed:", exchangeError);
            setErrorDetails(exchangeError.message || 'Failed to exchange code for session');
            setStatus('error');
            toast.error("Authentication failed. Please try again.");
            setTimeout(() => navigate('/auth', { replace: true }), 3000);
            return;
          }

          if (data?.session) {
            console.log("✅ Session established successfully");
            setStatus('success');
            toast.success("Signed in successfully!");
            
            // Get intended destination or default to home
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
            return;
          }
        }

        // Fallback: Check current session state
        console.log("🔍 Checking current session state...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Session check failed:", sessionError);
          setErrorDetails(sessionError.message);
          setStatus('error');
          toast.error("Session verification failed");
          setTimeout(() => navigate('/auth', { replace: true }), 3000);
          return;
        }

        if (sessionData.session) {
          console.log("✅ Valid session found");
          setStatus('success');
          toast.success("Welcome back!");
          
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          console.log("❌ No valid session found");
          
          // Try one more time with a delay (race condition fix)
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            
            if (retryData.session) {
              toast.success("Authentication successful!");
              const from = location.state?.from?.pathname || '/';
              navigate(from, { replace: true });
            } else {
              setErrorDetails('No session could be established');
              setStatus('error');
              toast.error("Authentication incomplete. Please sign in again.");
              setTimeout(() => navigate('/auth', { replace: true }), 2000);
            }
          }, 1500);
        }

      } catch (err: any) {
        console.error("💥 AuthCallback unexpected error:", err);
        setErrorDetails(err?.message || 'Unexpected authentication error');
        setStatus('error');
        toast.error("Authentication error occurred");
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20"></div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Signing you in...</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we complete your authentication
              </p>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Welcome to CropGenius!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Authentication Failed</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {errorDetails || 'Something went wrong during sign in'}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Redirecting to sign in page...
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
*/