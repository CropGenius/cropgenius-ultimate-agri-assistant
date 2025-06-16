import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';

/**
 * UserMeta shape – kept deliberately minimal for now.
 * Later we can extend with theme, language, etc.
 */
export interface UserMeta {
  firstName?: string;
  farmName?: string;
  locale: string;
  coords?: { lat: number; lon: number };
  place?: string; // human-readable locality
  weather?: { tempC: number; condition: string };
}

interface Ctx extends UserMeta {
  setCoords: (coords: { lat: number; lon: number; place?: string }) => void;
  setWeather: (w: { tempC: number; condition: string }) => void;
}

const defaultMeta: UserMeta = {
  locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
};

const UserMetaContext = createContext<Ctx | undefined>(undefined);

export const useUserMeta = () => {
  const ctx = useContext(UserMetaContext);
  if (!ctx) throw new Error('useUserMeta must be used within <UserMetaProvider>');
  return ctx;
};

export const UserMetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState<UserMeta>(defaultMeta);

  // pull basics from Supabase profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, farm_name, farm_lat, farm_lon')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setMeta((m) => ({
          ...m,
          firstName: data.first_name ?? m.firstName,
          farmName: data.farm_name ?? m.farmName,
          coords: data.farm_lat && data.farm_lon ? { lat: data.farm_lat, lon: data.farm_lon } : m.coords,
        }));
      }
    })();
  }, []);

  const setCoords = useCallback((c: { lat: number; lon: number; place?: string }) => {
    setMeta((m) => ({ ...m, coords: { lat: c.lat, lon: c.lon }, place: c.place ?? m.place }));
  }, []);

  const setWeather = useCallback((w: { tempC: number; condition: string }) => {
    setMeta((m) => ({ ...m, weather: w }));
  }, []);

  return (
    <UserMetaContext.Provider value={{ ...meta, setCoords, setWeather }}>
      {children}
    </UserMetaContext.Provider>
  );
};
