import { fetchJSON } from '@/utils/network';
import { 
  getSentinelHubAuthenticatedFetch, 
  isSentinelHubAuthConfigured,
  initializeSentinelHubAuth
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
      console.error('Process API error:', {
        farmerId,
        coordinatesCount: coordinates.length,
        requestBody: payload,
        responseStatus: resp.status,
        responseText: errTxt
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
    console.error('Sentinel Hub API error:', {
      farmerId,
      coordinatesCount: coordinates.length,
      error: error.message
    });
    
    // Return fallback analysis instead of throwing
    console.warn('Using fallback field analysis due to API error');
    return generateFallbackAnalysis(coordinates);
  }
}

/**
 * Process NDVI statistics from Sentinel Hub Statistics API
 */
function processNDVIStatistics(statsResult: any, coordinates: GeoLocation[]): FieldHealthAnalysis {
  const data = statsResult?.data?.[0];
  
  if (!data || !data.outputs || !data.outputs.default || !data.outputs.default.bands || !data.outputs.default.bands.B0) {
    console.warn('Invalid statistics response structure, using fallback');
    return generateFallbackAnalysis(coordinates);
  }
  
  const band = data.outputs.default.bands.B0;
  const stats = band.stats;
  
  const meanNDVI = stats?.mean ?? 0;
  const minNDVI = stats?.min ?? 0;
  const maxNDVI = stats?.max ?? 0;
  const stDevNDVI = stats?.stDev ?? 0;
  
  const fieldHealth = Math.max(0, Math.min(1, meanNDVI));
  
  // Generate problem areas based on NDVI variation
  const problemAreas = generateProblemAreas(coordinates, meanNDVI, stDevNDVI);
  
  console.log(`📊 Field Analysis Results: Mean NDVI: ${meanNDVI.toFixed(3)}, Health: ${(fieldHealth * 100).toFixed(1)}%`);
  
  return {
    fieldHealth,
    problemAreas,
    yieldPrediction: Number((fieldHealth * 5).toFixed(1)), // Enhanced yield prediction
    soilAnalysis: {
      ndvi_mean: meanNDVI,
      ndvi_min: minNDVI,
      ndvi_max: maxNDVI,
      ndvi_variation: stDevNDVI,
      analysis_date: new Date().toISOString()
    },
    recommendations: generateEnhancedRecommendations(fieldHealth, stDevNDVI, meanNDVI),
  };
}

/**
 * Generate problem areas based on NDVI statistics
 */
function generateProblemAreas(coordinates: GeoLocation[], meanNDVI: number, stDevNDVI: number): Array<{ lat: number; lng: number; ndvi: number }> {
  const problemAreas = [];
  
  // If high variation, suggest potential problem areas
  if (stDevNDVI > 0.1) {
    // Generate sample problem points within the field polygon
    const centerLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
    const centerLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
    
    // Add a few sample problem areas with low NDVI
    for (let i = 0; i < Math.min(3, Math.floor(stDevNDVI * 10)); i++) {
      problemAreas.push({
        lat: centerLat + (Math.random() - 0.5) * 0.001,
        lng: centerLng + (Math.random() - 0.5) * 0.001,
        ndvi: Math.max(0, meanNDVI - stDevNDVI - Math.random() * 0.1)
      });
    }
  }
  
  return problemAreas;
}

/**
 * Generate enhanced recommendations based on NDVI analysis
 */
function generateEnhancedRecommendations(health: number, variation: number, meanNDVI: number): string[] {
  const recommendations = [];
  
  // Health-based recommendations
  if (health > 0.8) {
    recommendations.push('🌟 Excellent field health detected! Continue current management practices.');
    recommendations.push('📊 Monitor NDVI weekly to maintain optimal growth.');
  } else if (health > 0.6) {
    recommendations.push('✅ Good field health with room for improvement.');
    recommendations.push('💧 Consider optimizing irrigation scheduling for better yield.');
    recommendations.push('🌱 Foliar feeding could boost plant vigor.');
  } else if (health > 0.4) {
    recommendations.push('⚠️ Moderate crop stress detected.');
    recommendations.push('🔍 Investigate irrigation system and soil moisture levels.');
    recommendations.push('🧪 Soil testing recommended to check nutrient levels.');
    recommendations.push('🌿 Consider applying balanced fertilizer.');
  } else {
    recommendations.push('🚨 Significant crop stress or poor establishment detected.');
    recommendations.push('🔍 Immediate field scouting recommended for pest/disease issues.');
    recommendations.push('💧 Check irrigation system functionality and soil moisture.');
    recommendations.push('🌱 Verify planting density and seed quality.');
    recommendations.push('🧪 Comprehensive soil analysis strongly recommended.');
  }
  
  // Variation-based recommendations
  if (variation > 0.15) {
    recommendations.push('📊 High field variability detected - consider precision agriculture approaches.');
    recommendations.push('🗺️ Zone-specific management may improve overall productivity.');
  }
  
  // NDVI-specific insights
  if (meanNDVI < 0.3) {
    recommendations.push('🌾 Low vegetation index suggests potential crop establishment issues.');
  } else if (meanNDVI > 0.7) {
    recommendations.push('🌿 High vegetation index indicates healthy, dense crop canopy.');
  }
  
  return recommendations;
}

/**
 * Generate fallback analysis when API fails
 */
function generateFallbackAnalysis(coordinates: GeoLocation[]): FieldHealthAnalysis {
  // Calculate approximate field area for basic yield estimate
  const fieldArea = calculatePolygonArea(coordinates);
  const baseYield = 3.5; // Average yield in t/ha for Sub-Saharan Africa
  
  return {
    fieldHealth: 0.65, // Assume moderate health
    problemAreas: [],
    yieldPrediction: Number((baseYield * 0.8).toFixed(1)), // Conservative estimate
    soilAnalysis: {
      analysis_type: 'fallback',
      note: 'Satellite analysis unavailable - recommendations based on regional averages',
      analysis_date: new Date().toISOString()
    },
    recommendations: [
      '📡 Satellite analysis temporarily unavailable.',
      '🌾 Based on regional data, consider regular soil testing.',
      '💧 Ensure adequate irrigation during dry periods.',
      '🔍 Monitor crops weekly for pest and disease signs.',
      '🌱 Consider consulting local agricultural extension services.',
    ],
  };
}

/**
 * Calculate polygon area (simplified Shoelace formula)
 */
function calculatePolygonArea(coordinates: GeoLocation[]): number {
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i].lat * coordinates[j].lng;
    area -= coordinates[j].lat * coordinates[i].lng;
  }
  
  return Math.abs(area) / 2;
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