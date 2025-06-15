import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// This function creates a policy for the farm_tasks table if it doesn't exist
serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // SQL to create the policy if it doesn't exist
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        -- Enable RLS on farm_tasks if not already enabled
        ALTER TABLE IF EXISTS public.farm_tasks ENABLE ROW LEVEL SECURITY;
        
        -- Drop the policy if it exists (to recreate it)
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'farm_tasks' AND policyname = 'users_see_own_tasks'
          ) THEN
            DROP POLICY IF EXISTS users_see_own_tasks ON public.farm_tasks;
          END IF;
        END
        $$;
        
        -- Create the policy
        CREATE POLICY users_see_own_tasks ON public.farm_tasks
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.farm_plans 
            WHERE farm_plans.id = farm_tasks.plan_id 
            AND farm_plans.user_id = auth.uid()
          )
        );
      `
    });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Farm tasks policy created or updated successfully" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error creating policy:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Failed to create policy", 
      error: error.message 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}); 