/**
 * @file supabaseClient.ts
 * @description Re-exports the Supabase client from the services directory.
 * This file exists to maintain compatibility with imports from '@/lib/supabaseClient'.
 */

import { supabase } from '@/services/supabaseClient';

export { supabase };