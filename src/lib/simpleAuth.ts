import { supabase } from '../services/supabaseClient';

export const simpleAuth = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getUser: () => {
    return supabase.auth.getUser();
  },
  signInWithOAuth: async (params: any) => {
    return await supabase.auth.signInWithOAuth({
      provider: params.provider,
      options: {
        redirectTo: `${window.location.origin}/oauth/callback`
      }
    });
  }
};