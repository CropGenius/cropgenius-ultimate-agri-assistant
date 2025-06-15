-- Enable Row Level Security on farm_tasks table
ALTER TABLE IF EXISTS public.farm_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own tasks
DROP POLICY IF EXISTS users_see_own_tasks ON public.farm_tasks;
CREATE POLICY users_see_own_tasks ON public.farm_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.farm_plans 
    WHERE farm_plans.id = farm_tasks.plan_id 
    AND farm_plans.user_id = auth.uid()
  )
);

-- Create a stored procedure to create the policy if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_farm_tasks_policy_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS on farm_tasks if not already enabled
  EXECUTE 'ALTER TABLE IF EXISTS public.farm_tasks ENABLE ROW LEVEL SECURITY';
  
  -- Drop the policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farm_tasks' AND policyname = 'users_see_own_tasks'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS users_see_own_tasks ON public.farm_tasks';
  END IF;
  
  -- Create the policy
  EXECUTE '
    CREATE POLICY users_see_own_tasks ON public.farm_tasks
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.farm_plans 
        WHERE farm_plans.id = farm_tasks.plan_id 
        AND farm_plans.user_id = auth.uid()
      )
    )
  ';
END;
$$; 