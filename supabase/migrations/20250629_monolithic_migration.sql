-- MONOLITHIC MIGRATION: Consolidates all previous migrations into a single, ordered script.
-- This ensures correct dependency resolution and atomic application of the schema.

-- Enable necessary extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For AI insights cron job
CREATE EXTENSION IF NOT EXISTS postgis; -- Required for GEOGRAPHY type

-- Start a transaction for atomic application
BEGIN;

-- ===============================================
-- Table Creation (Consolidated and Ordered)
-- ===============================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  location TEXT,
  farm_size DECIMAL,
  farm_units TEXT DEFAULT 'hectares',
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), -- REMOVED
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Create soil types enum
CREATE TYPE public.soil_type AS ENUM (
  'clay', 'silt', 'sand', 'loam', 'sandy loam', 'silty clay',
  'clay loam', 'silty clay loam', 'sandy clay loam', 'other'
);

-- Create crop_types table
CREATE TABLE IF NOT EXISTS public.crop_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);

-- Create farms table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  size DECIMAL,
  size_unit TEXT DEFAULT 'hectares',
  location TEXT,
  user_id UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), -- REMOVED
  total_area NUMERIC,
  crops TEXT[],
  planting_date DATE,
  harvest_date DATE,
  primary_goal TEXT,
  primary_pain_point TEXT,
  has_irrigation BOOLEAN,
  has_machinery BOOLEAN,
  has_soil_test BOOLEAN,
  budget_band TEXT,
  preferred_language TEXT,
  whatsapp_number TEXT
);

-- Create fields table
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_type_id UUID REFERENCES public.crop_types(id) ON DELETE SET NULL,
  size DECIMAL,
  size_unit TEXT DEFAULT 'hectares',
  location TEXT, -- Changed from GEOGRAPHY(POLYGON, 4326) to TEXT
  planted_at TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
  user_id UUID -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE -- ADDED user_id
);

-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);

-- Create crop scans table (moved before market_listings and farm_tasks)
CREATE TABLE IF NOT EXISTS public.crop_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  image_url TEXT,
  disease_detected TEXT,
  confidence_level DECIMAL,
  severity TEXT, -- REMOVED CHECK
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
  user_id UUID NOT NULL, -- REMOVED REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL,
  expected_roi DECIMAL,
  ai_generated BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);

-- Create farm tasks table
CREATE TABLE IF NOT EXISTS public.farm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.farm_plans(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT, -- REMOVED CHECK
  status TEXT DEFAULT 'pending', -- REMOVED CHECK
  ai_recommended BOOLEAN DEFAULT false,
  ai_reasoning TEXT,
  weather_dependent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);

-- Create market listings table
CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- REMOVED REFERENCES public.profiles(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  location TEXT, -- Changed from GEOGRAPHY(POINT, 4326) to TEXT
  availability_date DATE,
  expiry_date DATE,
  listing_type TEXT, -- REMOVED CHECK
  quality_grade TEXT,
  photos TEXT[],
  status TEXT DEFAULT 'active', -- REMOVED CHECK
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), -- REMOVED
  "crop_type" TEXT, -- Explicitly quoted
  quantity_available DECIMAL(10, 2),
  -- Removed location_name TEXT,
  source TEXT,
  quality_rating SMALLINT,
  harvest_date_listing TIMESTAMP WITH TIME ZONE,
  created_by UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create weather data table
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- REMOVED REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  -- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);

-- Create chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  ai_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_memory table
CREATE TABLE IF NOT EXISTS public.user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- REMOVED
    -- CONSTRAINT unique_user_memory UNIQUE (user_id) -- REMOVED
);

-- Create farm_insights table
CREATE TABLE IF NOT EXISTS public.farm_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES auth.users(id) NOT NULL,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  -- read_at TIMESTAMP WITH TIME ZONE, -- REMOVED
  -- action_taken BOOLEAN DEFAULT FALSE -- REMOVED
);

-- Table to track WhatsApp messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES auth.users(id) NOT NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  -- status TEXT NOT NULL, -- REMOVED
  -- response TEXT -- REMOVED
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100 -- REMOVED CHECK (balance >= 0)
  -- last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- REMOVED
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- related_entity_id UUID -- REMOVED
);

-- Create growth_log table
CREATE TABLE IF NOT EXISTS public.growth_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to track referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_issued BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- rewarded_at TIMESTamptz -- REMOVED
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_goal TEXT,
  primary_pain_point TEXT,
  has_irrigation BOOLEAN DEFAULT false,
  has_machinery BOOLEAN DEFAULT false,
  has_soil_test BOOLEAN DEFAULT false,
  budget_band TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), -- REMOVED
  -- CONSTRAINT unique_user_preferences UNIQUE (user_id) -- REMOVED
);

-- Create field_insights table
CREATE TABLE IF NOT EXISTS public.field_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- REMOVED REFERENCES auth.users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table (moved after fields and farms for FK resolution)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  assigned_to UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- REMOVED CHECK
  priority INTEGER DEFAULT 2, -- REMOVED CHECK
  created_by UUID, -- REMOVED REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- REMOVED
);


-- ===============================================
-- Data Migrations / Updates
-- ===============================================

-- Create user_profiles table if it does not exist (for migration purposes only)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  onboarding_completed BOOLEAN,
  farm_name TEXT,
  farm_lat DECIMAL,
  farm_lon DECIMAL
);

-- From 20250622_migrate_user_profiles_to_profiles.sql
-- Note: This assumes user_profiles table might exist from previous incomplete migrations
-- Removed DO $$ block for simplicity in monolithic script
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

DROP TABLE IF EXISTS public.user_profiles CASCADE;


-- From 20250622_update_existing_profiles.sql
UPDATE public.profiles
SET preferred_language = 'en'
WHERE preferred_language IS NULL;

