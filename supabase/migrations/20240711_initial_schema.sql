
-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  location TEXT,
  farm_size DECIMAL,
  farm_units TEXT DEFAULT 'hectares',
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create soil types enum
CREATE TYPE public.soil_type AS ENUM (
  'clay',
  'silt',
  'sand',
  'loam',
  'sandy loam',
  'silty clay',
  'clay loam',
  'silty clay loam',
  'sandy clay loam',
  'other'
);

-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  field_location JSONB,
  field_size DECIMAL,
  field_units TEXT DEFAULT 'hectares',
  soil_type soil_type,
  irrigation_type TEXT,
  notes TEXT,
  growth_stage TEXT,
  health_status TEXT DEFAULT 'healthy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scan results table
CREATE TABLE IF NOT EXISTS public.crop_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  image_url TEXT,
  disease_detected TEXT,
  confidence_level DECIMAL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  affected_area DECIMAL,
  recommended_treatments TEXT[],
  preventive_measures TEXT[],
  similar_cases_nearby INTEGER,
  estimated_yield_impact DECIMAL,
  treatment_products JSONB,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create farm plans table
CREATE TABLE IF NOT EXISTS public.farm_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL,
  expected_roi DECIMAL,
  ai_generated BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create farm tasks table
CREATE TABLE IF NOT EXISTS public.farm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.farm_plans(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  ai_recommended BOOLEAN DEFAULT false,
  ai_reasoning TEXT,
  weather_dependent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create market listings table
CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  location TEXT,
  availability_date DATE,
  expiry_date DATE,
  listing_type TEXT CHECK (listing_type IN ('sell', 'buy')),
  quality_grade TEXT,
  photos TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weather data table
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  location_name TEXT,
  temperature DECIMAL,
  humidity DECIMAL,
  precipitation DECIMAL,
  wind_speed DECIMAL,
  wind_direction TEXT,
  uv_index DECIMAL,
  forecast JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  ai_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Crops policies
CREATE POLICY "Users can view their own crops" 
ON public.crops FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crops" 
ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops" 
ON public.crops FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops" 
ON public.crops FOR DELETE USING (auth.uid() = user_id);

-- Crop scans policies
CREATE POLICY "Users can view their own crop scans" 
ON public.crop_scans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crop scans" 
ON public.crop_scans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop scans" 
ON public.crop_scans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop scans" 
ON public.crop_scans FOR DELETE USING (auth.uid() = user_id);

-- Farm plans policies
CREATE POLICY "Users can view their own farm plans" 
ON public.farm_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm plans" 
ON public.farm_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm plans" 
ON public.farm_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm plans" 
ON public.farm_plans FOR DELETE USING (auth.uid() = user_id);

-- Farm tasks policies
CREATE POLICY "Users can view their own farm tasks" 
ON public.farm_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.farm_plans 
    WHERE farm_plans.id = farm_tasks.plan_id 
    AND farm_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own farm tasks" 
ON public.farm_tasks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.farm_plans 
    WHERE farm_plans.id = farm_tasks.plan_id 
    AND farm_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own farm tasks" 
ON public.farm_tasks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.farm_plans 
    WHERE farm_plans.id = farm_tasks.plan_id 
    AND farm_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own farm tasks" 
ON public.farm_tasks FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.farm_plans 
    WHERE farm_plans.id = farm_tasks.plan_id 
    AND farm_plans.user_id = auth.uid()
  )
);

-- Market listings policies
CREATE POLICY "Anyone can view active market listings" 
ON public.market_listings FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view all their own market listings" 
ON public.market_listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own market listings" 
ON public.market_listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own market listings" 
ON public.market_listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own market listings" 
ON public.market_listings FOR DELETE USING (auth.uid() = user_id);

-- Weather data policies
CREATE POLICY "Users can view their own weather data" 
ON public.weather_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather data" 
ON public.weather_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather data" 
ON public.weather_data FOR UPDATE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view their own chat history" 
ON public.chat_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" 
ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add real-time replication for all tables to enable subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;

-- Ensure all tables have complete row data for realtime updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.crops REPLICA IDENTITY FULL;
ALTER TABLE public.crop_scans REPLICA IDENTITY FULL;
ALTER TABLE public.farm_plans REPLICA IDENTITY FULL;
ALTER TABLE public.farm_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.market_listings REPLICA IDENTITY FULL;
ALTER TABLE public.weather_data REPLICA IDENTITY FULL;
ALTER TABLE public.chat_history REPLICA IDENTITY FULL;
