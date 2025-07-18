import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchWeatherData } from '@/services/weatherService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number };
    humidity: number;
    rainfall: number;
    conditions: string;
  }>;
  farmingInsights: {
    plantingRecommendations: string[];
    irrigationSchedule: Array<{
      date: string;
      amount: number;
      duration: number;
      fieldId: string;
    }>;
    pestRisk: {
      level: string;
      pests: string[];
      preventionMeasures: string[];
    };
    harvestTiming: string;
    fieldWorkWindows: string[];
  };
}

export const useWeather = (lat: number, lng: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for weather data with database caching
  const weatherQuery = useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: async (): Promise<WeatherData> => {
      // First, try to get cached weather data from database
      const { data: cachedWeather } = await supabase
        .from('weather_data')
        .select('*')
        .eq('location', `${lat},${lng}`)
        .gte('recorded_at', new Date(Date.now() - 3600000).toISOString()) // 1 hour cache
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedWeather) {
        return {
          temperature: cachedWeather.temperature || 0,
          humidity: cachedWeather.humidity || 0,
          rainfall: cachedWeather.rainfall || 0,
          windSpeed: cachedWeather.wind_speed || 0,
          condition: cachedWeather.condition || 'Unknown',
          forecast: cachedWeather.forecast_data || [],
          farmingInsights: {
            plantingRecommendations: [],
            irrigationSchedule: [],
            pestRisk: { level: 'low', pests: [], preventionMeasures: [] },
            harvestTiming: '',
            fieldWorkWindows: []
          }
        };
      }

      // If no cached data, fetch from API
      const apiData = await fetchWeatherData({
        lat,
        lon: lng,
        units: 'metric',
        lang: 'en',
        exclude: 'minutely,hourly'
      });

      // Store in database for caching
      await supabase.from('weather_data').insert({
        location: `${lat},${lng}`,
        temperature: apiData.temperature,
        humidity: apiData.humidity,
        rainfall: apiData.rainfall,
        wind_speed: apiData.windSpeed,
        condition: apiData.forecast[0]?.conditions || 'Unknown',
        forecast_data: apiData.forecast,
        recorded_at: new Date().toISOString()
      });

      return apiData;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!(lat && lng),
    retry: (failureCount, error) => {
      // Don't retry if it's an API key error
      if (error?.message?.includes('401') || error?.message?.includes('API key')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Real-time subscription for weather updates
  const subscribeToWeatherUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('weather-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'weather_data'
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['weather'] });
        toast.info('Weather data updated');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    weather: weatherQuery.data,
    isLoading: weatherQuery.isLoading,
    error: weatherQuery.error,
    refetch: weatherQuery.refetch,
    subscribeToWeatherUpdates
  };
};