/**
 * 🌾 CROPGENIUS – FARM HEALTH HOOK
 * -------------------------------------------------------------
 * PRODUCTION-READY React Query Hook for Farm Health Monitoring
 * - Real-time farm health data fetching with intelligent caching
 * - Comprehensive error handling and retry logic
 * - Real-time subscriptions for live health updates
 * - Performance optimizations for rural connectivity
 */

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { farmHealthService, FarmHealthData } from '@/services/FarmHealthService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseFarmHealthOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
  onSuccess?: (data: FarmHealthData) => void;
  onError?: (error: Error) => void;
  enableRealTimeUpdates?: boolean;
}

export interface FarmHealthQueryResult extends UseQueryResult<FarmHealthData, Error> {
  healthScore: number;
  isHealthy: boolean;
  hasAlerts: boolean;
  alertCount: number;
  lastUpdated: string | null;
  refreshHealth: () => Promise<void>;
  clearCache: () => void;
}

/**
 * PRODUCTION-READY Hook for fetching and managing farm health data
 */
export const useFarmHealth = (
  farmId: string,
  options: UseFarmHealthOptions = {}
): FarmHealthQueryResult => {
  const queryClient = useQueryClient();
  
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 10 * 60 * 1000, // 10 minutes
    onSuccess,
    onError,
    enableRealTimeUpdates = true
  } = options;

  // Main query for farm health data
  const query = useQuery({
    queryKey: ['farm-health', farmId],
    queryFn: async (): Promise<FarmHealthData> => {
      if (!farmId) {
        throw new Error('Farm ID is required for health monitoring');
      }

      try {
        const startTime = Date.now();
        const healthData = await farmHealthService.getFarmHealth(farmId);
        
        // Track performance metrics
        const duration = Date.now() - startTime;
        if (duration > 5000) {
          console.warn(`Farm health query took ${duration}ms for farm ${farmId}`);
        }

        // Call success callback
        onSuccess?.(healthData);

        return healthData;
      } catch (error) {
        console.error('Farm health query error:', error);
        
        // Call error callback
        onError?.(error as Error);
        
        // Show user-friendly error message
        toast.error('Failed to load farm health data', {
          description: 'Unable to fetch current farm health status. Please try again.',
        });
        
        throw error;
      }
    },
    enabled: enabled && !!farmId,
    staleTime,
    refetchInterval,
    retry: (failureCount, error) => {
      // Retry up to 3 times with exponential backoff
      if (failureCount >= 3) return false;
      
      // Don't retry on certain errors
      if (error.message.includes('Farm ID is required')) return false;
      
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enableRealTimeUpdates || !farmId || !enabled) return;

    let subscription: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to farm health snapshots
        subscription = supabase
          .channel(`farm-health-${farmId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'farm_health_snapshots',
              filter: `farm_id=eq.${farmId}`
            },
            (payload) => {
              console.log('Real-time farm health update:', payload);
              
              // Invalidate and refetch the query
              queryClient.invalidateQueries({ queryKey: ['farm-health', farmId] });
              
              // Show notification for significant changes
              if (payload.new?.health_score) {
                const currentData = queryClient.getQueryData<FarmHealthData>(['farm-health', farmId]);
                if (currentData) {
                  const scoreDiff = Math.abs(payload.new.health_score - currentData.healthScore);
                  if (scoreDiff > 0.1) {
                    toast.info('Farm health updated', {
                      description: `Health score changed to ${Math.round(payload.new.health_score * 100)}%`,
                    });
                  }
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Subscribed to farm health updates for farm ${farmId}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Error subscribing to farm health updates');
            }
          });
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [farmId, enabled, enableRealTimeUpdates, queryClient]);

  // Manual refresh function
  const refreshHealth = useCallback(async () => {
    try {
      // Clear cache and force refresh
      farmHealthService.clearCache(farmId);
      await queryClient.invalidateQueries({ queryKey: ['farm-health', farmId] });
      
      toast.success('Farm health data refreshed', {
        description: 'Latest health information has been loaded.',
      });
    } catch (error) {
      console.error('Error refreshing farm health:', error);
      toast.error('Failed to refresh health data', {
        description: 'Please try again in a moment.',
      });
    }
  }, [farmId, queryClient]);

  // Clear cache function
  const clearCache = useCallback(() => {
    farmHealthService.clearCache(farmId);
    queryClient.removeQueries({ queryKey: ['farm-health', farmId] });
  }, [farmId, queryClient]);

  // Derived values for convenience
  const healthScore = query.data?.healthScore ?? 0;
  const isHealthy = healthScore >= 0.7;
  const hasAlerts = (query.data?.alerts?.length ?? 0) > 0;
  const alertCount = query.data?.alerts?.length ?? 0;
  const lastUpdated = query.data?.lastUpdated ?? null;

  return {
    ...query,
    healthScore,
    isHealthy,
    hasAlerts,
    alertCount,
    lastUpdated,
    refreshHealth,
    clearCache,
  };
};

/**
 * Hook for fetching health data for multiple farms
 */
export const useMultipleFarmHealth = (
  farmIds: string[],
  options: Omit<UseFarmHealthOptions, 'enableRealTimeUpdates'> = {}
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    refetchInterval = 15 * 60 * 1000,
    onSuccess,
    onError
  } = options;

  return useQuery({
    queryKey: ['multiple-farm-health', farmIds.sort()],
    queryFn: async (): Promise<Map<string, FarmHealthData>> => {
      if (farmIds.length === 0) {
        return new Map();
      }

      try {
        const healthData = await farmHealthService.getMultipleFarmHealth(farmIds);
        onSuccess?.(Array.from(healthData.values())[0]); // Call with first farm's data
        return healthData;
      } catch (error) {
        console.error('Multiple farm health query error:', error);
        onError?.(error as Error);
        throw error;
      }
    },
    enabled: enabled && farmIds.length > 0,
    staleTime,
    refetchInterval,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook for farm health analytics and trends
 */
export const useFarmHealthAnalytics = (
  farmId: string,
  period: '7d' | '30d' | '90d' = '30d',
  options: Pick<UseFarmHealthOptions, 'enabled'> = {}
) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['farm-health-analytics', farmId, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farm_health_snapshots')
        .select('health_score, trust_indicators, created_at')
        .eq('farm_id', farmId)
        .gte('created_at', new Date(Date.now() - getPeriodMs(period)).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch health analytics: ${error.message}`);
      }

      return {
        snapshots: data || [],
        averageHealth: data?.length ? data.reduce((sum, s) => sum + s.health_score, 0) / data.length : 0,
        trend: calculateTrend(data || []),
        period
      };
    },
    enabled: enabled && !!farmId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

/**
 * Utility function to get period in milliseconds
 */
function getPeriodMs(period: '7d' | '30d' | '90d'): number {
  switch (period) {
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
    default: return 30 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Calculate trend from health snapshots
 */
function calculateTrend(snapshots: any[]): 'improving' | 'declining' | 'stable' {
  if (snapshots.length < 2) return 'stable';

  const first = snapshots[0].health_score;
  const last = snapshots[snapshots.length - 1].health_score;
  const diff = last - first;

  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

/**
 * Hook for invalidating farm health cache
 */
export const useInvalidateFarmHealth = () => {
  const queryClient = useQueryClient();

  return useCallback((farmId?: string) => {
    if (farmId) {
      queryClient.invalidateQueries({ queryKey: ['farm-health', farmId] });
      farmHealthService.clearCache(farmId);
    } else {
      queryClient.invalidateQueries({ queryKey: ['farm-health'] });
      farmHealthService.clearCache();
    }
  }, [queryClient]);
};