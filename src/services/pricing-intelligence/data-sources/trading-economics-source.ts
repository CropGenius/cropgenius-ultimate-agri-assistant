import { BasePrice, DataSourceConfig, PricingError, ERROR_CODES } from '../models/types';
import { BaseDataSource } from './base-source';

// Trading Economics API Response Schema
const TEResponseSchema = {
  Country: '',
  Category: '',
  Last: 0,
  Previous: 0,
  LatestValueDate: '',  
  Unit: '',
  URL: '',
  CategoryGroup: ''
};

type TEResponse = typeof TEResponseSchema[];

export class TradingEconomicsSource extends BaseDataSource {
  private static readonly DEFAULT_CONFIG: DataSourceConfig = {
    baseUrl: 'https://api.tradingeconomics.com/markets/commodity',
    timeout: 10000, // 10 seconds
    retries: 1, // Fewer retries for fallback
    cacheTtl: 10800, // 3 hours
  };

  constructor(apiKey: string, config: Partial<DataSourceConfig> = {}) {
    super(
      { ...TradingEconomicsSource.DEFAULT_CONFIG, ...config, apiKey },
      'Trading Economics'
    );
  }

  async fetchPriceData(params: {
    crop: string;
    location: string;
    currency?: string;
  }): Promise<BasePrice[]> {
    const { crop } = params;
    
    try {
      const commodityCode = this.mapCropToCommodity(crop);
      const url = new URL(`${this.config.baseUrl}/${commodityCode}`);
      url.searchParams.append('c', `${this.config.apiKey}`);
      url.searchParams.append('f', 'json');
      
      const response = await this.fetchWithRetry<TEResponse>(
        url.toString(),
        { headers: { 'Accept': 'application/json' } },
        TEResponseSchema as any // Type assertion for simplicity
      );

      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new PricingError(
          `No Trading Economics data available for ${crop}`,
          ERROR_CODES.DATA_UNAVAILABLE
        );
      }

      // Get the most recent data point
      const latestData = response[0];
      
      // Calculate price change percentage
      const priceChangePct = latestData.Previous 
        ? ((latestData.Last - latestData.Previous) / latestData.Previous) * 100 
        : 0;
      
      return [{
        crop,
        location: 'Global', // Trading Economics provides global prices
        price: latestData.Last,
        currency: 'USD', // TE provides prices in USD
        unit: this.normalizeUnit(latestData.Unit || 'MT'),
        source: 'Trading Economics',
        timestamp: latestData.LatestValueDate || new Date().toISOString(),
        metadata: {
          previousPrice: latestData.Previous,
          priceChangePct,
          url: latestData.URL,
        },
      }];
    } catch (error) {
      if (error instanceof PricingError) {
        throw error;
      }
      throw new PricingError(
        `Failed to fetch Trading Economics data: ${error.message}`,
        ERROR_CODES.NETWORK_ERROR,
        true,
        error
      );
    }
  }

  private mapCropToCommodity(crop: string): string {
    const commodityMap: Record<string, string> = {
      'maize': 'corn',
      'wheat': 'wheat',
      'rice': 'rice',
      'soybeans': 'soybeans',
      'coffee': 'coffee',
      'cocoa': 'cocoa',
      'sugar': 'sugar',
      'cotton': 'cotton',
      // Add more mappings as needed
    };

    const normalizedCrop = this.normalizeCropName(crop);
    return commodityMap[normalizedCrop] || 'corn'; // Default to corn if no mapping found
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'MT': 'ton',
      'KG': 'kg',
      'LB': 'lb',
      'BU': 'bushel',
      'OZ': 'oz',
    };

    return unitMap[unit.toUpperCase()] || unit.toLowerCase();
  }
}
