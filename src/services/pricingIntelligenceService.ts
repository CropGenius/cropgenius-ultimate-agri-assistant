import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Types
export interface PriceData {
  location: string;
  crop: string;
  price_today: string;
  price_last_week: string;
  change_pct: string;
  source: string;
  confidence: number;
  advice: string;
  updated_at: string;
  trend: 'rising' | 'falling' | 'stable';
  volatility_score: number;
  anomaly_flag: boolean;
  mode: 'sms' | 'dashboard' | 'pro_api' | 'logistics';
  logistics_cost_estimate?: string;
  currency: string;
}

// Cache configuration
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const PRICE_CACHE_KEY = 'cropgenius_price_cache';

// Cache interface
interface PriceCache {
  [key: string]: {
    data: PriceData;
    timestamp: number;
  };
}

// Get cached price data
const getCachedPrice = (cacheKey: string): PriceData | null => {
  try {
    const cache = localStorage.getItem(PRICE_CACHE_KEY);
    if (!cache) return null;
    
    const priceCache: PriceCache = JSON.parse(cache);
    const cachedItem = priceCache[cacheKey];
    
    if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
      return cachedItem.data;
    }
    return null;
  } catch (error) {
    console.error('Error reading from price cache:', error);
    return null;
  }
};

// Save price data to cache
const cachePriceData = (cacheKey: string, data: PriceData): void => {
  try {
    const cache = localStorage.getItem(PRICE_CACHE_KEY);
    const priceCache: PriceCache = cache ? JSON.parse(cache) : {};
    
    priceCache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(priceCache));
  } catch (error) {
    console.error('Error saving to price cache:', error);
  }
};

// Normalize location name for consistent caching and comparison
const normalizeLocation = (location: string): string => {
  return location.trim().toLowerCase().replace(/\s+/g, '_');
};

// Generate a cache key for price lookups
const generateCacheKey = (crop: string, location: string, mode: string = 'dashboard'): string => {
  return `${normalizeLocation(location)}_${crop.toLowerCase()}_${mode}`;
};

// Calculate price change percentage
const calculateChangePct = (current: number, previous: number): string => {
  if (previous === 0) return '0.00';
  return (((current - previous) / previous) * 100).toFixed(2);
};

// Determine price trend
const determineTrend = (changePct: number): 'rising' | 'falling' | 'stable' => {
  if (changePct > 2) return 'rising';
  if (changePct < -2) return 'falling';
  return 'stable';
};

// Calculate volatility score (placeholder implementation)
const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize to 0-1 range (assuming max volatility is 50% of mean)
  return Math.min(1, stdDev / (mean * 0.5));
};

// Fetch price data from WFP DataBridges
const fetchFromWFP = async (crop: string, location: string): Promise<Partial<PriceData> | null> => {
  try {
    // TODO: Implement actual WFP API call
    // This is a mock implementation
    return {
      price_today: '150.00',
      price_last_week: '145.00',
      source: 'WFP DataBridges',
      confidence: 0.9,
    };
  } catch (error) {
    console.error('Error fetching from WFP:', error);
    return null;
  }
};

// Fetch price data from Trading Economics
const fetchFromTradingEconomics = async (crop: string, location: string): Promise<Partial<PriceData> | null> => {
  try {
    // TODO: Implement actual Trading Economics API call
    // This is a mock implementation
    return {
      price_today: '155.00',
      price_last_week: '150.00',
      source: 'Trading Economics',
      confidence: 0.8,
    };
  } catch (error) {
    console.error('Error fetching from Trading Economics:', error);
    return null;
  }
};

