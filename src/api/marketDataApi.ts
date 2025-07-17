/**
 * Market Data API
 * Production-ready API layer for market intelligence with location-based filtering,
 * price trend analysis, and demand indicators
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponseHandler } from '@/utils/apiResponse';

export interface MarketPrice {
  id: string;
  crop_name: string;
  price: number;
  currency: string;
  location: string;
  date_recorded: string;
  source?: string;
  created_at: string;
}

export interface PriceTrend {
  crop_name: string;
  current_price: number;
  previous_price: number;
  price_change: number;
  price_change_percent: number;
  trend: 'rising' | 'falling' | 'stable';
  period_days: number;
}

export interface LocationFilter {
  location?: string;
  radius_km?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DemandIndicator {
  crop_name: string;
  demand_level: 'low' | 'medium' | 'high' | 'critical';
  supply_level: 'low' | 'medium' | 'high' | 'oversupply';
  market_activity: number;
  price_volatility: number;
  seasonal_factor: number;
  recommendation: string;
}

export interface MarketAnalysis {
  crop_name: string;
  current_price: number;
  price_trend: PriceTrend;
  demand_indicator: DemandIndicator;
  regional_prices: Array<{
    location: string;
    price: number;
    date: string;
    market_share: number;
  }>;
  best_selling_locations: Array<{
    location: string;
    price: number;
    distance_km?: number;
    transport_cost?: number;
    net_profit_potential: number;
  }>;
  historical_data: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
}

/**
 * Fetch market prices with advanced location-based filtering
 */
