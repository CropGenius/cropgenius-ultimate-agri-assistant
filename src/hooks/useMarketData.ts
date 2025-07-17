/**
 * Market Data Hook
 * Production-ready hook for market intelligence with caching and real-time updates
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMarketPrices,
  calculatePriceTrends,
  generateDemandIndicators,
  getMarketAnalysis,
  getMarketOverview,
  type MarketPrice,
  type PriceTrend,
  type DemandIndicator,
  type MarketAnalysis,
  type LocationFilter
} from '@/api/marketDataApi';

interface UseMarketDataOptions {
  crop_name?: string;
  location_filter?: LocationFilter;
  auto_refresh?: boolean;
  refresh_interval?: number; // in milliseconds
}

export const useMarketData = (options: UseMarketDataOptions = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    crop_name: options.crop_name || '',
    location: '',
    date_range: {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    sort_by: 'date' as 'price' | 'date' | 'location',
    sort_order: 'desc' as 'asc' | 'desc'
  });

  // Market prices query
  const {
    data: marketPricesData,
    isLoading: isLoadingPrices,
    error: pricesError,
    refetch: refetchPrices
  } = useQuery({
    queryKey: ['market-prices', filters],
    queryFn: () => fetchMarketPrices({
      crop_name: filters.crop_name || undefined,
      location_filter: filters.location ? { location: filters.location } : options.location_filter,
      date_range: filters.date_range,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      limit: 100
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchInterval: options.auto_refresh ? (options.refresh_interval || 300000) : false // 5 minutes default
  });

  // Price trends query
  const {
    data: priceTrendData,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends
  } = useQuery({
    queryKey: ['price-trends', filters.crop_name, options.location_filter],
    queryFn: () => calculatePriceTrends(
      filters.crop_name || 'maize',
      30,
      options.location_filter
    ),
    enabled: !!filters.crop_name,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  });

  // Demand indicators query
  const {
    data: demandData,
    isLoading: isLoadingDemand,
    error: demandError,
    refetch: refetchDemand
  } = useQuery({
    queryKey: ['demand-indicators', filters.crop_name, options.location_filter],
    queryFn: () => generateDemandIndicators(
      filters.crop_name || 'maize',
      options.location_filter
    ),
    enabled: !!filters.crop_name,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2
  });

  // Market analysis query (comprehensive)
  const {
    data: marketAnalysisData,
    isLoading: isLoadingAnalysis,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['market-analysis', filters.crop_name, options.location_filter],
    queryFn: () => getMarketAnalysis(
      filters.crop_name || 'maize',
      options.location_filter?.coordinates,
      100
    ),
    enabled: !!filters.crop_name,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  });

  // Market overview query (multiple crops)
  const {
    data: marketOverviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['market-overview', options.location_filter],
    queryFn: () => getMarketOverview(
      ['maize', 'beans', 'tomato', 'rice', 'cassava'],
      options.location_filter
    ),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2
  });

  // Filter handlers
  const handleCropChange = useCallback((crop_name: string) => {
    setFilters(prev => ({ ...prev, crop_name }));
  }, []);

  const handleLocationChange = useCallback((location: string) => {
    setFilters(prev => ({ ...prev, location }));
  }, []);

  const handleDateRangeChange = useCallback((start_date: string, end_date: string) => {
    setFilters(prev => ({
      ...prev,
      date_range: { start_date, end_date }
    }));
  }, []);

  const handleSortChange = useCallback((
    sort_by: 'price' | 'date' | 'location',
    sort_order: 'asc' | 'desc'
  ) => {
    setFilters(prev => ({ ...prev, sort_by, sort_order }));
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(() => {
    const promises = [
      refetchPrices(),
      refetchTrends(),
      refetchDemand(),
      refetchAnalysis(),
      refetchOverview()
    ];

    Promise.all(promises)
      .then(() => {
        toast.success('Market data refreshed successfully');
      })
      .catch(() => {
        toast.error('Failed to refresh some market data');
      });
  }, [refetchPrices, refetchTrends, refetchDemand, refetchAnalysis, refetchOverview]);

  // Auto-refresh effect
  useEffect(() => {
    if (options.auto_refresh) {
      const interval = setInterval(refreshAllData, options.refresh_interval || 300000);
      return () => clearInterval(interval);
    }
  }, [options.auto_refresh, options.refresh_interval, refreshAllData]);

  // Extract data from responses
  const marketPrices = marketPricesData?.success ? marketPricesData.data as MarketPrice[] : [];
  const priceTrend = priceTrendData?.success ? priceTrendData.data as PriceTrend : null;
  const demandIndicator = demandData?.success ? demandData.data as DemandIndicator : null;
  const marketAnalysis = marketAnalysisData?.success ? marketAnalysisData.data as MarketAnalysis : null;
  const marketOverview = marketOverviewData?.success ? marketOverviewData.data : [];

  // Loading states
  const isLoading = isLoadingPrices || isLoadingTrends || isLoadingDemand;
  const isLoadingAll = isLoading || isLoadingAnalysis || isLoadingOverview;

  // Error states
  const hasError = !!(pricesError || trendsError || demandError || analysisError || overviewError);
  const errorMessage = pricesError?.message || trendsError?.message || demandError?.message || 
                      analysisError?.message || overviewError?.message || 'Unknown error occurred';

  return {
    // Data
    marketPrices,
    priceTrend,
    demandIndicator,
    marketAnalysis,
    marketOverview,
    
    // Loading states
    isLoading,
    isLoadingAll,
    isLoadingPrices,
    isLoadingTrends,
    isLoadingDemand,
    isLoadingAnalysis,
    isLoadingOverview,
    
    // Error states
    hasError,
    errorMessage,
    pricesError,
    trendsError,
    demandError,
    analysisError,
    overviewError,
    
    // Filters
    filters,
    handleCropChange,
    handleLocationChange,
    handleDateRangeChange,
    handleSortChange,
    
    // Actions
    refreshAllData,
    refetchPrices,
    refetchTrends,
    refetchDemand,
    refetchAnalysis,
    refetchOverview
  };
};

/**
 * Hook for specific crop market analysis
 */
