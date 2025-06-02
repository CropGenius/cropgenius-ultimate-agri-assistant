// src/agents/SmartMarketAgent.ts

/**
 * @file SmartMarketAgent.ts
 * @description Agent for fetching and processing agricultural market data.
 */

import { supabase } from '../services/supabaseClient';

// --- Interface Definitions ---

export interface MarketDataInput {
  cropType: string; // e.g., 'Maize', 'Tomato'
  location?: string; // e.g., 'Nairobi', 'Kiambu County' - for future use with more granular data
  userId?: string; // To tailor results or check user's own listings
  farmId?: string; // To associate market data with a specific farm context if needed
}

export interface MarketListing {
  id: string;
  crop_type: string;
  farm_id?: string | null;
  listed_by_user_id?: string | null;
  quantity_kg: number;
  price_per_kg_ksh: number;
  listing_date: string; // ISO date string
  description?: string | null;
  location_text?: string | null; // For display
  // Add other relevant fields from your market_listings table
}

export interface MarketDataOutput {
  cropType: string;
  listings: MarketListing[];
  priceTrends?: any; // Placeholder for future trend analysis
  demandIndicator?: string; // e.g., 'High', 'Medium', 'Low' - Placeholder
}

// --- Core Agent Functions ---

/**
 * Fetches market data for a given crop type from the Supabase 'market_listings' table.
 */
export const fetchMarketListings = async (
  input: MarketDataInput
): Promise<MarketDataOutput> => {
  const { cropType, userId, farmId } = input;

  console.log(`Fetching market listings for crop: ${cropType}, user: ${userId}, farm: ${farmId}`);

  try {
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .eq('crop_type', cropType)
      // Add more filters as needed, e.g., by location, or to exclude user's own listings if desired
      // .neq('listed_by_user_id', userId) // Example: if you want to see listings by others
      .order('listing_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching market listings:', error);
      throw error;
    }

    const listings: MarketListing[] = data || [];

    // Basic processing: For now, just return the fetched listings.
    // Future enhancements: calculate price trends, demand indicators, etc.
    return {
      cropType,
      listings,
      // priceTrends: calculatePriceTrends(listings), // Implement this later
      // demandIndicator: assessDemand(listings), // Implement this later
    };

  } catch (error) {
    console.error('Error in fetchMarketListings:', error);
    throw error;
  }
};

// --- Placeholder for future analytical functions ---
// const calculatePriceTrends = (listings: MarketListing[]) => { /* ... */ };
// const assessDemand = (listings: MarketListing[]) => { /* ... */ };

console.log('SmartMarketAgent.ts loaded');
