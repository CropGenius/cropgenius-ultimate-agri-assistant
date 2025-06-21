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
        .from('profiles')
        .select('full_name, farm_name, location')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        // Parse location if it's stored as a string in format 'lat,lng'
        let coords;
        if (data.location) {
          const [lat, lon] = data.location.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lon)) {
            coords = { lat, lon };
          }
        }
        
        setMeta((m) => ({
          ...m,
          firstName: data.full_name?.split(' ')[0] ?? m.firstName,
          farmName: data.farm_name,
          ...(coords && { coords })
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
