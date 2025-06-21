-- Ensure the profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS farm_size DECIMAL,
ADD COLUMN IF NOT EXISTS farm_units TEXT DEFAULT 'hectares',
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add comments for better documentation
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s avatar image';
COMMENT ON COLUMN public.profiles.phone_number IS 'User''s phone number';
COMMENT ON COLUMN public.profiles.location IS 'User''s location as latitude,longitude';
COMMENT ON COLUMN public.profiles.farm_size IS 'Size of the user''s farm';
COMMENT ON COLUMN public.profiles.farm_units IS 'Units for farm size (default: hectares)';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User''s preferred language (default: en)';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed the onboarding process';

-- Create a trigger to update the updated_at timestamp on row update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists to avoid duplicates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create the trigger
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
