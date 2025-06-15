import { fetchJSON } from './network';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export async function reverseGeocode({ lat, lng }: GeoLocation): Promise<string> {
  const OWM_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  if (OWM_KEY) {
    try {
      const res = await fetchJSON<Array<{ name: string; state?: string; country?: string }>>(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OWM_KEY}`
      );
      if (res?.length) {
        const place = res[0];
        return `${place.name}${place.state ? ', ' + place.state : ''}, ${place.country}`;
      }
    } catch (err) {
      console.warn('[reverseGeocode] OWM failed', err);
    }
  }

  // Fallback to Nominatim (no key required, but limited rate)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
    const data: any = await fetchJSON(url, {
      headers: { 'User-Agent': 'CropGenius/1.0' },
    });
    if (data?.display_name) {
      // Use first two components
      const parts = data.display_name.split(',').map((s: string) => s.trim());
      return parts.slice(0, 2).join(', ');
    }
  } catch (err) {
    console.warn('[reverseGeocode] nominatim failed', err);
  }

  return 'Unknown Location';
} 