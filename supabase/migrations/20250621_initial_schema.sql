-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  role user_role DEFAULT 'farmer',
  preferred_language TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  farm_name TEXT,
  farm_size DECIMAL,
  farm_units farm_size_unit DEFAULT 'hectares',
  location TEXT -- Store as 'lat,lng' for simplicity
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile." 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create farms table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  size DECIMAL,
  size_unit farm_size_unit DEFAULT 'hectares',
  location TEXT, -- Store as 'lat,lng'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on farms
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Create policies for farms
CREATE POLICY "Users can view their own farms." 
  ON public.farms FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own farms." 
  ON public.farms 
  USING (auth.uid() = user_id);

-- Create crop_types table
CREATE TABLE IF NOT EXISTS public.crop_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fields table
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_type_id UUID REFERENCES public.crop_types(id) ON DELETE SET NULL,
  size DECIMAL,
  size_unit farm_size_unit DEFAULT 'hectares',
  location GEOGRAPHY(POLYGON, 4326),
  planted_at TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on fields
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Create policies for fields
CREATE POLICY "Fields are viewable by users who can view the farm." 
  ON public.fields FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = fields.farm_id 
    AND (farms.user_id = auth.uid())
  ));

CREATE POLICY "Users can manage fields in their farms." 
  ON public.fields 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = fields.farm_id 
    AND farms.user_id = auth.uid()
  ));

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status task_status DEFAULT 'pending',
  priority INTEGER DEFAULT 2, -- 1: High, 2: Medium, 3: Low
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Tasks are viewable by users who can view the field." 
  ON public.tasks FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.fields 
    JOIN public.farms ON fields.farm_id = farms.id
    WHERE fields.id = tasks.field_id 
    AND (farms.user_id = auth.uid() OR tasks.assigned_to = auth.uid())
  ));

CREATE POLICY "Users can manage tasks in their farms." 
  ON public.tasks 
  USING (EXISTS (
    SELECT 1 FROM public.fields 
    JOIN public.farms ON fields.farm_id = farms.id
    WHERE fields.id = tasks.field_id 
    AND farms.user_id = auth.uid()
  ));

-- Create weather_data table
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL, -- Store as 'lat,lng'
  temperature DECIMAL,
  humidity DECIMAL,
  rainfall DECIMAL,
  wind_speed DECIMAL,
  wind_direction INTEGER,
  condition TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  forecast_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_field_id ON public.tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_weather_location ON public.weather_data(location);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at
BEFORE UPDATE ON public.fields
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    preferred_language,
    onboarding_completed,
    phone_number,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    FALSE,
    NEW.phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = NOW();
    
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to handle new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $
BEGIN
  -- Delete related data
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to handle user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();

-- Create a function to get user's farms
CREATE OR REPLACE FUNCTION public.get_user_farms(user_id UUID)
RETURNS SETOF public.farms AS $
BEGIN
  RETURN QUERY
  SELECT * FROM public.farms
  WHERE farms.user_id = get_user_farms.user_id;
END;
$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions for profiles table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Grant permissions for farms table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farms TO authenticated;

-- Grant permissions for fields table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fields TO authenticated;

-- Grant permissions for tasks table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;

-- Grant permissions for crop_types table
GRANT SELECT ON public.crop_types TO authenticated;

-- Grant permissions for weather_data table
GRANT SELECT, INSERT ON public.weather_data TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_deleted() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_farms(user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
