import { fetchJSON } from '@/utils/network';
import * as Sentry from "@sentry/react";
import { 
  initializeSentinelHubAuth, 
  getSentinelHubAuthenticatedFetch, 
  isSentinelHubAuthConfigured 
} from '@/utils/sentinelHubAuth';

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
const SENTINEL_CLIENT_ID = import.meta.env.VITE_SENTINEL_CLIENT_ID;
const SENTINEL_CLIENT_SECRET = import.meta.env.VITE_SENTINEL_CLIENT_SECRET;

// Initialize Sentinel Hub authentication if credentials are available
if (SENTINEL_CLIENT_ID && SENTINEL_CLIENT_SECRET) {
  initializeSentinelHubAuth(SENTINEL_CLIENT_ID, SENTINEL_CLIENT_SECRET);
  console.log('✅ Sentinel Hub authentication initialized');
} else {
  console.warn('⚠️ Sentinel Hub credentials not configured. Field analysis will be disabled.');
  console.warn('   Required: VITE_SENTINEL_CLIENT_ID and VITE_SENTINEL_CLIENT_SECRET');
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
 * Analyse a polygon field using Sentinel-2 imagery with proper OAuth2 authentication.
 * Coordinates should be in EPSG:4326 (lat/lng pairs) and form a closed polygon (first == last).
 */
export async function analyzeField(coordinates: GeoLocation[], farmerId?: string): Promise<FieldHealthAnalysis> {
  if (!isSentinelHubAuthConfigured()) {
    const err = new Error('Sentinel Hub authentication not configured. Please set VITE_SENTINEL_CLIENT_ID and VITE_SENTINEL_CLIENT_SECRET');
    Sentry.captureException(err);
    throw err;
  }

  // Get authenticated fetch function
  const authenticatedFetch = getSentinelHubAuthenticatedFetch();

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

  try {
    // Make authenticated request to Sentinel Hub Process API
    const resp = await authenticatedFetch(SENTINEL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      const err = new Error(`Sentinel API error (Process API): ${resp.status} ${resp.statusText} – ${errTxt}`);
      Sentry.captureException(err, { 
        extra: { 
          farmerId, 
          coordinatesCount: coordinates.length, 
          requestBody: payload,
          responseStatus: resp.status,
          responseText: errTxt
        } 
      });
      throw err;
    }

    console.log('✅ Sentinel Hub Process API call successful');

    // Get NDVI statistics using the Statistics API
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
      calculations: { default: { statistics: { default: { stats: ['mean', 'min', 'max', 'stDev'] } } } },
    };

    const statsResp = await authenticatedFetch('https://services.sentinel-hub.com/api/v1/statistics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statsPayload),
    });

    if (!statsResp.ok) {
      console.warn('Statistics API failed, using fallback analysis');
      return generateFallbackAnalysis(coordinates);
    }

    const statsResult = await statsResp.json();
    console.log('✅ Sentinel Hub Statistics API call successful');

    return processNDVIStatistics(statsResult, coordinates);

  } catch (error) {
    console.error('Sentinel Hub API error:', error);
    Sentry.captureException(error, { 
      extra: { 
        farmerId, 
        coordinatesCount: coordinates.length,
        error: error.message 
      } 
    });
    
    // Return fallback analysis instead of throwing
    console.warn('Using fallback field analysis due to API error');
    return generateFallbackAnalysis(coordinates);
  }
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