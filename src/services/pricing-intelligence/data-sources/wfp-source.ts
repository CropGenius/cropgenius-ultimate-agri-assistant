import { BasePrice, DataSourceConfig, PricingError, ERROR_CODES } from '../models/types';
import { BaseDataSource } from './base-source';

// WFP API Response Schema
const WFPResponseSchema = {
  data: [
    {
      commodity: '',
      market: '',
      price: 0,
      unit: 'KG',
      currency: 'USD',
      date: '',
      location: {
        name: '',
        admin1: '',
        admin2: '',
        market: '',
        lat: 0,
        lng: 0,
      },
    },
  ],
};

type WFPResponse = typeof WFPResponseSchema;

export class WFPDataSource extends BaseDataSource {
  private static readonly DEFAULT_CONFIG: DataSourceConfig = {
    baseUrl: 'https://api.vam.wfp.org/api/prices',
    timeout: 10000, // 10 seconds
    retries: 2,
    cacheTtl: 3600, // 1 hour
  };

  constructor(apiKey: string, config: Partial<DataSourceConfig> = {}) {
    super(
      { ...WFPDataSource.DEFAULT_CONFIG, ...config, apiKey },
      'WFP DataBridges'
    );
  }

  async fetchPriceData(params: {
    crop: string;
    location: string;
    currency?: string;
  }): Promise<BasePrice[]> {
    const { crop, location, currency = 'USD' } = params;
    
    const normalizedCrop = this.normalizeCropName(crop);
    const normalizedLocation = this.normalizeLocation(location);
    
    try {
      const url = new URL(this.config.baseUrl);
      url.searchParams.append('commodity', normalizedCrop);
      url.searchParams.append('market', normalizedLocation);
      url.searchParams.append('format', 'json');
      
      // Add date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      url.searchParams.append('from', startDate.toISOString().split('T')[0]);
      url.searchParams.append('to', endDate.toISOString().split('T')[0]);
      
      const response = await this.fetchWithRetry<WFPResponse>(
        url.toString(),
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json',
          },
        },
        WFPResponseSchema as any // Type assertion for simplicity
      );

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new PricingError(
          `No data available for ${crop} in ${location}`,
          ERROR_CODES.DATA_UNAVAILABLE
        );
      }

      // Process and validate the response
      return response.data.map(item => ({
        crop: item.commodity,
        location: item.market || item.location?.name || location,
        price: item.price,
        currency: item.currency || 'USD',
        unit: item.unit?.toLowerCase() || 'kg',
        source: 'WFP DataBridges',
        timestamp: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      if (error instanceof PricingError) {
        throw error;
      }
      throw new PricingError(
        `Failed to fetch WFP data: ${error.message}`,
        ERROR_CODES.NETWORK_ERROR,
        true,
        error
      );
    }
  }

  // Override with WFP-specific normalization
  protected normalizeCropName(crop: string): string {
    // WFP uses specific commodity codes, map common names to these codes
    const cropMapping: Record<string, string> = {
      'maize': 'Maize (white)',
      'wheat': 'Wheat (mixed)',
      'rice': 'Rice (milled)',
      // Add more mappings as needed
    };
    
    const normalized = super.normalizeCropName(crop).toLowerCase();
    return cropMapping[normalized] || crop;
  }
}
