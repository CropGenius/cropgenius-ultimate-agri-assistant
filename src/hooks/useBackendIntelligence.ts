import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const useUserFarms = () => {
  return useQuery({
    queryKey: ['user-farms'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from('farms')
        .select('*, fields(*)')
        .eq('user_id', user.id);
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000
  });
};

export const useFarmHealthScore = () => {
  return useQuery({
    queryKey: ['farm-health-score'],
    queryFn: async () => ({
      data: {
        overallHealth: 85,
        alerts: [
          { type: 'weather', severity: 'medium', message: 'Heavy rain expected tomorrow', icon: '🌧️' },
          { type: 'disease', severity: 'low', message: 'Crop health is excellent', icon: '🌱' }
        ],
        factors: {
          cropHealth: 90,
          diseaseRisk: 15
        }
      }
    }),
    staleTime: 15 * 60 * 1000
  });
};

export const useMarketPrices = (region?: string) => {
  return useQuery({
    queryKey: ['market-prices', region],
    queryFn: async () => [
      { price_analysis: { trend_direction: 'up' } }
    ],
    enabled: !!region,
    staleTime: 2 * 60 * 1000
  });
};

export const useWeatherForecast = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ['weather-forecast', lat, lng],
    queryFn: async () => ({
      data: {
        insights: { pest_risk: 'low' }
      }
    }),
    enabled: !!(lat && lng),
    staleTime: 30 * 60 * 1000
  });
};