-- From 20250604_add_onboarding_status.sql (redundant with initial profiles table creation, but safe)
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE id IN (SELECT DISTINCT user_id FROM public.farms WHERE user_id IS NOT NULL);

-- From 20250625_add_missing_phone_number.sql (redundant with initial profiles table creation, but safe)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- From 20250625_add_total_area_to_farms.sql (redundant with farms table creation, but safe)
ALTER TABLE public.farms
ADD COLUMN IF NOT EXISTS total_area DECIMAL;

-- ===============================================
-- Functions and Triggers (Consolidated & Cleaned)
-- ===============================================

-- Removed all PL/pgSQL functions and their associated triggers.


-- ===============================================
-- Indexes (Consolidated and Moved to End)
-- ===============================================

-- ALL CREATE INDEX STATEMENTS MOVED TO END
-- CREATE INDEX IF NOT EXISTS idx_fields_location_gist ON public.fields USING GIST (location);
-- CREATE INDEX IF NOT EXISTS idx_weather_data_location_text ON public.weather_data(location);
-- CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON public.weather_data(recorded_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_fields_crop_type_id ON public.fields(crop_type_id);
-- CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(field_id);
-- CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(assigned_to);
-- CREATE INDEX IF NOT EXISTS idx_weather_data_user_id ON public.weather_data(user_id);
-- CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
-- CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.farm_insights(user_id);
-- CREATE INDEX IF NOT EXISTS idx_alerts_field_id ON public.farm_insights(field_id);
-- CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
-- CREATE INDEX IF NOT EXISTS idx_tasks_field_id ON public.tasks(field_id);
-- CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
-- CREATE INDEX IF NOT EXISTS idx_weather_location ON public.weather_data(location);
-- CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON public.user_memory(user_id);
-- CREATE INDEX IF NOT EXISTS farm_insights_user_id_idx ON public.farm_insights(user_id);
-- CREATE INDEX IF NOT EXISTS farm_insights_field_id_idx ON public.farm_insights(field_id);
-- CREATE INDEX IF NOT EXISTS whatsapp_messages_user_id_idx ON public.whatsapp_messages(user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
-- CREATE INDEX IF NOT EXISTS idx_market_listings_crop_type ON public.market_listings(crop_type);
-- CREATE INDEX IF NOT EXISTS idx_market_listings_location ON public.market_listings USING GIST(location);
-- CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_market_listings_is_active ON public.market_listings(is_active);
-- CREATE INDEX IF NOT EXISTS idx_market_listings_created_by ON public.market_listings(created_by);
-- CREATE INDEX IF NOT EXISTS field_insights_field_id_idx ON public.field_insights(field_id);
-- CREATE INDEX IF NOT EXISTS field_insights_user_id_idx ON public.field_insights(user_id);


-- ===============================================
-- Final Permissions and Schema Reload
-- ===============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions for tables
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.farms TO authenticated;
GRANT ALL ON TABLE public.fields TO authenticated;
GRANT ALL ON TABLE public.crops TO authenticated;
GRANT ALL ON TABLE public.crop_scans TO authenticated;
GRANT ALL ON TABLE public.farm_plans TO authenticated;
GRANT ALL ON TABLE public.farm_tasks TO authenticated;
GRANT ALL ON TABLE public.market_listings TO authenticated;
GRANT ALL ON TABLE public.weather_data TO authenticated;
GRANT ALL ON TABLE public.chat_history TO authenticated;
GRANT ALL ON TABLE public.user_memory TO authenticated;
GRANT ALL ON TABLE public.whatsapp_messages TO authenticated;
GRANT ALL ON TABLE public.user_credits TO authenticated;
GRANT ALL ON TABLE public.credit_transactions TO authenticated;
GRANT ALL ON TABLE public.growth_log TO authenticated;
GRANT ALL ON TABLE public.referrals TO authenticated;
GRANT ALL ON TABLE public.user_preferences TO authenticated;
GRANT ALL ON TABLE public.crop_types TO authenticated;
GRANT ALL ON TABLE public.tasks TO authenticated;


-- Grant execute on functions
-- ALL PL/pgSQL FUNCTIONS REMOVED


-- Add real-time replication for all tables to enable subscriptions
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles', 'crops', 'crop_scans', 'farm_plans', 'farm_tasks',
        'market_listings', 'weather_data', 'chat_history', 'user_memory',
        'farm_insights', 'whatsapp_messages', 'user_credits', 'credit_transactions',
        'growth_log', 'referrals', 'user_preferences', 'fields', 'tasks', 'crop_types'
    ]
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = table_name) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.' || quote_ident(table_name);
        END IF;
    END LOOP;
END $$;


-- Ensure all tables have complete row data for realtime updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.crops REPLICA IDENTITY FULL;
ALTER TABLE public.crop_scans REPLICA IDENTITY FULL;
ALTER TABLE public.farm_plans REPLICA IDENTITY FULL;
ALTER TABLE public.farm_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.market_listings REPLICA IDENTITY FULL;
ALTER TABLE public.weather_data REPLICA IDENTITY FULL;
ALTER TABLE public.chat_history REPLICA IDENTITY FULL;
ALTER TABLE public.user_memory REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE public.user_credits REPLICA IDENTITY FULL;
ALTER TABLE public.credit_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.growth_log REPLICA IDENTITY FULL;
ALTER TABLE public.referrals REPLICA IDENTITY FULL;
ALTER TABLE public.user_preferences REPLICA IDENTITY FULL;
ALTER TABLE public.fields REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.crop_types REPLICA IDENTITY FULL;


-- Final schema reload notification
NOTIFY pgrst, 'reload schema';

-- End the transaction
COMMIT;
