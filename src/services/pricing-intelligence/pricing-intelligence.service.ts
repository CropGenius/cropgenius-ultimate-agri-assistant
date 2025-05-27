import { CacheManager } from './cache/cache-manager';
import { ExchangeRateService } from './services/exchange-rate.service';
import { WFPDataSource } from './data-sources/wfp-source';
import { TradingEconomicsSource } from './data-sources/trading-economics-source';
import { PriceAnalyzer } from './analytics/price-analyzer';
import { AdviceGenerator } from './services/advice-generator';
import { 
  BasePrice, 
  NormalizedPrice, 
  MarketDataResponse, 
  PricingError, 
  ERROR_CODES,
  OutputMode,
  Language,
  Trend
} from './models/types';

const DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface PriceAnalysis {
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceChangePct: number;
  trend: Trend;
  volatility: number;
  anomalyScore: number;
}

export class PricingIntelligenceService {
  private static instance: PricingIntelligenceService;
  private readonly cache: CacheManager;
  private readonly exchangeRateService: ExchangeRateService;
  private readonly priceAnalyzer: PriceAnalyzer;
  private readonly adviceGenerator: AdviceGenerator;
  
  // Data sources (primary first, fallbacks follow)
  private readonly dataSources = [
    new WFPDataSource(process.env.WFP_API_KEY || ''),
    new TradingEconomicsSource(process.env.TRADING_ECONOMICS_API_KEY || '')
  ];

  private constructor() {
    this.cache = CacheManager.getInstance();
    this.exchangeRateService = ExchangeRateService.getInstance();
    this.priceAnalyzer = new PriceAnalyzer();
    this.adviceGenerator = AdviceGenerator.getInstance();
  }

  public static getInstance(): PricingIntelligenceService {
    if (!PricingIntelligenceService.instance) {
      PricingIntelligenceService.instance = new PricingIntelligenceService();
    }
    return PricingIntelligenceService.instance;
  }

