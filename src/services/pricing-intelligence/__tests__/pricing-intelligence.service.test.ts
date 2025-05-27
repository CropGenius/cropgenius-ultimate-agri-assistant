import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { PricingIntelligenceService } from '../pricing-intelligence.service';
import { CacheManager } from '../cache/cache-manager';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { MarketDataResponse } from '../models/types';

// Define mock implementations with proper types
const mockCache = {
  get: vi.fn<[string], Promise<MarketDataResponse | null>>(),
  set: vi.fn<[string, any, number], Promise<void>>(),
  clearAll: vi.fn<[], Promise<void>>(),
};

const mockExchangeRateService = {
  getExchangeRate: vi.fn<[string, string], Promise<number>>(),
  convertAmount: vi.fn<[number, string, string], Promise<number>>(
    (amount, from, to) => {
      if (from === 'USD' && to === 'KES') {
        return Promise.resolve(amount * 150);
      }
      return Promise.resolve(amount * 1.5); // Default conversion for other currencies
    }
  ),
};

const mockWFPDataSource = {
  fetchPriceData: vi.fn(),
};

const mockTradingEconomicsSource = {
  fetchPriceData: vi.fn(),
};

// Mock the modules with proper typing
vi.mock('../cache/cache-manager', () => ({
  CacheManager: {
    getInstance: vi.fn(() => mockCache as unknown as CacheManager),
  },
}));

vi.mock('../services/exchange-rate.service', () => ({
  ExchangeRateService: {
    getInstance: vi.fn(() => mockExchangeRateService as unknown as ExchangeRateService),
  },
}));

vi.mock('../data-sources/wfp-source', () => ({
  WFPDataSource: vi.fn().mockImplementation(() => ({
    fetchPriceData: mockWFPDataSource.fetchPriceData,
  })),
}));

vi.mock('../data-sources/trading-economics-source', () => ({
  TradingEconomicsSource: vi.fn().mockImplementation(() => ({
    fetchPriceData: mockTradingEconomicsSource.fetchPriceData,
  })),
}));