export const useCropMarketAnalysis = (
  crop_name: string,
  farmer_location?: { lat: number; lng: number }
) => {
  return useQuery({
    queryKey: ['crop-market-analysis', crop_name, farmer_location],
    queryFn: () => getMarketAnalysis(crop_name, farmer_location),
    enabled: !!crop_name,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  });
};

/**
 * Hook for real-time price monitoring
 */
export const usePriceMonitoring = (
  crop_names: string[],
  location_filter?: LocationFilter,
  alert_thresholds?: {
    price_change_percent: number;
    demand_level: 'high' | 'critical';
  }
) => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    crop_name: string;
    type: 'price_spike' | 'price_drop' | 'high_demand' | 'low_supply';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  const { data: overviewData, refetch } = useQuery({
    queryKey: ['price-monitoring', crop_names, location_filter],
    queryFn: () => getMarketOverview(crop_names, location_filter),
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Check for alerts
  useEffect(() => {
    if (overviewData?.success && alert_thresholds) {
      const newAlerts: typeof alerts = [];
      const data = overviewData.data as any[];

      data.forEach(crop => {
        const alertId = `${crop.crop_name}-${Date.now()}`;
        
        // Price change alerts
        if (Math.abs(crop.price_change_percent) >= alert_thresholds.price_change_percent) {
          newAlerts.push({
            id: alertId,
            crop_name: crop.crop_name,
            type: crop.price_change_percent > 0 ? 'price_spike' : 'price_drop',
            message: `${crop.crop_name} price ${crop.price_change_percent > 0 ? 'increased' : 'decreased'} by ${Math.abs(crop.price_change_percent).toFixed(1)}%`,
            timestamp: new Date().toISOString(),
            severity: Math.abs(crop.price_change_percent) > 20 ? 'high' : 'medium'
          });
        }

        // Demand alerts
        if (crop.demand_level === alert_thresholds.demand_level) {
          newAlerts.push({
            id: `${alertId}-demand`,
            crop_name: crop.crop_name,
            type: 'high_demand',
            message: `${crop.crop_name} showing ${crop.demand_level} demand levels`,
            timestamp: new Date().toISOString(),
            severity: crop.demand_level === 'critical' ? 'high' : 'medium'
          });
        }
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
        
        // Show toast for high severity alerts
        newAlerts.forEach(alert => {
          if (alert.severity === 'high') {
            toast.warning(alert.message, {
              description: `Market alert for ${alert.crop_name}`,
              duration: 10000
            });
          }
        });
      }
    }
  }, [overviewData, alert_thresholds]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    clearAlerts,
    dismissAlert,
    isMonitoring: !!overviewData,
    lastUpdate: overviewData?.success ? new Date().toISOString() : null,
    refreshMonitoring: refetch
  };
};