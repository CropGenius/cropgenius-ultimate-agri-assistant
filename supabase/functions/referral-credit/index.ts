import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { referrerId, referredId } = await req.json();

  if (!referrerId || !referredId) {
    return new Response(JSON.stringify({ error: 'Missing ids' }), { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { error } = await supabaseAdmin.rpc('process_referral', {
    p_referrer: referrerId,
    p_referred: referredId,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Referral processed.' }), { status: 200 });
}); 