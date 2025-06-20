import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, amount, description } = await req.json();

  if (!userId || !amount || amount <= 0) {
    return new Response(JSON.stringify({ error: 'User ID and a positive amount are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { error } = await supabaseAdmin.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: 'Credits deducted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 