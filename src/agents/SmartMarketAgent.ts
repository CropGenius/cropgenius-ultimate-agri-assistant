// src/agents/SmartMarketAgent.ts

/**
 * @file SmartMarketAgent.ts
 * @description Agent for fetching and processing agricultural market data.
 */

import { supabase } from '../services/supabaseClient';

// --- Interface Definitions ---

export interface MarketDataInput {
  cropType: string; // e.g., 'Maize', 'Tomato'
  latitude?: number; // For location-based search
  longitude?: number; // For location-based search
  radiusKm?: number; // Search radius in kilometers
  userId?: string;
}

// Interface matching the new market_listings table schema
export interface MarketListing {
  id: string; // UUID
  crop_type: string;
  variety?: string | null;
  price_per_unit: number; // DECIMAL(10, 2)
  unit: string; // e.g., 'kg', 'sack', 'ton'
  quantity_available?: number | null; // DECIMAL(10, 2)
  // location: GEOGRAPHY(POINT, 4326) - not directly used in JS, use location_name or lat/lon
  location_name?: string | null;
  source: string; // 'user_input', 'api_integration', 'web_scraped', 'partner_feed'
  quality_rating?: number | null; // SMALLINT (1-5)
  harvest_date?: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  created_by?: string | null; // UUID, Foreign Key to auth.users
  is_active: boolean;
  // GeoJSON representation of location, if fetched using ST_AsGeoJSON
  location_geojson?: { type: "Point", coordinates: [number, number] } | null;
}

export interface MarketDataOutput {
  cropType: string;
  listings: MarketListing[];
  priceTrends?: any; // Placeholder
  demandIndicator?: string; // Placeholder
}

// --- Core Agent Functions ---

/**
 * Fetches market data for a given crop type from the 'market_listings' table.
 * Can filter by location if latitude, longitude, and radiusKm are provided.
 */
export const fetchMarketListings = async (
  input: MarketDataInput
): Promise<MarketDataOutput> => {
  const { cropType, latitude, longitude, radiusKm, userId } = input;

  console.log(`Fetching market listings for crop: ${cropType}`, input);

  try {
    let query = supabase
      .from('market_listings')
      // Select specific columns including location as GeoJSON
      .select('*, location_geojson:location(geojson)') // Assuming 'geojson' is a PostGIS function or cast
      // Alternative if direct geojson cast is not setup: ST_AsGeoJSON(location) as location_geojson
      // However, Supabase client might not support function calls in select directly like that.
      // For simplicity, we might fetch all and rely on location_name for display,
      // or have a dedicated PostgREST function for spatial queries.
      // For now, standard select:
      // .select('id, crop_type, variety, price_per_unit, unit, quantity_available, location_name, source, quality_rating, harvest_date, created_at, created_by, is_active')
      .select('*') // Keep it simple for now, RLS will filter rows. Add ST_AsGeoJSON if possible via view or function.
      .eq('crop_type', cropType)
      .eq('is_active', true); // Only fetch active listings by default (RLS also enforces this for public)

    if (latitude && longitude && radiusKm) {
      // For location-based filtering, it's best to use a PostgREST function (rpc call)
      // that performs the ST_DWithin query, as Supabase client's .filter() might not directly support PostGIS functions.
      // Example RPC call (if you create a function like 'get_listings_near_location'):
      // query = query.rpc('get_listings_near_location', {
      //   lat: latitude,
      //   long: longitude,
      //   radius_km: radiusKm,
      //   cropfilter: cropType
      // });
      // For now, without RPC, location filtering is omitted here but noted as a needed enhancement.
      console.warn("Location-based filtering not yet implemented in fetchMarketListings. Fetching all for crop type.");
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching market listings:', error);
      throw error;
    }

    const listings: MarketListing[] = (data as MarketListing[]) || [];

    return {
      cropType,
      listings,
    };

  } catch (error) {
    console.error('Error in fetchMarketListings:', error);
    throw error;
  }
};

console.log('SmartMarketAgent.ts updated and loaded');
