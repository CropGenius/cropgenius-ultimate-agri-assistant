#!/usr/bin/env python3
"""
Script to create the market_listings table in the Supabase database using REST API.
"""

import requests
import json
import time

# Configuration
SUPABASE_URL = "https://bapqlyvfwxsichlyjxpd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g"

# SQL script to create the market_listings table
SQL_SCRIPT = """
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
"""

def create_table():
    """Create the market_listings table using the Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    payload = {
        "query": SQL_SCRIPT
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("Successfully created market_listings table.")
            return True
        else:
            print(f"Error creating market_listings table: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error creating market_listings table: {str(e)}")
        return False

if __name__ == "__main__":
    create_table()