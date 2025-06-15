import { fetchJSON } from '@/utils/network';

export interface GeoLocation {
  lat: number;
  lng: number;
  region?: string;
}

export interface MarketIntelligence {
  currentPrices: Record<string, number>; // crop -> price per kg in USD
  priceHistory: Record<string, Array<{ date: string; price: number }>>;
  bestMarkets: Array<{ market: string; distanceKm: number; avgPrice: number }>;
  transportCosts: number; // usd/tonne estimate
  profitProjections: Record<string, number>; // crop -> $/ha potential
}

const AFRICAMARKETS_ENDPOINT = 'https://api.africamarkets.com/prices';
const ESOKO_ENDPOINT = 'https://api.esoko.com/market-prices';

export async function getLocalPrices(location: GeoLocation, crops: string[]): Promise<MarketIntelligence> {
  const [am, esoko] = await Promise.all([
    fetchMarketData(AFRICAMARKETS_ENDPOINT, { location: `${location.lat},${location.lng}`, crops: crops.join(',') }),
    fetchMarketData(ESOKO_ENDPOINT, { region: location.region ?? '' }),
  ]);

  const merged = [...am, ...esoko];

  const currentPrices: Record<string, number> = {};
  merged.forEach((p) => {
    if (!currentPrices[p.crop] || p.price > currentPrices[p.crop]) {
      currentPrices[p.crop] = p.price;
    }
  });

  // Basic history placeholder (real implementation should query DB)
  const history: Record<string, Array<{ date: string; price: number }>> = {};
  Object.keys(currentPrices).forEach((crop) => {
    history[crop] = [{ date: new Date().toISOString().slice(0, 10), price: currentPrices[crop] }];
  });

  const bestMarkets = merged
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
    .map((m) => ({ market: m.market, distanceKm: m.distance_km, avgPrice: m.price }));

  const transportCosts = estimateTransport(location);

  const profitProjections: Record<string, number> = {};
  Object.keys(currentPrices).forEach((crop) => {
    profitProjections[crop] = Number(((currentPrices[crop] - transportCosts / 1000) * 1000).toFixed(0));
  });

  return { currentPrices, priceHistory: history, bestMarkets, transportCosts, profitProjections };
}

async function fetchMarketData(url: string, params: Record<string, string>) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  try {
    const data = await fetchJSON(`${url}?${qs}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[MarketIntelligence] fetch error', url, err);
    return [];
  }
}

function estimateTransport(location: GeoLocation) {
  // Very naive: $0.08 per km per tonne, assume 50 km avg to market.
  return 0.08 * 50 * 1; // USD / tonne
} 