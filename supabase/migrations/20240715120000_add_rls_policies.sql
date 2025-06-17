-- Enable Row Level Security (RLS) for user-related tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate (optional but good practice)
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own farms." ON public.farms;
DROP POLICY IF EXISTS "Users can insert their own farms." ON public.farms;
DROP POLICY IF EXISTS "Users can update their own farms." ON public.farms;
DROP POLICY IF EXISTS "Users can delete their own farms." ON public.farms;

-- Create policies for the 'profiles' table
-- 1. Users can view their own profile.
CREATE POLICY "Users can view their own profile." 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile.
CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policies for the 'farms' table
-- 1. Users can view their own farms.
CREATE POLICY "Users can view their own farms." 
ON public.farms FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert new farms for themselves.
CREATE POLICY "Users can insert their own farms." 
ON public.farms FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own farms.
CREATE POLICY "Users can update their own farms." 
ON public.farms FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own farms.
CREATE POLICY "Users can delete their own farms." 
ON public.farms FOR DELETE
USING (auth.uid() = user_id);