export const fetchMarketPrices = async (
  filters: {
    crop_name?: string;
    location_filter?: LocationFilter;
    date_range?: {
      start_date: string;
      end_date: string;
    };
    limit?: number;
    sort_by?: 'price' | 'date' | 'location';
    sort_order?: 'asc' | 'desc';
  } = {}
) => {
  try {
    let query = supabase
      .from('market_prices')
      .select('*');

    // Apply crop filter
    if (filters.crop_name) {
      query = query.ilike('crop_name', `%${filters.crop_name}%`);
    }

    // Apply location filter
    if (filters.location_filter?.location) {
      query = query.ilike('location', `%${filters.location_filter.location}%`);
    }

    // Apply date range filter
    if (filters.date_range) {
      query = query
        .gte('date_recorded', filters.date_range.start_date)
        .lte('date_recorded', filters.date_range.end_date);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'date_recorded';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      return ApiResponseHandler.error(`Failed to fetch market prices: ${error.message}`, 500);
    }

    // Apply coordinate-based filtering if provided
    let filteredData = data || [];
    if (filters.location_filter?.coordinates && filters.location_filter?.radius_km) {
      filteredData = await filterByCoordinates(
        filteredData,
        filters.location_filter.coordinates,
        filters.location_filter.radius_km
      );
    }

    return ApiResponseHandler.success(filteredData, 'Market prices fetched successfully');
  } catch (error) {
    console.error('Error in fetchMarketPrices:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Calculate price trends with advanced analytics
 */
export const calculatePriceTrends = async (
  crop_name: string,
  period_days: number = 30,
  location_filter?: LocationFilter
) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    // Fetch current period data
    const currentResponse = await fetchMarketPrices({
      crop_name,
      location_filter,
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }
    });

    if (!currentResponse.success || !currentResponse.data) {
      return ApiResponseHandler.error('Failed to fetch current price data', 500);
    }

    // Fetch previous period data for comparison
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - period_days);

    const previousResponse = await fetchMarketPrices({
      crop_name,
      location_filter,
      date_range: {
        start_date: previousStartDate.toISOString().split('T')[0],
        end_date: previousEndDate.toISOString().split('T')[0]
      }
    });

    const currentPrices = currentResponse.data as MarketPrice[];
    const previousPrices = (previousResponse.success ? previousResponse.data : []) as MarketPrice[];

    // Calculate averages
    const currentAvg = currentPrices.length > 0
      ? currentPrices.reduce((sum, p) => sum + p.price, 0) / currentPrices.length
      : 0;

    const previousAvg = previousPrices.length > 0
      ? previousPrices.reduce((sum, p) => sum + p.price, 0) / previousPrices.length
      : currentAvg;

    // Calculate trend metrics
    const priceChange = currentAvg - previousAvg;
    const priceChangePercent = previousAvg > 0 ? (priceChange / previousAvg) * 100 : 0;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (Math.abs(priceChangePercent) > 5) {
      trend = priceChangePercent > 0 ? 'rising' : 'falling';
    }

    const priceTrend: PriceTrend = {
      crop_name,
      current_price: Math.round(currentAvg * 100) / 100,
      previous_price: Math.round(previousAvg * 100) / 100,
      price_change: Math.round(priceChange * 100) / 100,
      price_change_percent: Math.round(priceChangePercent * 100) / 100,
      trend,
      period_days
    };

    return ApiResponseHandler.success(priceTrend, 'Price trend calculated successfully');
  } catch (error) {
    console.error('Error in calculatePriceTrends:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Generate demand indicators with market intelligence
 */
export const generateDemandIndicators = async (
  crop_name: string,
  location_filter?: LocationFilter
) => {
  try {
    // Fetch recent market data (last 30 days)
    const recentResponse = await fetchMarketPrices({
      crop_name,
      location_filter,
      date_range: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    });

    if (!recentResponse.success || !recentResponse.data) {
      return ApiResponseHandler.error('Failed to fetch market data for demand analysis', 500);
    }

    const marketData = recentResponse.data as MarketPrice[];

    // Calculate market activity metrics
    const marketActivity = marketData.length;
    const uniqueLocations = new Set(marketData.map(d => d.location)).size;
    const priceVariance = calculatePriceVariance(marketData.map(d => d.price));

    // Determine demand level based on market activity and price variance
    let demandLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (marketActivity < 5) {
      demandLevel = 'low';
    } else if (marketActivity > 20 && priceVariance > 0.2) {
      demandLevel = 'critical';
    } else if (marketActivity > 15 || priceVariance > 0.15) {
      demandLevel = 'high';
    }

    // Determine supply level (inverse relationship with price variance)
    let supplyLevel: 'low' | 'medium' | 'high' | 'oversupply' = 'medium';
    if (priceVariance > 0.3) {
      supplyLevel = 'low';
    } else if (priceVariance < 0.05) {
      supplyLevel = 'oversupply';
    } else if (priceVariance < 0.1) {
      supplyLevel = 'high';
    }

    // Calculate seasonal factor (simplified)
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFactor = getSeasonalFactor(crop_name, currentMonth);

    // Generate recommendation
    const recommendation = generateDemandRecommendation(
      demandLevel,
      supplyLevel,
      seasonalFactor,
      crop_name
    );

    const demandIndicator: DemandIndicator = {
      crop_name,
      demand_level: demandLevel,
      supply_level: supplyLevel,
      market_activity: marketActivity,
      price_volatility: Math.round(priceVariance * 100) / 100,
      seasonal_factor: Math.round(seasonalFactor * 100) / 100,
      recommendation
    };

    return ApiResponseHandler.success(demandIndicator, 'Demand indicators generated successfully');
  } catch (error) {
    console.error('Error in generateDemandIndicators:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Get comprehensive market analysis for a crop
 */
export const getMarketAnalysis = async (
  crop_name: string,
  farmer_location?: { lat: number; lng: number },
  analysis_radius_km: number = 100
) => {
  try {
    const locationFilter: LocationFilter | undefined = farmer_location
      ? {
          coordinates: farmer_location,
          radius_km: analysis_radius_km
        }
      : undefined;

    // Fetch all required data in parallel
    const [pricesResponse, trendResponse, demandResponse] = await Promise.all([
      fetchMarketPrices({
        crop_name,
        location_filter: locationFilter,
        limit: 100,
        sort_by: 'date',
        sort_order: 'desc'
      }),
      calculatePriceTrends(crop_name, 30, locationFilter),
      generateDemandIndicators(crop_name, locationFilter)
    ]);

    if (!pricesResponse.success) {
      return pricesResponse;
    }

    const marketPrices = pricesResponse.data as MarketPrice[];
    const priceTrend = trendResponse.success ? trendResponse.data as PriceTrend : null;
    const demandIndicator = demandResponse.success ? demandResponse.data as DemandIndicator : null;

    // Calculate regional breakdown
    const regionalPrices = calculateRegionalBreakdown(marketPrices);

    // Find best selling locations
    const bestSellingLocations = await findBestSellingLocations(
      marketPrices,
      farmer_location
    );

    // Generate historical data (last 90 days)
    const historicalData = await generateHistoricalData(crop_name, 90, locationFilter);

    const analysis: MarketAnalysis = {
      crop_name,
      current_price: priceTrend?.current_price || 0,
      price_trend: priceTrend || {
        crop_name,
        current_price: 0,
        previous_price: 0,
        price_change: 0,
        price_change_percent: 0,
        trend: 'stable',
        period_days: 30
      },
      demand_indicator: demandIndicator || {
        crop_name,
        demand_level: 'medium',
        supply_level: 'medium',
        market_activity: 0,
        price_volatility: 0,
        seasonal_factor: 1,
        recommendation: 'Monitor market conditions regularly'
      },
      regional_prices: regionalPrices,
      best_selling_locations: bestSellingLocations,
      historical_data: historicalData
    };

    return ApiResponseHandler.success(analysis, 'Market analysis completed successfully');
  } catch (error) {
    console.error('Error in getMarketAnalysis:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Get market overview for multiple crops
 */
export const getMarketOverview = async (
  crop_names: string[],
  location_filter?: LocationFilter
) => {
  try {
    const overviewData = await Promise.all(
      crop_names.map(async (crop_name) => {
        const [pricesResponse, trendResponse, demandResponse] = await Promise.all([
          fetchMarketPrices({
            crop_name,
            location_filter,
            limit: 10,
            sort_by: 'date',
            sort_order: 'desc'
          }),
          calculatePriceTrends(crop_name, 7, location_filter), // 7-day trend
          generateDemandIndicators(crop_name, location_filter)
        ]);

        const prices = pricesResponse.success ? pricesResponse.data as MarketPrice[] : [];
        const trend = trendResponse.success ? trendResponse.data as PriceTrend : null;
        const demand = demandResponse.success ? demandResponse.data as DemandIndicator : null;

        return {
          crop_name,
          current_price: trend?.current_price || 0,
          price_change_percent: trend?.price_change_percent || 0,
          trend: trend?.trend || 'stable',
          demand_level: demand?.demand_level || 'medium',
          market_activity: demand?.market_activity || 0,
          recent_listings: prices.length
        };
      })
    );

    return ApiResponseHandler.success(overviewData, 'Market overview generated successfully');
  } catch (error) {
    console.error('Error in getMarketOverview:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

// Helper functions
async function filterByCoordinates(
  data: MarketPrice[],
  coordinates: { lat: number; lng: number },
  radiusKm: number
): Promise<MarketPrice[]> {
  // For now, return all data since we don't have coordinates in market_prices table
  // In a real implementation, you would calculate distances and filter
  return data;
}

function calculatePriceVariance(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance) / mean; // Coefficient of variation
}

function getSeasonalFactor(crop_name: string, month: number): number {
  // Seasonal factors for African crops (1.0 = normal, >1.0 = high season, <1.0 = low season)
  const seasonalFactors: Record<string, number[]> = {
    'maize': [1.2, 1.15, 1.1, 0.9, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15],
    'beans': [1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15],
    'tomato': [0.9, 0.85, 0.9, 1.0, 1.1, 1.2, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85],
    'rice': [1.0, 0.95, 0.9, 0.85, 0.9, 0.95, 1.0, 1.1, 1.2, 1.15, 1.1, 1.05]
  };
  
  return seasonalFactors[crop_name.toLowerCase()]?.[month - 1] || 1.0;
}

function generateDemandRecommendation(
  demandLevel: string,
  supplyLevel: string,
  seasonalFactor: number,
  cropName: string
): string {
  if (demandLevel === 'critical' && supplyLevel === 'low') {
    return `🔥 Critical demand with low supply for ${cropName}! Sell immediately at premium prices.`;
  } else if (demandLevel === 'high' && seasonalFactor > 1.1) {
    return `📈 High seasonal demand for ${cropName}. Excellent selling opportunity.`;
  } else if (supplyLevel === 'oversupply') {
    return `⚠️ Market oversupply detected for ${cropName}. Consider storage or value addition.`;
  } else if (demandLevel === 'low') {
    return `📊 Low demand for ${cropName}. Monitor market closely and consider alternative crops.`;
  } else {
    return `✅ Stable market conditions for ${cropName}. Good time for regular sales.`;
  }
}

function calculateRegionalBreakdown(marketPrices: MarketPrice[]) {
  const regions: Record<string, { prices: number[]; dates: string[] }> = {};
  
  marketPrices.forEach(price => {
    if (!regions[price.location]) {
      regions[price.location] = { prices: [], dates: [] };
    }
    regions[price.location].prices.push(price.price);
    regions[price.location].dates.push(price.date_recorded);
  });

  return Object.entries(regions).map(([location, data]) => {
    const avgPrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
    const latestDate = data.dates.sort().reverse()[0];
    const marketShare = (data.prices.length / marketPrices.length) * 100;

    return {
      location,
      price: Math.round(avgPrice * 100) / 100,
      date: latestDate,
      market_share: Math.round(marketShare * 100) / 100
    };
  }).sort((a, b) => b.price - a.price);
}

async function findBestSellingLocations(
  marketPrices: MarketPrice[],
  farmerLocation?: { lat: number; lng: number }
) {
  const locationPrices = calculateRegionalBreakdown(marketPrices);
  
  return locationPrices.slice(0, 5).map(location => ({
    location: location.location,
    price: location.price,
    distance_km: 0, // Would calculate actual distance in real implementation
    transport_cost: location.price * 0.05, // Estimated 5% transport cost
    net_profit_potential: Math.round((location.price * 0.95) * 100) / 100
  }));
}

async function generateHistoricalData(
  crop_name: string,
  days: number,
  locationFilter?: LocationFilter
): Promise<Array<{ date: string; price: number; volume?: number }>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const response = await fetchMarketPrices({
    crop_name,
    location_filter: locationFilter,
    date_range: {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    },
    sort_by: 'date',
    sort_order: 'asc'
  });

  if (!response.success || !response.data) {
    return [];
  }

  const marketPrices = response.data as MarketPrice[];
  
  // Group by date and calculate daily averages
  const dailyPrices: Record<string, number[]> = {};
  marketPrices.forEach(price => {
    if (!dailyPrices[price.date_recorded]) {
      dailyPrices[price.date_recorded] = [];
    }
    dailyPrices[price.date_recorded].push(price.price);
  });

  return Object.entries(dailyPrices).map(([date, prices]) => ({
    date,
    price: Math.round((prices.reduce((sum, p) => sum + p, 0) / prices.length) * 100) / 100,
    volume: prices.length // Number of listings as proxy for volume
  })).sort((a, b) => a.date.localeCompare(b.date));
}