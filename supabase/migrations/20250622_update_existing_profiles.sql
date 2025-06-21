-- Set default preferred_language for any existing profiles where it's NULL
UPDATE public.profiles 
SET preferred_language = 'en' 
WHERE preferred_language IS NULL;
