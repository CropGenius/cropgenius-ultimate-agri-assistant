// Re-export the main Supabase client to maintain compatibility
export { supabase as default } from '@/integrations/supabase/client';
export { supabase } from '@/integrations/supabase/client';
export type { Database } from '@/integrations/supabase/types';
export type { Tables } from '@/integrations/supabase/client';

// Debug helper to log authentication state
export const logAuthState = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  return { session, user };
};