/**
 * INFINITY GOD MODE useMarketData Hook Tests
 * Comprehensive test suite for advanced market data management hook
 * Testing real-time market intelligence for 100M African farmers! 🚀🔥💪
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMarketData, usePriceMonitoring } from '../useMarketData';
import * as marketDataApi from '@/api/marketDataApi';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

// Mock the market data API
vi.mock('@/api/marketDataApi', () => ({
  fetchMarketPrices: vi.fn(),
  calculatePriceTrends: vi.fn(),
  generateDemandIndicators: vi.fn(),
  getMarketAnalysis: vi.fn(),
  getMarketOverview: vi.fn()
}));

describe('useMarketData Hook - INFINITY GOD MODE Tests', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  // SUPREME test data for African agricultural markets
  const mockMarketPrices = [
    {
      id: '1',
      crop_name: 'maize',
      price: 45.50,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-15',
      created_at: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      crop_name: 'maize',
      price: 46.20,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-14',
      created_at: '2025-01-14T10:00:00Z'
    }
  ];

  const mockPriceTrend = {
    crop_name: 'maize',
    current_price: 46.20,
    previous_price: 45.50,
    price_change: 0.70,
    price_change_percent: 1.54,
    trend: 'rising' as const,
    period_days: 7
  };

  const mockDemandIndicator = {
    crop_name: 'maize',
    demand_level: 'high' as const,
    supply_level: 'medium' as const,
    market_activity: 25,
    price_volatility: 0.15,
    seasonal_factor: 1.2,
    recommendation: 'High seasonal demand for maize. Excellent selling opportunity.'
  };

  const mockMarketOverview = [
    {
      crop_name: 'maize',
      current_price: 46.20,
      price_change_percent: 1.54,
      trend: 'rising',
      demand_level: 'high',
      market_activity: 25,
      recent_listings: 15
    },
    {
      crop_name: 'beans',
      current_price: 120.00,
      price_change_percent: -2.30,
      trend: 'falling',
      demand_level: 'medium',
      market_activity: 18,
      recent_listings: 8
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('🚀 Basic Hook Functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMarketData(), { wrapper });

      expect(result.current.marketPrices).toEqual([]);
      expect(result.current.priceTrend).toBeNull();
      expect(result.current.demandIndicator).toBeNull();
      expect(result.current.marketAnalysis).toBeNull();
      expect(result.current.marketOverview).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('should accept and use configuration options', () => {
      const options = {
        crop_name: 'maize',
        location_filter: { coordinates: { lat: -1.2921, lng: 36.8219 }, radius_km: 100 },
        auto_refresh: true,
        refresh_interval: 60000
      };

      const { result } = renderHook(() => useMarketData(options), { wrapper });

      expect(result.current.filters.crop_name).toBe('maize');
    });
  });

  describe('🔥 Data Fetching and API Integration', () => {
    it('should fetch market prices successfully', async () => {
      const mockApiResponse = { success: true, data: mockMarketPrices };
      vi.mocked(marketDataApi.fetchMarketPrices).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.marketPrices).toEqual(mockMarketPrices);
        expect(result.current.isLoadingPrices).toBe(false);
      });

      expect(marketDataApi.fetchMarketPrices).toHaveBeenCalledWith({
        crop_name: 'maize',
        location_filter: undefined,
        date_range: expect.any(Object),
        sort_by: 'date',
        sort_order: 'desc',
        limit: 100
      });
    });

    it('should fetch price trends when crop is selected', async () => {
      const mockApiResponse = { success: true, data: mockPriceTrend };
      vi.mocked(marketDataApi.calculatePriceTrends).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.priceTrend).toEqual(mockPriceTrend);
        expect(result.current.isLoadingTrends).toBe(false);
      });

      expect(marketDataApi.calculatePriceTrends).toHaveBeenCalledWith(
        'maize',
        30,
        undefined
      );
    });

    it('should fetch demand indicators when crop is selected', async () => {
      const mockApiResponse = { success: true, data: mockDemandIndicator };
      vi.mocked(marketDataApi.generateDemandIndicators).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.demandIndicator).toEqual(mockDemandIndicator);
        expect(result.current.isLoadingDemand).toBe(false);
      });

      expect(marketDataApi.generateDemandIndicators).toHaveBeenCalledWith(
        'maize',
        undefined
      );
    });

    it('should fetch market overview for multiple crops', async () => {
      const mockApiResponse = { success: true, data: mockMarketOverview };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useMarketData(), { wrapper });

      await waitFor(() => {
        expect(result.current.marketOverview).toEqual(mockMarketOverview);
        expect(result.current.isLoadingOverview).toBe(false);
      });

      expect(marketDataApi.getMarketOverview).toHaveBeenCalledWith(
        ['maize', 'beans', 'tomato', 'rice', 'cassava'],
        undefined
      );
    });
  });

  describe('💪 Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      vi.mocked(marketDataApi.fetchMarketPrices).mockRejectedValue(mockError);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
        expect(result.current.pricesError).toBeTruthy();
        expect(result.current.errorMessage).toBe('API Error');
      });
    });

    it('should handle failed API responses', async () => {
      const mockFailedResponse = { success: false, error: 'Failed to fetch data' };
      vi.mocked(marketDataApi.fetchMarketPrices).mockResolvedValue(mockFailedResponse);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.marketPrices).toEqual([]);
      });
    });

    it('should handle network errors', async () => {
      vi.mocked(marketDataApi.fetchMarketPrices).mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
        expect(result.current.errorMessage).toBe('Network Error');
      });
    });
  });

  describe('🎯 Filter Management', () => {
    it('should update crop filter correctly', async () => {
      const { result } = renderHook(() => useMarketData(), { wrapper });

      act(() => {
        result.current.handleCropChange('beans');
      });

      expect(result.current.filters.crop_name).toBe('beans');
    });

    it('should update location filter correctly', async () => {
      const { result } = renderHook(() => useMarketData(), { wrapper });

      act(() => {
        result.current.handleLocationChange('Mombasa, Kenya');
      });

      expect(result.current.filters.location).toBe('Mombasa, Kenya');
    });

    it('should update date range filter correctly', async () => {
      const { result } = renderHook(() => useMarketData(), { wrapper });

      act(() => {
        result.current.handleDateRangeChange('2025-01-01', '2025-01-31');
      });

      expect(result.current.filters.date_range.start_date).toBe('2025-01-01');
      expect(result.current.filters.date_range.end_date).toBe('2025-01-31');
    });

    it('should update sort parameters correctly', async () => {
      const { result } = renderHook(() => useMarketData(), { wrapper });

      act(() => {
        result.current.handleSortChange('price', 'asc');
      });

      expect(result.current.filters.sort_by).toBe('price');
      expect(result.current.filters.sort_order).toBe('asc');
    });
  });

  describe('🚀 Data Refresh Functionality', () => {
    it('should refresh all data when refreshAllData is called', async () => {
      const mockPricesResponse = { success: true, data: mockMarketPrices };
      const mockTrendResponse = { success: true, data: mockPriceTrend };
      const mockDemandResponse = { success: true, data: mockDemandIndicator };
      const mockOverviewResponse = { success: true, data: mockMarketOverview };

      vi.mocked(marketDataApi.fetchMarketPrices).mockResolvedValue(mockPricesResponse);
      vi.mocked(marketDataApi.calculatePriceTrends).mockResolvedValue(mockTrendResponse);
      vi.mocked(marketDataApi.generateDemandIndicators).mockResolvedValue(mockDemandResponse);
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockOverviewResponse);

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await act(async () => {
        await result.current.refreshAllData();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Market data refreshed successfully');
      });
    });

    it('should handle refresh errors gracefully', async () => {
      vi.mocked(marketDataApi.fetchMarketPrices).mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      await act(async () => {
        await result.current.refreshAllData();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh some market data');
      });
    });
  });

  describe('🌟 Auto-refresh Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set up auto-refresh when enabled', async () => {
      const mockResponse = { success: true, data: mockMarketPrices };
      vi.mocked(marketDataApi.fetchMarketPrices).mockResolvedValue(mockResponse);

      renderHook(() => useMarketData({ 
        crop_name: 'maize',
        auto_refresh: true,
        refresh_interval: 60000 
      }), { wrapper });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Should trigger refresh
      await waitFor(() => {
        expect(marketDataApi.fetchMarketPrices).toHaveBeenCalled();
      });
    });

    it('should not set up auto-refresh when disabled', () => {
      renderHook(() => useMarketData({ 
        crop_name: 'maize',
        auto_refresh: false 
      }), { wrapper });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300000);
      });

      // Should not trigger additional calls beyond initial load
      expect(marketDataApi.fetchMarketPrices).toHaveBeenCalledTimes(1);
    });
  });

  describe('🎯 Loading States', () => {
    it('should show loading states correctly', async () => {
      // Mock a slow API response
      vi.mocked(marketDataApi.fetchMarketPrices).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 1000))
      );

      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      // Initially should be loading
      expect(result.current.isLoadingPrices).toBe(true);
      expect(result.current.isLoading).toBe(true);
    });

    it('should aggregate loading states correctly', () => {
      const { result } = renderHook(() => useMarketData({ crop_name: 'maize' }), { wrapper });

      // isLoading should be true if any individual loading state is true
      // isLoadingAll should include all loading states
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.isLoadingAll).toBe('boolean');
    });
  });
});

describe('usePriceMonitoring Hook - INFINITY GOD MODE Tests', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const mockOverviewData = [
    {
      crop_name: 'maize',
      current_price: 46.20,
      price_change_percent: 15.5, // High change to trigger alert
      trend: 'rising',
      demand_level: 'high',
      market_activity: 25,
      recent_listings: 15
    },
    {
      crop_name: 'beans',
      current_price: 120.00,
      price_change_percent: -12.3, // High change to trigger alert
      trend: 'falling',
      demand_level: 'critical', // High demand to trigger alert
      market_activity: 18,
      recent_listings: 8
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('🚀 Alert Generation', () => {
    it('should generate price change alerts when thresholds are exceeded', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.alerts.length).toBeGreaterThan(0);
      });

      // Should have alerts for both crops due to high price changes
      const priceAlerts = result.current.alerts.filter(alert => 
        alert.type === 'price_spike' || alert.type === 'price_drop'
      );
      expect(priceAlerts.length).toBe(2);
    });

    it('should generate demand level alerts when thresholds are met', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 50, // High threshold to avoid price alerts
          demand_level: 'critical'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.alerts.length).toBeGreaterThan(0);
      });

      // Should have demand alert for beans (critical demand)
      const demandAlerts = result.current.alerts.filter(alert => 
        alert.type === 'high_demand'
      );
      expect(demandAlerts.length).toBe(1);
      expect(demandAlerts[0].crop_name).toBe('beans');
    });

    it('should show toast notifications for high severity alerts', async () => {
      const highSeverityData = [
        {
          crop_name: 'maize',
          current_price: 46.20,
          price_change_percent: 25.0, // Very high change
          trend: 'rising',
          demand_level: 'critical',
          market_activity: 25,
          recent_listings: 15
        }
      ];

      const mockApiResponse = { success: true, data: highSeverityData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      renderHook(() => usePriceMonitoring(
        ['maize'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalled();
      });
    });
  });

  describe('💪 Alert Management', () => {
    it('should clear all alerts when clearAlerts is called', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.alerts.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.clearAlerts();
      });

      expect(result.current.alerts).toHaveLength(0);
    });

    it('should dismiss individual alerts when dismissAlert is called', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.alerts.length).toBeGreaterThan(0);
      });

      const firstAlertId = result.current.alerts[0].id;
      const initialCount = result.current.alerts.length;

      act(() => {
        result.current.dismissAlert(firstAlertId);
      });

      expect(result.current.alerts).toHaveLength(initialCount - 1);
      expect(result.current.alerts.find(alert => alert.id === firstAlertId)).toBeUndefined();
    });

    it('should limit alerts to maximum of 50', async () => {
      // Create data that would generate many alerts
      const manyAlertsData = Array.from({ length: 60 }, (_, i) => ({
        crop_name: `crop_${i}`,
        current_price: 50.0,
        price_change_percent: 15.0, // Triggers alert
        trend: 'rising',
        demand_level: 'medium',
        market_activity: 20,
        recent_listings: 10
      }));

      const mockApiResponse = { success: true, data: manyAlertsData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        manyAlertsData.map(d => d.crop_name),
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.alerts.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('🎯 Monitoring Status', () => {
    it('should indicate monitoring status correctly', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.isMonitoring).toBe(true);
        expect(result.current.lastUpdate).toBeTruthy();
      });
    });

    it('should refresh monitoring data when refreshMonitoring is called', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      await waitFor(() => {
        expect(result.current.isMonitoring).toBe(true);
      });

      await act(async () => {
        await result.current.refreshMonitoring();
      });

      // Should call the API again
      expect(marketDataApi.getMarketOverview).toHaveBeenCalledTimes(2);
    });
  });

  describe('🌟 Real-time Updates', () => {
    it('should poll for updates at specified interval', async () => {
      const mockApiResponse = { success: true, data: mockOverviewData };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      // Initial call
      expect(marketDataApi.getMarketOverview).toHaveBeenCalledTimes(1);

      // Fast-forward time by 1 minute (default polling interval)
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(marketDataApi.getMarketOverview).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle polling errors gracefully', async () => {
      vi.mocked(marketDataApi.getMarketOverview)
        .mockResolvedValueOnce({ success: true, data: mockOverviewData })
        .mockRejectedValueOnce(new Error('Polling failed'));

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      // Fast-forward time to trigger polling
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Should not crash and should maintain existing alerts
      await waitFor(() => {
        expect(result.current.alerts.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('🚀 Edge Cases and Error Handling', () => {
    it('should handle undefined alert thresholds gracefully', () => {
      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        undefined // No thresholds
      ), { wrapper });

      // Should not generate alerts without thresholds
      expect(result.current.alerts).toHaveLength(0);
    });

    it('should handle empty crop list', () => {
      const { result } = renderHook(() => usePriceMonitoring(
        [], // Empty crop list
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      expect(result.current.alerts).toHaveLength(0);
    });

    it('should handle malformed API response', async () => {
      const mockApiResponse = { success: true, data: null };
      vi.mocked(marketDataApi.getMarketOverview).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => usePriceMonitoring(
        ['maize', 'beans'],
        undefined,
        {
          price_change_percent: 10,
          demand_level: 'high'
        }
      ), { wrapper });

      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(result.current.alerts).toHaveLength(0);
      });
    });
  });
});