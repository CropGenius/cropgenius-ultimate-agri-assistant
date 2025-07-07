/**
 * 🧠 BACKEND INTELLIGENCE HOOKS - AI Magic
 * React Query hooks for trillion-dollar data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getCurrentUser } from '@/lib/supabaseClient';

// User Farms Hook
export const useUserFarms = () => {
  return useQuery({
    queryKey: ['user-farms'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          fields (
            id,
            name,
            crop_type,
            size,
            planted_at,
            harvest_date
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: true
  });
};

// Crop History Hook
export const useCropHistory = (farmId?: string) => {
  return useQuery({
    queryKey: ['crop-history', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
    staleTime: 10 * 60 * 1000
  });
};

// Disease Scan Hook
export const useDiseaseScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ image, cropType, location }: {
      image: string;
      cropType: string;
      location: { lat: number; lng: number };
    }) => {
      const response = await fetch('/api/agents/disease-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, cropType, location })
      });
      
      if (!response.ok) throw new Error('Disease scan failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease-history'] });
    }
  });
};

// Market Prices Hook
export const useMarketPrices = (region?: string) => {
  return useQuery({
    queryKey: ['market-prices', region],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!region,
    staleTime: 2 * 60 * 1000, // 2 minutes for market data
    refetchInterval: 5 * 60 * 1000 // Auto-refresh every 5 minutes
  });
};

// Weather Forecast Hook
export const useWeatherForecast = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['weather-forecast', lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error('Location required');
      
      const response = await fetch(`/api/agents/weather-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      
      if (!response.ok) throw new Error('Weather fetch failed');
      return response.json();
    },
    enabled: !!(lat && lng),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000 // Refresh hourly
  });
};

// Farm Health Score Hook
export const useFarmHealthScore = () => {
  return useQuery({
    queryKey: ['farm-health-score'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      const response = await fetch('/api/agents/farm-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) throw new Error('Health score fetch failed');
      return response.json();
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000
  });
};

// Satellite Field Analysis Hook
export const useSatelliteAnalysis = (fieldCoordinates?: Array<{ lat: number; lng: number }>) => {
  return useQuery({
    queryKey: ['satellite-analysis', fieldCoordinates],
    queryFn: async () => {
      if (!fieldCoordinates || fieldCoordinates.length < 3) {
        throw new Error('Field coordinates required');
      }
      
      const response = await fetch('/api/agents/satellite-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: fieldCoordinates })
      });
      
      if (!response.ok) throw new Error('Satellite analysis failed');
      return response.json();
    },
    enabled: !!(fieldCoordinates && fieldCoordinates.length >= 3),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchInterval: false // Manual refresh only
  });
};