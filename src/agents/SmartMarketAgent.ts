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

// Interface matching the market_prices table schema
export interface MarketListing {
  id: string;
  crop_name: string;
  created_at: string;
  price: number;
  source: string | null;
  date_recorded: string;
  currency: string;
  location: string;
}

export interface MarketDataOutput {
  cropType: string;
  listings: MarketListing[];
  priceTrends?: any; // Placeholder
  demandIndicator?: string; // Placeholder
}

// --- Core Agent Functions ---

/**
 * Fetches market data for a given crop type from the 'market_prices' table.
 * Can filter by location if latitude, longitude, and radiusKm are provided.
 */
export const fetchMarketListings = async (
  input: MarketDataInput
): Promise<MarketDataOutput> => {
  const { cropType, latitude, longitude, radiusKm, userId } = input;

  console.log(`Fetching market listings for crop: ${cropType}`, input);

  try {
    let query = supabase
      .from('market_prices')
      .select('*')
      .ilike('crop_name', cropType)
      .order('date_recorded', { ascending: false });

    if (latitude && longitude && radiusKm) {
      console.warn("Location-based filtering not yet implemented in fetchMarketListings. Fetching all for crop type.");
    }

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
