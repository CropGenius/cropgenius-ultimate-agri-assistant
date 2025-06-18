-- Step 1: Fix Critical Security Vulnerability - Enable RLS on soil_types
ALTER TABLE public.soil_types ENABLE ROW LEVEL SECURITY;

-- Grant safe, read-only access to all authenticated users for this public data.
DROP POLICY IF EXISTS "Allow authenticated read access to soil types" ON public.soil_types;
CREATE POLICY "Allow authenticated read access to soil types"
ON public.soil_types FOR SELECT
TO authenticated
USING (true);

-- Step 2: Fix Performance Issue - Add missing indexes to foreign keys
CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_user_id ON public.weather_data(user_id);

-- Step 3: Fix Performance & Security - Consolidate RLS policies on the 'fields' table

-- Drop all old, inefficient policies for the 'fields' table first.
DROP POLICY IF EXISTS "Users can view their own fields" ON public.fields;
DROP POLICY IF EXISTS "Users can insert their own fields" ON public.fields;
DROP POLICY IF EXISTS "Users can update their own fields" ON public.fields;
DROP POLICY IF EXISTS "Users can delete their own fields" ON public.fields;
-- This policy name seems to be a duplicate from another table, but we drop it just in case.
DROP POLICY IF EXISTS "Users can manage their own fields" ON public.fields;

-- Create new, consolidated, and efficient policies.
CREATE POLICY "Allow users to manage their own fields"
ON public.fields
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 4: Harden Database Functions - Set secure search paths
-- This prevents a class of security vulnerabilities.
ALTER FUNCTION public.check_field_farm_ownership(uuid, uuid) SET search_path = public, extensions;
ALTER FUNCTION public.save_user_onboarding_data(uuid, character varying, character varying, character varying, character varying) SET search_path = public, extensions;
ALTER FUNCTION public.handle_new_user() SET search_path = public, extensions;