describe('PricingIntelligenceService', () => {
  let service: PricingIntelligenceService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset the singleton instance before each test
    (PricingIntelligenceService as any).instance = undefined;
    
    // Create the service instance
    service = PricingIntelligenceService.getInstance();
  });

  describe('getMarketData', () => {
    it('should return cached data when available', async () => {
      const mockCachedData: MarketDataResponse = {
        crop: 'maize',
        location: 'Nairobi',
        price_today: 100,
        currency: 'USD',
        price_last_week: 95,
        change_pct: 5.26,
        trend: 'rising',
        volatility_score: 0.2,
        anomaly_flag: false,
        advice: { en: 'Prices are rising' },
        source: 'WFP',
        updated_at: new Date().toISOString(),
        confidence: 0.95,
        metadata: {
          min_price: 90,
          max_price: 110,
          price_history: [
            { price: 95, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), source: 'WFP' },
            { price: 100, date: new Date().toISOString(), source: 'WFP' },
          ],
          confidence_indicators: {
            data_freshness: 1,
            source_reliability: 0.95,
            data_consistency: 0.9,
          },
        },
      };
      
      mockCache.get.mockResolvedValue(mockCachedData);
      
      const result = await service.getMarketData('maize', 'Nairobi');
      
      expect(result).toEqual(mockCachedData);
      expect(mockCache.get).toHaveBeenCalledWith(expect.stringContaining('maize:nairobi'));
      
      // Should not call data sources when cache hit
      expect(mockWFPDataSource.fetchPriceData).not.toHaveBeenCalled();
    });

    it('should fetch from primary data source when cache miss', async () => {
      const mockPriceData = [{
        crop: 'maize',
        location: 'Nairobi',
        price: 100,
        currency: 'USD',
        unit: 'kg',
        source: 'WFP',
        timestamp: new Date().toISOString(),
      }];
      
      // Mock cache miss then set the new value
      mockCache.get.mockResolvedValueOnce(null);
      mockCache.set.mockImplementationOnce(() => Promise.resolve());
      
      // Mock data source response
      mockWFPDataSource.fetchPriceData.mockResolvedValueOnce(mockPriceData);
      
      // Mock exchange rate service
      mockExchangeRateService.getExchangeRate.mockResolvedValueOnce(1);
      
      const result = await service.getMarketData('maize', 'Nairobi');
      
      expect(mockWFPDataSource.fetchPriceData).toHaveBeenCalledWith({
        crop: 'maize',
        location: 'Nairobi',
        currency: 'USD',
      });
      
      expect(result).toMatchObject({
        crop: 'maize',
        location: 'Nairobi',
        price_today: expect.any(Number),
        currency: 'USD',
        source: 'WFP',
        trend: expect.stringMatching(/rising|falling|stable/),
        metadata: {
          confidence_indicators: {
            source_reliability: expect.any(Number),
            data_freshness: expect.any(Number),
            data_consistency: expect.any(Number)
          },
          min_price: expect.any(Number),
          max_price: expect.any(Number),
          price_history: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              price: expect.any(Number),
              source: expect.any(String)
            })
          ])
        }
        // Add other expected fields
      });
      
      // Should have cached the result
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should fall back to secondary data source when primary fails', async () => {
      // Mock cache miss
      mockCache.get.mockResolvedValueOnce(null);
      
      // Mock primary source failure
      const error = new Error('API error');
      mockWFPDataSource.fetchPriceData.mockRejectedValueOnce(error);
      
      // Mock secondary source success
      const mockPriceData = [{
        crop: 'maize',
        location: 'Nairobi',
        price: 100,
        currency: 'USD',
        unit: 'kg',
        source: 'Trading Economics',
        timestamp: new Date().toISOString(),
      }];
      
      mockTradingEconomicsSource.fetchPriceData.mockResolvedValueOnce(mockPriceData);
      
      // Mock exchange rate service
      mockExchangeRateService.getExchangeRate.mockResolvedValueOnce(1);
      
      const result = await service.getMarketData('maize', 'Nairobi');
      
      // Should have tried both sources
      expect(mockWFPDataSource.fetchPriceData).toHaveBeenCalled();
      expect(mockTradingEconomicsSource.fetchPriceData).toHaveBeenCalled();
      
      // Should return data from secondary source
      expect(result).toMatchObject({
        crop: 'maize',
        location: 'Nairobi',
        source: 'Trading Economics',
        currency: 'USD',
        price_today: expect.any(Number),
        price_last_week: expect.any(Number),
        change_pct: expect.any(Number),
        trend: expect.stringMatching(/rising|falling|stable/),
        volatility_score: expect.any(Number),
        anomaly_flag: expect.any(Boolean),
        advice: expect.any(Object),
        updated_at: expect.any(String),
        confidence: expect.any(Number),
      });
      
      // Should have set the cache
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should handle currency conversion', async () => {
      // Mock cache miss
      mockCache.get.mockResolvedValueOnce(null);
      
      // Mock data source response in USD
      const mockPriceData = [{
        crop: 'maize',
        location: 'Nairobi',
        price: 1, // 1 USD
        currency: 'USD',
        unit: 'kg',
        source: 'WFP',
        timestamp: new Date().toISOString(),
      }];
      
      mockWFPDataSource.fetchPriceData.mockResolvedValueOnce(mockPriceData);
      
      // Mock exchange rate (1 USD = 150 KES)
      mockExchangeRateService.getExchangeRate.mockResolvedValueOnce(150);
      
      // Request prices in KES
      const result = await service.getMarketData('maize', 'Nairobi', 'KES');
      
      // The conversion rate is mocked to 150 in the test setup (1 USD = 150 KES)
      // So 1 USD should be converted to 150 KES
      expect(result.price_today).toBeCloseTo(150);
      expect(result.currency).toBe('KES');
      
      // Verify the response structure
      expect(result).toMatchObject({
        crop: 'maize',
        location: 'Nairobi',
        source: 'WFP',
        metadata: {
          confidence_indicators: {
            source_reliability: expect.any(Number),
            data_freshness: expect.any(Number),
            data_consistency: expect.any(Number)
          },
          min_price: expect.any(Number),
          max_price: expect.any(Number),
          price_history: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              price: expect.any(Number),
              source: expect.any(String)
            })
          ])
        },
        currency: 'KES',
        price_today: 150,
        price_last_week: expect.any(Number),
        change_pct: expect.any(Number),
        trend: expect.stringMatching(/rising|falling|stable/),
        volatility_score: expect.any(Number),
        anomaly_flag: expect.any(Boolean),
        advice: expect.any(Object),
        updated_at: expect.any(String),
        confidence: expect.any(Number),
      });
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await service.clearCache();
      expect(mockCache.clearAll).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when no data sources are available', async () => {
      // Mock cache miss
      mockCache.get.mockResolvedValueOnce(null);
      
      // Mock both sources failing
      mockWFPDataSource.fetchPriceData.mockRejectedValueOnce(new Error('WFP API down'));
      mockTradingEconomicsSource.fetchPriceData.mockRejectedValueOnce(new Error('TE API down'));
      
      await expect(service.getMarketData('maize', 'Nairobi'))
        .rejects
        .toThrow('Failed to fetch market data');
    });

    it('should handle invalid input parameters', async () => {
      await expect(service.getMarketData('', 'Nairobi'))
        .rejects
        .toThrow('Crop and location are required');
      
      await expect(service.getMarketData('maize', ''))
        .rejects
        .toThrow('Crop and location are required');
    });
  });
});
