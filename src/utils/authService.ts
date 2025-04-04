
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Database, Profile } from "@/types/supabase";

// Types
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    console.log("Sign in successful:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    console.log("Sign up successful:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing up:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in with Google:", error.message);
    return { data: null, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("Sign out successful");
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    return { error: error.message };
  }
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    console.log("User profile fetched:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return { data: null, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    console.log("Profile updated:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating user profile:", error.message);
    return { data: null, error: error.message };
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return { user: null, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error resetting password:", error.message);
    return { error: error.message };
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error updating password:", error.message);
    return { error: error.message };
  }
};
