import { useState, useEffect } from 'react';
import { fetchWeatherData } from '@/services/weatherService';

interface UseOpenWeatherProps {
  lat: number | null;
  lon: number | null;
  enabled?: boolean;
}

export const useOpenWeather = ({ lat, lon, enabled = true }: UseOpenWeatherProps) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || lat === null || lon === null) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherData({
          lat,
          lon,
          units: 'metric',
          lang: 'en',
          exclude: 'minutely,hourly',
        });
        setWeatherData(data);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lon, enabled]);

  return {
    data: weatherData,
    loading,
    error,
  };
};
