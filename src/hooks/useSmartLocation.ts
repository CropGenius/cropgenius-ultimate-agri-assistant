import { useEffect } from 'react';
import { useUserMeta } from '@/context/UserMetaContext';

/**
 * Attempts to obtain user coordinates silently.
 * 1. If geolocation permission already granted -> use it.
 * 2. Else falls back to IP-based geolocation.
 */
export const useSmartLocation = () => {
  const { coords, setCoords } = useUserMeta();

  useEffect(() => {
    if (coords) return; // already have

    const tryGeo = async () => {
      try {
        if (!navigator.permissions) throw new Error('no-permissions-api');
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            },
            () => fetchIP(),
            { enableHighAccuracy: false, timeout: 5000 }
          );
        } else {
          fetchIP();
        }
      } catch (e) {
        fetchIP();
      }
    };

    const fetchIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const json = await res.json();
        if (json && json.latitude && json.longitude) {
          setCoords({ lat: json.latitude, lon: json.longitude, place: `${json.city}, ${json.country_name}` });
        }
      } catch {
        /* swallow */
      }
    };

    tryGeo();
  }, [coords, setCoords]);
};
