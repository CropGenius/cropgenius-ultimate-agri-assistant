-- Add to 20250621_initial_schema.sql or create a new migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Market listings table for tracking crop prices and availability
CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_type TEXT NOT NULL, -- e.g., Maize, Tomato from crop_types table if linked, or free text
  variety TEXT,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,  -- e.g., 'kg', 'sack', 'ton'
  quantity_available DECIMAL(10, 2),
  location GEOGRAPHY(POINT, 4326),  -- For spatial queries
  location_name TEXT,  -- Human-readable location
  source TEXT NOT NULL,  -- 'user_input', 'api_integration', 'web_scraped', 'partner_feed'
  quality_rating SMALLINT,  -- 1-5 scale, NULLable if not always available
  harvest_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Comments for clarity based on further thought
COMMENT ON COLUMN public.market_listings.crop_type IS 'Could reference public.crop_types(name) or be free text. Consider FK if always from predefined list.';
COMMENT ON COLUMN public.market_listings.source IS 'Indicates the origin of the listing data.';

-- Enable RLS
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_crop_type ON public.market_listings(crop_type);
CREATE INDEX IF NOT EXISTS idx_market_listings_location ON public.market_listings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings(created_at DESC); -- often sorted by newest
CREATE INDEX IF NOT EXISTS idx_market_listings_is_active ON public.market_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_by ON public.market_listings(created_by);


-- RLS Policies
-- Policy 1: Public read access for active listings
CREATE POLICY "Enable read access for active listings for all users"
  ON public.market_listings
  FOR SELECT
  USING (is_active = true);

-- Policy 2: Authenticated users can insert listings, setting themselves as created_by
CREATE POLICY "Enable insert for authenticated users"
  ON public.market_listings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Policy 3: Users can update their own listings
CREATE POLICY "Enable update for own listings"
  ON public.market_listings
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy 4: Users can deactivate (soft delete) their own listings by setting is_active = false
-- For actual DELETE, a separate, more restrictive policy or no policy (allowing only admin deletes) might be desired.
-- This example focuses on deactivation.
CREATE POLICY "Enable deactivation for own listings"
  ON public.market_listings
  FOR UPDATE -- Using UPDATE to set is_active = false
  USING (auth.uid() = created_by AND is_active = true)
  WITH CHECK (auth.uid() = created_by); -- Ensures they can only modify their own. is_active check in using is for selection

-- Policy 5: Users can view their own inactive listings (complement to policy 1)
CREATE POLICY "Users can view their own inactive listings"
  ON public.market_listings
  FOR SELECT
  USING (auth.uid() = created_by AND is_active = false);


-- Function to update updated_at timestamp (already defined in 20250621_initial_schema.sql)
-- Ensure it exists or create it if this migration could run independently.
-- CREATE OR REPLACE FUNCTION public.update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- Ensure the trigger is specific to this table if the function is generic
DROP TRIGGER IF EXISTS update_market_listings_updated_at ON public.market_listings; -- Drop if exists to avoid conflict
CREATE TRIGGER update_market_listings_updated_at
BEFORE UPDATE ON public.market_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
