import { supabase as enhancedSupabase } from '@/services/supabaseClient';

// Re-export the shared singleton so existing imports continue to work
export { enhancedSupabase as supabase };
