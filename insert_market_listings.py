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

# Sample market listings data
SAMPLE_DATA = [
    # Kenya Markets
    {
        "crop_type": "Maize",
        "variety": "Yellow Dent",
        "price_per_unit": 0.35,
        "unit": "kg",
        "quantity_available": 2500,
        "location_name": "Nairobi Central Market",
        "location_lat": -1.286389,
        "location_lng": 36.817223,
        "source": "api_integration",
        "quality_rating": 4,
        "is_active": True
    },
    {
        "crop_type": "Tomato",
        "variety": "Roma",
        "price_per_unit": 0.80,
        "unit": "kg",
        "quantity_available": 500,
        "location_name": "Mombasa Market",
        "location_lat": -4.043477,
        "location_lng": 39.658871,
        "source": "user_input",
        "quality_rating": 5,
        "is_active": True
    },
    {
        "crop_type": "Beans",
        "variety": "Kidney Beans",
        "price_per_unit": 1.10,
        "unit": "kg",
        "quantity_available": 800,
        "location_name": "Kisumu Market",
        "location_lat": -0.091702,
        "location_lng": 34.767956,
        "source": "partner_feed",
        "quality_rating": 4,
        "is_active": True
    },
    # Nigeria Markets
    {
        "crop_type": "Cassava",
        "variety": "Sweet Cassava",
        "price_per_unit": 0.25,
        "unit": "kg",
        "quantity_available": 1800,
        "location_name": "Lagos State Market",
        "location_lat": 6.5244,
        "location_lng": 3.3792,
        "source": "user_input",
        "quality_rating": 3,
        "is_active": True
    },
    {
        "crop_type": "Yam",
        "variety": "White Yam",
        "price_per_unit": 0.45,
        "unit": "kg",
        "quantity_available": 1200,
        "location_name": "Kano Market",
        "location_lat": 12.0022,
        "location_lng": 8.5920,
        "source": "web_scraped",
        "quality_rating": 4,
        "is_active": True
    },
    {
        "crop_type": "Rice",
        "variety": "Local Rice",
        "price_per_unit": 0.95,
        "unit": "kg",
        "quantity_available": 3000,
        "location_name": "Port Harcourt Market",
        "location_lat": 4.8156,
        "location_lng": 7.0498,
        "source": "api_integration",
        "quality_rating": 3,
        "is_active": True
    },
    # Ghana Markets
    {
        "crop_type": "Cocoa",
        "variety": "Trinitario",
        "price_per_unit": 2.20,
        "unit": "kg",
        "quantity_available": 500,
        "location_name": "Accra Central Market",
        "location_lat": 5.6037,
        "location_lng": -0.1870,
        "source": "partner_feed",
        "quality_rating": 5,
        "is_active": True
    },
    {
        "crop_type": "Plantain",
        "variety": "False Horn",
        "price_per_unit": 0.60,
        "unit": "kg",
        "quantity_available": 1500,
        "location_name": "Kumasi Market",
        "location_lat": 6.6885,
        "location_lng": -1.6244,
        "source": "user_input",
        "quality_rating": 4,
        "is_active": True
    },
    # Uganda Markets
    {
        "crop_type": "Coffee",
        "variety": "Arabica",
        "price_per_unit": 3.50,
        "unit": "kg",
        "quantity_available": 200,
        "location_name": "Kampala Market",
        "location_lat": 0.3476,
        "location_lng": 32.5825,
        "source": "api_integration",
        "quality_rating": 5,
        "is_active": True
    },
    {
        "crop_type": "Matooke",
        "variety": "Green Bananas",
        "price_per_unit": 0.40,
        "unit": "kg",
        "quantity_available": 800,
        "location_name": "Jinja Market",
        "location_lat": 0.4236,
        "location_lng": 33.2042,
        "source": "user_input",
        "quality_rating": 4,
        "is_active": True
    },
    # Ethiopia Markets
    {
        "crop_type": "Teff",
        "variety": "White Teff",
        "price_per_unit": 1.80,
        "unit": "kg",
        "quantity_available": 600,
        "location_name": "Addis Ababa Market",
        "location_lat": 9.1450,
        "location_lng": 40.4897,
        "source": "web_scraped",
        "quality_rating": 4,
        "is_active": True
    },
    {
        "crop_type": "Sorghum",
        "variety": "Red Sorghum",
        "price_per_unit": 0.55,
        "unit": "kg",
        "quantity_available": 1000,
        "location_name": "Dire Dawa Market",
        "location_lat": 9.5915,
        "location_lng": 41.8661,
        "source": "partner_feed",
        "quality_rating": 3,
        "is_active": True
    }
]

def insert_sample_data():
    """Insert sample data into the market_listings table"""
    url = f"{SUPABASE_URL}/rest/v1/market_listings"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Prefer": "return=minimal"
    }
    
    print("Inserting sample market listings data...")
    
    for i, listing in enumerate(SAMPLE_DATA):
        try:
            response = requests.post(url, headers=headers, json=listing)
            
            if response.status_code == 201:
                print(f"Successfully inserted listing {i+1}/{len(SAMPLE_DATA)}: {listing['crop_type']} - {listing['location_name']}")
            else:
                print(f"Error inserting listing {i+1}/{len(SAMPLE_DATA)}: {response.status_code} - {response.text}")
                print(f"Listing: {listing}")
            
            # Add a small delay to avoid rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error inserting listing {i+1}/{len(SAMPLE_DATA)}: {str(e)}")
    
    print("Finished inserting sample data.")

if __name__ == "__main__":
    insert_sample_data()