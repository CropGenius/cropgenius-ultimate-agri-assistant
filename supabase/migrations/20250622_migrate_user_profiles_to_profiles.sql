-- Migration to handle the transition from user_profiles to profiles table

-- 1. First, ensure the profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS farm_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Copy data from user_profiles to profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Update existing profiles with data from user_profiles
    UPDATE public.profiles p
    SET 
      onboarding_completed = up.onboarding_completed,
      farm_name = up.farm_name,
      location = CASE 
        WHEN up.farm_lat IS NOT NULL AND up.farm_lon IS NOT NULL 
        THEN up.farm_lat::text || ',' || up.farm_lon::text 
        ELSE p.location 
      END
    FROM public.user_profiles up
    WHERE p.id = up.id;
    
    -- Drop the old user_profiles table after migration
    DROP TABLE IF EXISTS public.user_profiles CASCADE;
  END IF;
END $$;

-- 3. Update the comment for the column
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indicates whether the user has completed the initial setup/onboarding flow.';