// Fetch exchange rate
const fetchExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number | null> => {
  try {
    // TODO: Implement actual exchange rate API call
    // This is a mock implementation
    const rates: Record<string, number> = {
      'USD_KES': 150.50,
      'USD_NGN': 750.25,
      'USD_GHS': 11.80,
      'USD_XAF': 600.00,
    };
    
    const rateKey = `${fromCurrency}_${toCurrency}`;
    return rates[rateKey] || null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
};

// Generate farmer advice based on price data
const generateAdvice = (data: Partial<PriceData>): string => {
  if (!data.price_today || !data.price_last_week) {
    return 'Insufficient data to provide pricing advice.';
  }
  
  const currentPrice = parseFloat(data.price_today);
  const lastWeekPrice = parseFloat(data.price_last_week);
  const change = ((currentPrice - lastWeekPrice) / lastWeekPrice) * 100;
  
  if (change > 15) {
    return 'Prices are rising rapidly — consider selling soon to maximize profits.';
  } else if (change > 5) {
    return 'Prices are increasing — a good time to consider selling.';
  } else if (change < -15) {
    return 'Prices are dropping sharply — consider holding or exploring alternative markets.';
  } else if (change < -5) {
    return 'Prices are decreasing — monitor the market for better opportunities.';
  } else {
    return 'Prices are stable. No immediate action needed.';
  }
};

// Main function to get crop price data
export const getCropPrice = async (
  crop: string,
  location: string,
  mode: 'sms' | 'dashboard' | 'pro_api' | 'logistics' = 'dashboard',
  currency: string = 'USD',
  origin?: string,
  destination?: string,
  quantity?: number
): Promise<{ data: PriceData | null; error: string | null }> => {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(crop, location, mode);
    
    // Check cache first
    const cachedData = getCachedPrice(cacheKey);
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // Fetch data from primary source (WFP)
    let priceData = await fetchFromWFP(crop, location);
    
    // Fallback to secondary source if primary fails
    if (!priceData) {
      priceData = await fetchFromTradingEconomics(crop, location);
    }
    
    if (!priceData) {
      return { data: null, error: 'Unable to fetch price data from any source' };
    }
    
    // Convert currency if needed
    if (currency !== 'USD') {
      const rate = await fetchExchangeRate('USD', currency);
      if (rate) {
        const convertPrice = (price: string) => (parseFloat(price) * rate).toFixed(2);
        priceData.price_today = convertPrice(priceData.price_today || '0');
        priceData.price_last_week = convertPrice(priceData.price_last_week || '0');
      }
    }
    
    // Calculate derived fields
    const currentPrice = parseFloat(priceData.price_today || '0');
    const lastWeekPrice = parseFloat(priceData.price_last_week || '0');
    const changePct = parseFloat(calculateChangePct(currentPrice, lastWeekPrice));
    
    // Build the complete price data object
    const completePriceData: PriceData = {
      location,
      crop,
      price_today: `${currentPrice.toFixed(2)} ${currency}/kg`,
      price_last_week: `${lastWeekPrice.toFixed(2)} ${currency}/kg`,
      change_pct: `${changePct.toFixed(2)}%`,
      source: priceData.source || 'Multiple sources',
      confidence: priceData.confidence || 0.7,
      advice: generateAdvice(priceData),
      updated_at: new Date().toISOString(),
      trend: determineTrend(changePct),
      volatility_score: calculateVolatility([currentPrice, lastWeekPrice]),
      anomaly_flag: Math.abs(changePct) > 15,
      mode,
      currency,
    };
    
    // Add logistics cost estimate if requested
    if (mode === 'logistics' && origin && destination && quantity) {
      // TODO: Implement actual logistics cost calculation
      completePriceData.logistics_cost_estimate = 'Logistics calculation not yet implemented';
    }
    
    // Cache the result
    cachePriceData(cacheKey, completePriceData);
    
    return { data: completePriceData, error: null };
  } catch (error) {
    console.error('Error in getCropPrice:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch price data' 
    };
  }
};

// Clear all cached price data
export const clearPriceCache = (): void => {
  try {
    localStorage.removeItem(PRICE_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing price cache:', error);
  }
};
