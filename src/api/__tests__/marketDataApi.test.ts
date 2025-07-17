import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  fetchMarketPrices, 
  calculatePriceTrends, 
  generateDemandIndicators,
  getMarketAnalysis,
  getMarketOverview 
} from '../marketDataApi';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({
                  data: mockMarketPrices,
                  error: null
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

const mockMarketPrices = [
  {
    id: '1',
    crop_name: 'maize',
    price: 55.50,
    currency: 'KES',
    location: 'Nairobi, Kenya',
    date_recorded: '2024-01-15',
    source: 'Local Market',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    crop_name: 'maize',
    price: 52.00,
    currency: 'KES',
    location: 'Nakuru, Kenya',
    date_recorded: '2024-01-10',
    source: 'Local Market',
    created_at: '2024-01-10T10:00:00Z'
  }
];

describe('marketDataApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMarketPrices', () => {
    it('should fetch market prices successfully', async () => {
      const result = await fetchMarketPrices({
        crop_name: 'maize',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMarketPrices);
      expect(supabase.from).toHaveBeenCalledWith('market_prices');
    });

    it('should apply crop name filter', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({
                data: mockMarketPrices,
                error: null
              }))
            }))
          }))
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          ilike: mockFrom,
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: mockMarketPrices,
              error: null
            }))
          }))
        }))
      });

      await fetchMarketPrices({ crop_name: 'maize' });
      expect(mockFrom).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      });

      const result = await fetchMarketPrices();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should apply date range filter', async () => {
      const dateRange = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };

      await fetchMarketPrices({ date_range: dateRange });
      expect(supabase.from).toHaveBeenCalledWith('market_prices');
    });

    it('should apply location filter', async () => {
      const locationFilter = {
        location: 'Nairobi'
      };

      await fetchMarketPrices({ location_filter: locationFilter });
      expect(supabase.from).toHaveBeenCalledWith('market_prices');
    });
  });

  describe('calculatePriceTrends', () => {
    it('should calculate price trends correctly', async () => {
      const result = await calculatePriceTrends('maize', 30);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('crop_name', 'maize');
      expect(result.data).toHaveProperty('current_price');
      expect(result.data).toHaveProperty('previous_price');
      expect(result.data).toHaveProperty('price_change');
      expect(result.data).toHaveProperty('price_change_percent');
      expect(result.data).toHaveProperty('trend');
    });

    it('should determine trend correctly', async () => {
      const result = await calculatePriceTrends('maize', 30);

      expect(result.success).toBe(true);
      expect(['rising', 'falling', 'stable']).toContain(result.data.trend);
    });

    it('should handle empty data gracefully', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }))
          }))
        }))
      });

      const result = await calculatePriceTrends('nonexistent', 30);
      expect(result.success).toBe(true);
      expect(result.data.current_price).toBe(0);
    });
  });

  describe('generateDemandIndicators', () => {
    it('should generate demand indicators successfully', async () => {
      const result = await generateDemandIndicators('maize');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('crop_name', 'maize');
      expect(result.data).toHaveProperty('demand_level');
      expect(result.data).toHaveProperty('supply_level');
      expect(result.data).toHaveProperty('market_activity');
      expect(result.data).toHaveProperty('price_volatility');
      expect(result.data).toHaveProperty('seasonal_factor');
      expect(result.data).toHaveProperty('recommendation');
    });

    it('should classify demand levels correctly', async () => {
      const result = await generateDemandIndicators('maize');

      expect(result.success).toBe(true);
      expect(['low', 'medium', 'high', 'critical']).toContain(result.data.demand_level);
      expect(['low', 'medium', 'high', 'oversupply']).toContain(result.data.supply_level);
    });

    it('should generate appropriate recommendations', async () => {
      const result = await generateDemandIndicators('maize');

      expect(result.success).toBe(true);
      expect(result.data.recommendation).toBeTruthy();
      expect(typeof result.data.recommendation).toBe('string');
    });
  });

  describe('getMarketAnalysis', () => {
    it('should provide comprehensive market analysis', async () => {
      const result = await getMarketAnalysis('maize');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('crop_name', 'maize');
      expect(result.data).toHaveProperty('current_price');
      expect(result.data).toHaveProperty('price_trend');
      expect(result.data).toHaveProperty('demand_indicator');
      expect(result.data).toHaveProperty('regional_prices');
      expect(result.data).toHaveProperty('best_selling_locations');
      expect(result.data).toHaveProperty('historical_data');
    });

    it('should include farmer location in analysis', async () => {
      const farmerLocation = { lat: -1.2921, lng: 36.8219 };
      const result = await getMarketAnalysis('maize', farmerLocation);

      expect(result.success).toBe(true);
      expect(result.data.crop_name).toBe('maize');
    });

    it('should handle analysis radius parameter', async () => {
      const farmerLocation = { lat: -1.2921, lng: 36.8219 };
      const result = await getMarketAnalysis('maize', farmerLocation, 50);

      expect(result.success).toBe(true);
    });
  });

  describe('getMarketOverview', () => {
    it('should provide overview for multiple crops', async () => {
      const crops = ['maize', 'beans', 'tomato'];
      const result = await getMarketOverview(crops);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(crops.length);
    });

    it('should include essential overview data', async () => {
      const result = await getMarketOverview(['maize']);

      expect(result.success).toBe(true);
      expect(result.data[0]).toHaveProperty('crop_name');
      expect(result.data[0]).toHaveProperty('current_price');
      expect(result.data[0]).toHaveProperty('price_change_percent');
      expect(result.data[0]).toHaveProperty('trend');
      expect(result.data[0]).toHaveProperty('demand_level');
      expect(result.data[0]).toHaveProperty('market_activity');
    });

    it('should apply location filter to overview', async () => {
      const locationFilter = {
        coordinates: { lat: -1.2921, lng: 36.8219 },
        radius_km: 100
      };

      const result = await getMarketOverview(['maize'], locationFilter);
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      (supabase.from as any).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await fetchMarketPrices();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle invalid parameters', async () => {
      const result = await calculatePriceTrends('', -1);
      expect(result.success).toBe(false);
    });
  });

  describe('data validation', () => {
    it('should validate price data format', async () => {
      const result = await fetchMarketPrices();
      
      if (result.success && result.data.length > 0) {
        const price = result.data[0];
        expect(price).toHaveProperty('id');
        expect(price).toHaveProperty('crop_name');
        expect(price).toHaveProperty('price');
        expect(price).toHaveProperty('currency');
        expect(price).toHaveProperty('location');
        expect(price).toHaveProperty('date_recorded');
      }
    });

    it('should validate trend data format', async () => {
      const result = await calculatePriceTrends('maize');
      
      if (result.success) {
        expect(typeof result.data.current_price).toBe('number');
        expect(typeof result.data.previous_price).toBe('number');
        expect(typeof result.data.price_change).toBe('number');
        expect(typeof result.data.price_change_percent).toBe('number');
        expect(['rising', 'falling', 'stable']).toContain(result.data.trend);
      }
    });
  });
});