  /**
   * Main method to get market data for a crop and location
   */
  public async getMarketData(
    crop: string,
    location: string,
    currency: string = 'USD',
    mode: OutputMode = 'dashboard',
    language: Language = 'en'
  ): Promise<MarketDataResponse> {
    try {
      // Validate inputs
      if (!crop || !location) {
        throw new PricingError(
          'Crop and location are required',
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Generate cache key
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = this.generateCacheKey({
        crop,
        location,
        currency,
        date: today,
        mode,
        language,
      });

      // Try to get from cache first
      const cachedData = await this.cache.get<MarketDataResponse>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Fetch data from available sources
      const prices = await this.fetchPricesFromSources(crop, location, currency);
      
      // Normalize prices to a common currency (USD)
      const normalizedPrices = await this.normalizePrices(prices);
      
      // Analyze price data
      const analysis = this.analyzePrices(normalizedPrices);
      
      // Generate response based on output mode
      const response = await this.formatResponse({
        crop,
        location,
        currency,
        mode,
        language,
        prices: normalizedPrices,
        analysis,
        source: prices[0]?.source || 'Multiple sources',
      });

      // Cache the result
      await this.cache.set(cacheKey, response, DEFAULT_CACHE_TTL);

      return response;
    } catch (error) {
      console.error('Error in getMarketData:', error);
      throw error instanceof PricingError 
        ? error 
        : new PricingError(
            'Failed to fetch market data',
            ERROR_CODES.NETWORK_ERROR,
            true,
            error
          );
    }
  }

  /**
   * Clear all cached data (for testing or emergency updates)
   */
  public async clearCache(): Promise<void> {
    await this.cache.clearAll();
  }

  // Private helper methods

  private async fetchPricesFromSources(
    crop: string,
    location: string,
    currency: string
  ): Promise<BasePrice[]> {
    let lastError: Error | null = null;
    
    for (const source of this.dataSources) {
      try {
        const sourcePrices = await source.fetchPriceData({ crop, location, currency });
        if (sourcePrices && sourcePrices.length > 0) {
          return sourcePrices;
        }
      } catch (error) {
        console.error(`Error fetching from ${source.constructor.name}:`, error);
        lastError = error as Error;
        continue; // Try next source
      }
    }
    
    throw lastError || new PricingError(
      'No price data available from any source',
      ERROR_CODES.DATA_UNAVAILABLE
    );
  }

  private async normalizePrices(prices: BasePrice[]): Promise<NormalizedPrice[]> {
    return Promise.all(prices.map(price => this.normalizePrice(price)));
  }

  private async normalizePrice(price: BasePrice): Promise<NormalizedPrice> {
    // If already in USD, no conversion needed
    if (price.currency === 'USD') {
      return {
        ...price,
        normalizedPrice: price.price,
        normalizedCurrency: 'USD',
        exchangeRate: 1,
      };
    }

    // Convert to USD
    const exchangeRate = await this.exchangeRateService.getExchangeRate(
      price.currency,
      'USD'
    );

    return {
      ...price,
      normalizedPrice: price.price * exchangeRate,
      normalizedCurrency: 'USD',
      exchangeRate,
    };
  }

  private analyzePrices(prices: NormalizedPrice[]): PriceAnalysis {
    return this.priceAnalyzer.analyzePrices(prices);
  }

  private generateCacheKey(params: {
    crop: string;
    location: string;
    currency: string;
    date: string;
    mode: string;
    language: string;
  }): string {
    const { crop, location, currency, date, mode, language } = params;
    return `${crop}:${location}:${currency}:${date}:${mode}:${language}`
      .toLowerCase()
      .replace(/[^a-z0-9:]/g, '-');
  }

  private async formatResponse(params: {
    crop: string;
    location: string;
    currency: string;
    mode: OutputMode;
    language: Language;
    prices: NormalizedPrice[];
    analysis: PriceAnalysis;
    source: string;
  }): Promise<MarketDataResponse> {
    const {
      crop,
      location,
      currency,
      mode,
      language,
      prices,
      analysis,
      source,
    } = params;

    const latestPrice = prices[prices.length - 1];
    
    // Convert prices to requested currency if needed
    const convertToCurrency = async (usdAmount: number) => {
      if (currency === 'USD') return usdAmount;
      return this.exchangeRateService.convertAmount(usdAmount, 'USD', currency);
    };

    // Generate advice
    const { advice, confidence } = this.adviceGenerator.generateAdvice(
      analysis.trend,
      analysis.volatility,
      analysis.priceChangePct,
      language,
      crop,
      await convertToCurrency(analysis.currentPrice)
    );

    // Format response based on mode
    const baseResponse: MarketDataResponse = {
      crop,
      location,
      currency,
      price_today: await convertToCurrency(analysis.currentPrice),
      price_last_week: await convertToCurrency(analysis.averagePrice),
      change_pct: analysis.priceChangePct,
      trend: analysis.trend,
      volatility_score: analysis.volatility,
      anomaly_flag: analysis.anomalyScore > 0.8,
      advice: { [language]: advice },
      source,
      updated_at: new Date().toISOString(),
      confidence,
      metadata: {}, // Initialize empty metadata that will be populated based on mode
    };

    // Add mode-specific fields
    switch (mode) {
      case 'dashboard':
        return {
          ...baseResponse,
          metadata: {
            min_price: await convertToCurrency(analysis.minPrice),
            max_price: await convertToCurrency(analysis.maxPrice),
            price_history: await Promise.all(
              prices.map(async p => ({
                price: await convertToCurrency(p.normalizedPrice),
                date: p.timestamp,
                source: p.source,
              }))
            ),
            confidence_indicators: {
              data_freshness: this.calculateDataFreshness(prices),
              source_reliability: this.calculateSourceReliability(source),
              data_consistency: 1 - analysis.volatility,
            },
          },
        };

      case 'sms':
        return {
          ...baseResponse,
          advice: {
            [language]: this.adviceGenerator.generateSMSAdvice(
              analysis.trend,
              analysis.volatility,
              analysis.priceChangePct,
              language,
              crop,
              await convertToCurrency(analysis.currentPrice)
            ),
          },
        };

      case 'pro_api':
        return {
          ...baseResponse,
          metadata: {
            ...baseResponse.metadata,
            raw_data: prices,
            analysis: {
              moving_averages: {
                sma_7: await this.calculateMovingAverage(prices, 7, convertToCurrency),
                sma_30: await this.calculateMovingAverage(prices, 30, convertToCurrency),
              },
              support_level: await convertToCurrency(analysis.minPrice * 0.98),
              resistance_level: await convertToCurrency(analysis.maxPrice * 1.02),
              rsi: this.calculateRSI(prices.map(p => p.normalizedPrice)),
              macd: this.calculateMACD(prices.map(p => p.normalizedPrice)),
            },
          },
        };

      default:
        return baseResponse;
    }
  }

  private calculateDataFreshness(prices: NormalizedPrice[]): number {
    if (prices.length === 0) return 0;
    
    const now = new Date();
    const latestTimestamp = new Date(prices[prices.length - 1].timestamp).getTime();
    const freshnessHours = (now.getTime() - latestTimestamp) / (1000 * 60 * 60);
    
    // Score from 0 to 1, with 1 being the freshest (within last hour)
    return Math.max(0, 1 - (freshnessHours / 24));
  }

  private calculateSourceReliability(source: string): number {
    // Simple reliability scoring - can be enhanced with more sophisticated logic
    const reliabilityScores: Record<string, number> = {
      'WFP DataBridges': 0.95,
      'Trading Economics': 0.85,
      'Multiple sources': 0.9,
    };
    
    return reliabilityScores[source] || 0.7;
  }

  private async calculateMovingAverage(
    prices: NormalizedPrice[],
    period: number,
    convert: (amount: number) => Promise<number>
  ): Promise<number | null> {
    if (prices.length < period) return null;
    
    const relevantPrices = prices.slice(-period);
    const sum = relevantPrices.reduce((acc, p) => acc + p.normalizedPrice, 0);
    const avg = sum / relevantPrices.length;
    
    return convert(avg);
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Neutral RSI if not enough data
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gains and losses
    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        gains += diff;
      } else {
        losses -= diff; // Convert to positive
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period || 1; // Avoid division by zero
    
    // Calculate subsequent values
    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      
      if (diff >= 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - diff) / period;
      }
    }
    
    const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macdLine: number; signalLine: number; histogram: number } | null {
    if (prices.length < slowPeriod + signalPeriod) return null;
    
    // Calculate EMAs
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    // Calculate MACD line
    const macdLine = fastEMA - slowEMA;
    
    // Calculate Signal line (EMA of MACD line)
    const signalLine = this.calculateEMA(
      prices.map((_, i) => i >= slowPeriod - 1 ? macdLine : 0).filter(Boolean),
      signalPeriod
    );
    
    // Calculate Histogram
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  }

  private calculateEMA(prices: number[], period: number): number {
    const k = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * k + ema;
    }
    
    return ema;
  }
}
