import { useEffect } from 'react';
import { useUserMeta } from '@/context/UserMetaContext';
import { supabase } from '@/lib/supabaseClient';

export const useWeather = () => {
  const { coords, setWeather } = useUserMeta();

  useEffect(() => {
    if (!coords) return;
    const fetchWeather = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('weather', {
          body: { lat: coords.lat, lon: coords.lon },
        });
        if (error) throw error;
        if (data) {
          setWeather(data as { tempC: number; condition: string });
        }
      } catch {
        /* swallow */
      }
    };
    fetchWeather();
  }, [coords, setWeather]);
};
