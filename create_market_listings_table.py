#!/usr/bin/env python3
"""
Script to create the market_listings table in the Supabase database.
"""

import requests
import json
import os

# Configuration
SUPABASE_URL = "https://bapqlyvfwxsichlyjxpd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g"

# SQL script to create the market_listings table
SQL_SCRIPT = """
-- Create market_listings table
CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  variety TEXT,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity_available DECIMAL(10, 2),
  location_name TEXT,
  location_lat DECIMAL(10, 6),
  location_lng DECIMAL(10, 6),
  source TEXT NOT NULL DEFAULT 'user_input',
  quality_rating SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  harvest_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Add helpful comments
COMMENT ON TABLE public.market_listings IS 'Market price listings for crops across African markets';
COMMENT ON COLUMN public.market_listings.crop_type IS 'Type of crop (Maize, Cassava, Beans, etc.)';
COMMENT ON COLUMN public.market_listings.source IS 'Data source: user_input, api_integration, web_scraped, partner_feed';
COMMENT ON COLUMN public.market_listings.quality_rating IS 'Quality rating from 1-5 (5 being highest quality)';

-- Enable Row Level Security
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_listings_crop_type ON public.market_listings(crop_type);
CREATE INDEX IF NOT EXISTS idx_market_listings_location ON public.market_listings(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_active ON public.market_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_market_listings_price ON public.market_listings(price_per_unit);

-- RLS Policies for Market Intelligence

-- Policy 1: Allow all users to read active market listings
CREATE POLICY "market_listings_read_active" 
ON public.market_listings 
FOR SELECT 
USING (is_active = true);

-- Policy 2: Allow authenticated users to insert their own listings
CREATE POLICY "market_listings_insert_own" 
ON public.market_listings 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Policy 3: Allow users to update their own listings
CREATE POLICY "market_listings_update_own" 
ON public.market_listings 
FOR UPDATE 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

-- Policy 4: Allow users to view their own inactive listings
CREATE POLICY "market_listings_read_own_inactive" 
ON public.market_listings 
FOR SELECT 
USING (auth.uid() = created_by AND is_active = false);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for market_listings
DROP TRIGGER IF EXISTS update_market_listings_updated_at ON public.market_listings;
CREATE TRIGGER update_market_listings_updated_at
    BEFORE UPDATE ON public.market_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample African market data
INSERT INTO public.market_listings (
  crop_type, variety, price_per_unit, unit, quantity_available, 
  location_name, location_lat, location_lng, source, quality_rating, 
  harvest_date, is_active
) VALUES 
  -- Kenya Markets
  ('Maize', 'Yellow Dent', 0.35, 'kg', 2500, 'Nairobi Central Market', -1.286389, 36.817223, 'api_integration', 4, NOW() - INTERVAL '30 days', true),
  ('Tomato', 'Roma', 0.80, 'kg', 500, 'Mombasa Market', -4.043477, 39.658871, 'user_input', 5, NOW() - INTERVAL '7 days', true),
  ('Beans', 'Kidney Beans', 1.10, 'kg', 800, 'Kisumu Market', -0.091702, 34.767956, 'partner_feed', 4, NOW() - INTERVAL '14 days', true),
  
  -- Nigeria Markets  
  ('Cassava', 'Sweet Cassava', 0.25, 'kg', 1800, 'Lagos State Market', 6.5244, 3.3792, 'user_input', 3, NOW() - INTERVAL '14 days', true),
  ('Yam', 'White Yam', 0.45, 'kg', 1200, 'Kano Market', 12.0022, 8.5920, 'web_scraped', 4, NOW() - INTERVAL '21 days', true),
  ('Rice', 'Local Rice', 0.95, 'kg', 3000, 'Port Harcourt Market', 4.8156, 7.0498, 'api_integration', 3, NOW() - INTERVAL '45 days', true),
  
  -- Ghana Markets
  ('Cocoa', 'Trinitario', 2.20, 'kg', 500, 'Accra Central Market', 5.6037, -0.1870, 'partner_feed', 5, NOW() - INTERVAL '7 days', true),
  ('Plantain', 'False Horn', 0.60, 'kg', 1500, 'Kumasi Market', 6.6885, -1.6244, 'user_input', 4, NOW() - INTERVAL '10 days', true),
  
  -- Uganda Markets
  ('Coffee', 'Arabica', 3.50, 'kg', 200, 'Kampala Market', 0.3476, 32.5825, 'api_integration', 5, NOW() - INTERVAL '21 days', true),
  ('Matooke', 'Green Bananas', 0.40, 'kg', 800, 'Jinja Market', 0.4236, 33.2042, 'user_input', 4, NOW() - INTERVAL '5 days', true),
  
  -- Ethiopia Markets
  ('Teff', 'White Teff', 1.80, 'kg', 600, 'Addis Ababa Market', 9.1450, 40.4897, 'web_scraped', 4, NOW() - INTERVAL '28 days', true),
  ('Sorghum', 'Red Sorghum', 0.55, 'kg', 1000, 'Dire Dawa Market', 9.5915, 41.8661, 'partner_feed', 3, NOW() - INTERVAL '35 days', true);
"""

def execute_sql():
    """Execute SQL script against Supabase database"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    # Try to execute the SQL script directly
    try:
        # First, try to create the table using the REST API
        print("Attempting to create market_listings table...")
        
        # Split the SQL script into individual statements
        statements = SQL_SCRIPT.split(';')
        
        for statement in statements:
            if statement.strip():
                # Execute each statement separately
                payload = {
                    "sql": statement.strip() + ";"
                }
                
                response = requests.post(url, headers=headers, json=payload)
                
                if response.status_code == 200:
                    print(f"Successfully executed SQL statement: {statement[:50]}...")
                else:
                    print(f"Error executing SQL statement: {response.status_code} - {response.text}")
                    print(f"Statement: {statement}")
        
        print("Finished executing SQL script.")
        
    except Exception as e:
        print(f"Error executing SQL script: {str(e)}")
        
        # Fallback: Try to create the table using the REST API directly
        try:
            print("Attempting to create market_listings table using REST API...")
            
            # Create the table
            url = f"{SUPABASE_URL}/rest/v1/market_listings"
            response = requests.post(url, headers=headers, json={})
            
            if response.status_code == 201:
                print("Successfully created market_listings table.")
            else:
                print(f"Error creating market_listings table: {response.status_code} - {response.text}")
        
        except Exception as e:
            print(f"Error creating market_listings table using REST API: {str(e)}")

if __name__ == "__main__":
    execute_sql()