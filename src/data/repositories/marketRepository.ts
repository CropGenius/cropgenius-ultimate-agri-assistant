// src/data/repositories/marketRepository.ts
/**
 * Repository for market data operations
 */

import { db } from '@/data/supabaseClient';
import { useApp } from '@/context/AppContext';

// Market listing entity type
export interface MarketListing {
  id: string;
  crop_type_id: string;
  crop_name: string;
  price_per_unit: number;
  currency: string;
  unit: string;
  quantity_available: number;
  location: string;
  seller_id?: string;
  seller_name?: string;
  contact_info?: string;
  listing_date: string;
  expiry_date?: string;
  source: string;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
  distance_km?: number; // Optional calculated field
}

// Price trend type for analytics
export interface PriceTrend {
  crop_type_id: string;
  crop_name: string;
  time_period: 'daily' | 'weekly' | 'monthly';
  data_points: {
    date: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    volume: number;
  }[];
  trend_direction: 'up' | 'down' | 'stable';
  percent_change: number;
}

// Demand signal type for analytics
export interface DemandSignal {
  crop_type_id: string;
  crop_name: string;
  demand_level: 'high' | 'medium' | 'low';
  forecast_period: 'short_term' | 'medium_term' | 'long_term';
  confidence: number;
  supporting_factors: string[];
}

// Market data filters
export interface MarketListingFilters {
  cropTypeId?: string;
  cropName?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  maxDistance?: number;
  sortBy?: 'price' | 'date' | 'distance' | 'quantity';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

// MarketRepository singleton
export const MarketRepository = {
  /**
   * Get market listings with flexible filtering
   */
  async getMarketListings(
    filters: MarketListingFilters = {}
  ): Promise<{ data: MarketListing[] | null; error: Error | null }> {
    // Use raw query for complex filtering
    let query = db.raw
      .from('market_listings')
      .select('*')
      .order(filters.sortBy || 'listing_date', {
        ascending: filters.sortDirection !== 'desc',
      });

    // Apply filters
    if (filters.cropTypeId) {
      query = query.eq('crop_type_id', filters.cropTypeId);
    }

    if (filters.cropName) {
      query = query.ilike('crop_name', `%${filters.cropName}%`);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price_per_unit', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price_per_unit', filters.maxPrice);
    }

    if (filters.fromDate) {
      query = query.gte('listing_date', filters.fromDate);
    }

    // Apply limit if provided
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: null,
        error: new Error(`Error fetching market listings: ${error.message}`),
      };
    }

    return { data, error: null };
  },

  /**
   * Get a specific market listing by ID
   */
  async getMarketListingById(
    listingId: string
  ): Promise<{ data: MarketListing | null; error: Error | null }> {
    const result = await db.find<MarketListing>({
      table: 'market_listings',
      filters: { id: listingId },
      singleRecord: true,
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  },

  /**
   * Get price trends for a specific crop
   */
  async getPriceTrends(
    cropTypeIdOrName: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    daysBack: number = 30
  ): Promise<{ data: PriceTrend | null; error: Error | null }> {
    // This would typically call a database function or a complex query
    // For now, we'll simulate calling an RPC function
    try {
      const { data, error } = await db.rpc<PriceTrend>('get_price_trends', {
        p_crop_identifier: cropTypeIdOrName,
        p_period: period,
        p_days_back: daysBack,
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      // If RPC isn't available yet, we could fall back to a basic query
      // This is a placeholder for future implementation
      console.warn(
        'Price trends RPC not implemented, falling back to basic query'
      );

      // Example of a fallback implementation using raw query
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await db.raw
        .from('market_listings')
        .select('listing_date, price_per_unit')
        .or(
          `crop_type_id.eq.${cropTypeIdOrName},crop_name.ilike.%${cropTypeIdOrName}%`
        )
        .gte('listing_date', startDate.toISOString())
        .order('listing_date', { ascending: true });

      if (error) {
        return {
          data: null,
          error: new Error(`Error fetching price trends: ${error.message}`),
        };
      }

      // Process raw data into a trend structure
      // This is simplified and would need a more robust implementation
      if (!data || data.length === 0) {
        return { data: null, error: null };
      }

      const trendData = {
        crop_type_id:
          typeof cropTypeIdOrName === 'number' ? cropTypeIdOrName : '',
        crop_name: typeof cropTypeIdOrName === 'string' ? cropTypeIdOrName : '',
        time_period: period,
        data_points: [],
        trend_direction: 'stable' as const,
        percent_change: 0,
      };

      // This is a placeholder for actual trend calculation
      return { data: trendData, error: null };
    }
  },

  /**
   * Get demand signals for a specific crop
   */
  async getDemandSignals(
    cropTypeIdOrName: string
  ): Promise<{ data: DemandSignal | null; error: Error | null }> {
    // This would typically call a database function or an AI prediction service
    // For now, we'll simulate calling an RPC function
    try {
      const { data, error } = await db.rpc<DemandSignal>('get_demand_signals', {
        p_crop_identifier: cropTypeIdOrName,
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      // Placeholder for future implementation
      console.warn('Demand signals RPC not implemented yet');
      return {
        data: null,
        error: new Error('Demand signal analysis not implemented yet'),
      };
    }
  },

  /**
   * Create a new market listing
   */
  async createMarketListing(
    listing: Omit<MarketListing, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: MarketListing | null; error: Error | null }> {
    const result = await db.insert<MarketListing>('market_listings', listing, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Update a market listing
   */
  async updateMarketListing(
    listingId: string,
    updates: Partial<Omit<MarketListing, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: MarketListing | null; error: Error | null }> {
    return db.update<MarketListing>(
      'market_listings',
      { id: listingId },
      updates,
      { returnData: true }
    );
  },

  /**
   * Delete a market listing
   */
  async deleteMarketListing(
    listingId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    const result = await db.delete('market_listings', { id: listingId });
    return {
      success: !result.error,
      error: result.error,
    };
  },
};

/**
 * Hook for market operations that automatically includes the current user and farm context
 * for personalized market insights
 */
export const useMarketRepository = () => {
  const { user, state } = useApp();
  const userId = user?.id;
  const { currentFarmId } = state;

  return {
    ...MarketRepository,

    /**
     * Get market listings with user context for personalization
     */
    getPersonalizedMarketListings: async (
      filters: MarketListingFilters = {}
    ): Promise<{ data: MarketListing[] | null; error: Error | null }> => {
      // This could later be enhanced to use user location, preferences, etc.
      // For now, just pass through to the standard method
      return MarketRepository.getMarketListings(filters);
    },

    /**
     * Create a market listing from the current user
     */
    createListingAsCurrentUser: async (
      listing: Omit<
        MarketListing,
        'id' | 'created_at' | 'updated_at' | 'seller_id'
      >
    ): Promise<{ data: MarketListing | null; error: Error | null }> => {
      if (!userId) {
        return { data: null, error: new Error('User not authenticated') };
      }

      return MarketRepository.createMarketListing({
        ...listing,
        seller_id: userId,
      });
    },
  };
};
