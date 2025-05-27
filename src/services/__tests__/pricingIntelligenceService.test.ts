import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCropPrice, clearPriceCache } from '../pricingIntelligenceService';

// Mock the fetchExchangeRate function
vi.mock('../pricingIntelligenceService', async (importOriginal) => {
  const original = await importOriginal() as typeof import('../pricingIntelligenceService');
  return {
    ...original,
    fetchExchangeRate: vi.fn().mockResolvedValue(150.50), // Mock exchange rate for USD to KES
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Pricing Intelligence Service', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getCropPrice', () => {
    it('should return price data with valid inputs', async () => {
      const result = await getCropPrice('maize', 'Nairobi');
      
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data).toHaveProperty('location', 'Nairobi');
      expect(result.data).toHaveProperty('crop', 'maize');
      expect(result.data).toHaveProperty('price_today');
      expect(result.data).toHaveProperty('price_last_week');
      expect(result.data).toHaveProperty('change_pct');
      expect(result.data).toHaveProperty('advice');
    });

    it('should return cached data when available', async () => {
      // First call - should fetch from API
      const firstCall = await getCropPrice('maize', 'Nairobi');
      
      // Second call - should use cache
      const secondCall = await getCropPrice('maize', 'Nairobi');
      
      // Verify the data is the same (cached)
      expect(secondCall.data).toEqual(firstCall.data);
    });

    it('should handle currency conversion', async () => {
      // First get the price in USD as baseline
      const usdResult = await getCropPrice('maize', 'Nairobi', 'dashboard', 'USD');
      expect(usdResult.error).toBeNull();
      
      // Then get the price in KES
      const result = await getCropPrice('maize', 'Nairobi', 'dashboard', 'KES');
      expect(result.error).toBeNull();
      
      // Extract numeric prices
      const usdPrice = parseFloat(usdResult.data?.price_today?.replace(/[^0-9.]/g, '') || '0');
      const kesPrice = parseFloat(result.data?.price_today?.replace(/[^0-9.]/g, '') || '0');
      
      // With the mocked exchange rate of 150.50, the KES price should be 150.50x the USD price
      const expectedKesPrice = usdPrice * 150.50;
      expect(kesPrice).toBeCloseTo(expectedKesPrice, 2);
      
      // Verify the price strings include the correct currency symbols
      expect(result.data?.price_today).toContain('KES/kg');
      expect(usdResult.data?.price_today).toContain('USD/kg');
    });

    it('should handle different modes', async () => {
      const smsResult = await getCropPrice('maize', 'Nairobi', 'sms');
      const dashboardResult = await getCropPrice('maize', 'Nairobi', 'dashboard');
      
      // Verify mode is set correctly
      expect(smsResult.data).toHaveProperty('mode', 'sms');
      expect(dashboardResult.data).toHaveProperty('mode', 'dashboard');
      
      // SMS mode might have different advice formatting
      expect(smsResult.data?.advice.length).toBeLessThanOrEqual(160);
    });
  });

  describe('clearPriceCache', () => {
    it('should clear all cached price data', async () => {
      // Add some data to cache
      await getCropPrice('maize', 'Nairobi');
      
      // Verify cache is not empty
      expect(localStorage.getItem('cropgenius_price_cache')).not.toBeNull();
      
      // Clear cache
      clearPriceCache();
      
      // Verify cache is empty
      expect(localStorage.getItem('cropgenius_price_cache')).toBeNull();
    });
  });
});
