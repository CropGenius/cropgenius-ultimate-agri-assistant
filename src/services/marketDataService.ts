import { MarketDataResponse } from '../services/pricing-intelligence/models/types';

export interface MarketDataParams {
  crop: string;
  location: string;
  currency?: string;
  mode?: 'dashboard' | 'sms' | 'pro_api';
  language?: string;
}

export const fetchMarketData = async (params: MarketDataParams): Promise<MarketDataResponse> => {
  const { crop, location, currency = 'USD', mode = 'dashboard', language = 'en' } = params;
  
  try {
    const response = await fetch(`/api/market-data?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}&currency=${currency}&mode=${mode}&language=${language}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const fetchMarketTrends = async (crop: string, location: string) => {
  try {
    const response = await fetch(`/api/market-trends?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market trends: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching market trends:', error);
    throw error;
  }
};

export const fetchCropSuggestions = async (query: string) => {
  try {
    const response = await fetch(`/api/crop-suggestions?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch crop suggestions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crop suggestions:', error);
    throw error;
  }
};
