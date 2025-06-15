import { fetchJSON } from '@/utils/network';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface FieldHealthAnalysis {
  fieldHealth: number; // 0-1 NDVI average
  problemAreas: Array<{ lat: number; lng: number; ndvi: number }>;
  yieldPrediction: number; // tonnes/ha estimate
  soilAnalysis?: any;
  recommendations: string[];
}

const SENTINEL_API = 'https://services.sentinel-hub.com/api/v1/process';
const SENTINEL_TOKEN = import.meta.env.VITE_SENTINEL_ACCESS_TOKEN;

if (!SENTINEL_TOKEN) {
  console.warn('[Sentinel] VITE_SENTINEL_ACCESS_TOKEN not set. Field analysis will be disabled.');
}

// Evalscript calculating NDVI and returning single band image (0-1)
const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ['B08', 'B04'],
    output: { bands: 1, sampleType: 'FLOAT32' }
  };
}
function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return [ndvi];
}`;

/**
 * Analyse a polygon field using Sentinel-2 imagery.
 * Coordinates should be in EPSG:4326 (lat/lng pairs) and form a closed polygon (first == last).
 */
export async function analyzeField(coordinates: GeoLocation[], farmerId?: string): Promise<FieldHealthAnalysis> {
  if (!SENTINEL_TOKEN) throw new Error('Sentinel Hub token not configured');

  // Ensure polygon is closed
  const closed = [...coordinates];
  if (coordinates[0].lat !== coordinates[coordinates.length - 1].lat || coordinates[0].lng !== coordinates[coordinates.length - 1].lng) {
    closed.push(coordinates[0]);
  }

  const payload = {
    input: {
      bounds: {
        geometry: {
          type: 'Polygon',
          coordinates: [closed.map((c) => [c.lng, c.lat])],
        },
      },
      data: [{ type: 'sentinel-2-l2a' }],
    },
    evalscript: NDVI_EVALSCRIPT,
    output: {
      width: 256,
      height: 256,
      responses: [{ identifier: 'default', format: { type: 'image/tiff' } }],
    },
  };

  // Sentinel expects fetch body as JSON.
  const resp = await fetch(`${SENTINEL_API}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENTINEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Sentinel API error: ${resp.status} ${resp.statusText} – ${errTxt}`);
  }

  // We receive a binary TIFF. For simplicity, compute average NDVI via sentinel statistical API instead.
  const statsPayload = {
    input: payload.input,
    aggregation: {
      timeRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      aggregationInterval: { of: 'P1D' },
      evalscript: NDVI_EVALSCRIPT,
    },
    calculations: { default: { statistics: { default: { stats: ['mean'] } } } },
  };

  const statsResp = await fetchJSON(`https://services.sentinel-hub.com/api/v1/statistics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENTINEL_TOKEN}`,
    },
    body: statsPayload,
  });

  const meanNDVI: number = statsResp?.statistics?.default?.mean ?? 0;

  const fieldHealth = Math.max(0, Math.min(1, meanNDVI));

  return {
    fieldHealth,
    problemAreas: [], // For now skip per-pixel classification (requires image decode)
    yieldPrediction: Number((fieldHealth * 5).toFixed(1)), // naive conversion to t/ha
    soilAnalysis: null,
    recommendations: generateRecommendations(fieldHealth),
  };
}

function generateRecommendations(health: number): string[] {
  if (health > 0.7) return ['Field appears healthy – keep monitoring NDVI weekly.'];
  if (health > 0.5)
    return [
      'Moderate stress detected – investigate irrigation scheduling.',
      'Consider foliar feed to boost vigour.',
    ];
  return [
    'Low NDVI indicates crop stress or poor establishment.',
    'Scout for pest/disease and verify planting density.',
    'Check soil fertility and moisture levels.',
  ];
} 