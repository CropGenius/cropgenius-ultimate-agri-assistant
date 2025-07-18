import { supabase } from '@/integrations/supabase/client';

// Re-export the shared singleton so existing imports continue to work
export { enhancedSupabase as supabase };
