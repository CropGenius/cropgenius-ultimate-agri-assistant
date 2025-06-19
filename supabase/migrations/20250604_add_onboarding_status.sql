-- Add onboarding_completed flag to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Retroactively mark existing users with farms as onboarded
-- This prevents locking out users who created farms before this migration
UPDATE public.user_profiles
SET onboarding_completed = TRUE
WHERE id IN (SELECT DISTINCT user_id FROM public.farms WHERE user_id IS NOT NULL);

-- Add a comment for clarity
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Indicates whether the user has completed the initial setup/onboarding flow.';
