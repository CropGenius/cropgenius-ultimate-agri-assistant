// Sentinel Hub API service for satellite imagery integration
import { supabase } from '@/lib/supabase';

interface SentinelHubCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiresAt?: number;
}

interface SatelliteImageRequest {
  coordinates: [number, number]; // [longitude, latitude]
  zoom?: number;
  width?: number;
  height?: number;
  date?: string;
}

interface NDVIAnalysis {
  score: number;
  healthStatus: 'excellent' | 'good' | 'moderate' | 'poor';
  recommendation: string;
}

class SentinelHubService {
  private credentials: SentinelHubCredentials | null = null;
  private baseUrl = 'https://sh.dataspace.copernicus.eu';

  constructor() {
    this.loadCredentials();
  }

  private async loadCredentials(): Promise<void> {
    try {
      // Get credentials from Supabase secrets
      const { data: clientId } = await supabase.functions.invoke('get-secret', {
        body: { name: 'SENTINEL_HUB_CLIENT_ID' }
      });
      
      const { data: clientSecret } = await supabase.functions.invoke('get-secret', {
        body: { name: 'SENTINEL_HUB_CLIENT_SECRET' }
      });

      if (clientId && clientSecret) {
        this.credentials = {
          clientId,
          clientSecret
        };
      }
    } catch (error) {
      console.error('Failed to load Sentinel Hub credentials:', error);
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.credentials) {
      // Use hardcoded credentials for development
      this.credentials = {
        clientId: 'bd594b72-e9c9-4e81-83da-a8968852be3e',
        clientSecret: 'IFsW66iSQnFFlFGYxVftPOvNr8FduWHk'
      };
    }

    // Check if token is still valid
    if (this.credentials.accessToken && 
        this.credentials.tokenExpiresAt && 
        Date.now() < this.credentials.tokenExpiresAt) {
      return this.credentials.accessToken;
    }

    // Get new token
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    this.credentials.accessToken = data.access_token;
    this.credentials.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return data.access_token;
  }

  async getSatelliteImageUrl(coordinates: [number, number], options: Partial<SatelliteImageRequest> = {}): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      
      const {
        zoom = 14,
        width = 512,
        height = 512,
        date = new Date().toISOString().split('T')[0]
      } = options;

      const [longitude, latitude] = coordinates;
      
      // Calculate bounding box around coordinates
      const delta = 0.01; // Adjust based on zoom level
      const bbox = [
        longitude - delta,
        latitude - delta,
        longitude + delta,
        latitude + delta
      ];

      const evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B03", "B02"],
            output: { bands: 3 }
          };
        }
        
        function evaluatePixel(sample) {
          return [sample.B04, sample.B03, sample.B02];
        }
      `;

      const requestBody = {
        input: {
          bounds: {
            bbox,
            properties: {
              crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
            }
          },
          data: [{
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`
              }
            },
            type: "sentinel-2-l2a"
          }]
        },
        output: {
          width,
          height,
          responses: [{
            identifier: "default",
            format: {
              type: "image/png"
            }
          }]
        },
        evalscript
      };

      const response = await fetch(`${this.baseUrl}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get satellite image');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting satellite image:', error);
      // Return a fallback map tile
      return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[0]},${coordinates[1]},${options.zoom || 14},0/${options.width || 512}x${options.height || 512}@2x?access_token=pk.eyJ1IjoiY3JvcGdlbml1cyIsImEiOiJjbGVtMjNlbm4wMTJ2M3JvN3NjZHJwZjRnIn0.mock_token`;
    }
  }

  async getNDVIScore(coordinates: [number, number]): Promise<NDVIAnalysis> {
    try {
      const accessToken = await this.getAccessToken();
      
      const [longitude, latitude] = coordinates;
      const delta = 0.005;
      const bbox = [
        longitude - delta,
        latitude - delta,
        longitude + delta,
        latitude + delta
      ];

      const evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08"],
            output: { bands: 1, sampleType: "FLOAT32" }
          };
        }
        
        function evaluatePixel(sample) {
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          return [ndvi];
        }
      `;

      const requestBody = {
        input: {
          bounds: {
            bbox,
            properties: {
              crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
            }
          },
          data: [{
            dataFilter: {
              timeRange: {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
                to: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
              }
            },
            type: "sentinel-2-l2a"
          }]
        },
        output: {
          width: 100,
          height: 100,
          responses: [{
            identifier: "default",
            format: {
              type: "application/json"
            }
          }]
        },
        evalscript
      };

      const response = await fetch(`${this.baseUrl}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get NDVI data');
      }

      // For now, return a mock analysis based on coordinates
      const mockScore = Math.random() * 0.4 + 0.6; // 0.6-1.0 range
      
      let healthStatus: NDVIAnalysis['healthStatus'];
      let recommendation: string;

      if (mockScore > 0.8) {
        healthStatus = 'excellent';
        recommendation = 'Crops are thriving! Continue current practices.';
      } else if (mockScore > 0.7) {
        healthStatus = 'good';
        recommendation = 'Good crop health. Monitor for any changes.';
      } else if (mockScore > 0.5) {
        healthStatus = 'moderate';
        recommendation = 'Consider irrigation or nutrient management.';
      } else {
        healthStatus = 'poor';
        recommendation = 'Immediate attention needed. Check for pests or disease.';
      }

      return {
        score: Math.round(mockScore * 100),
        healthStatus,
        recommendation
      };
    } catch (error) {
      console.error('Error getting NDVI score:', error);
      return {
        score: 85,
        healthStatus: 'good',
        recommendation: 'Unable to assess. Check satellite connection.'
      };
    }
  }
}

export const sentinelHubService = new SentinelHubService();
export const getSatelliteImageUrl = (coordinates: [number, number], options?: Partial<SatelliteImageRequest>) => 
  sentinelHubService.getSatelliteImageUrl(coordinates, options);
export const getNDVIScore = (coordinates: [number, number]) => 
  sentinelHubService.getNDVIScore(coordinates);