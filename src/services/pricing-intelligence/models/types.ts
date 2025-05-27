import { z } from 'zod';

export type Currency = 'USD' | 'KES' | 'NGN' | 'GHS' | 'XAF' | 'ZAR' | 'TZS' | 'UGX' | 'XOF' | 'ZMW';
export type Trend = 'rising' | 'falling' | 'stable';
export type OutputMode = 'dashboard' | 'sms' | 'pro_api' | 'logistics';
export type Language = 'en' | 'sw' | 'yo' | 'fr';

// Base price data schema
export const BasePriceSchema = z.object({
  crop: z.string().min(1, 'Crop name is required'),
  location: z.string().min(1, 'Location is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  unit: z.string().default('kg'),
  source: z.string().min(1, 'Source is required'),
  timestamp: z.string().datetime(),
});

export type BasePrice = z.infer<typeof BasePriceSchema>;

// Normalized price data schema
export const NormalizedPriceSchema = BasePriceSchema.extend({
  normalizedPrice: z.number().positive(),
  normalizedCurrency: z.string().length(3).default('USD'),
  exchangeRate: z.number().positive(),
  confidence: z.number().min(0).max(1).default(1),
});

export type NormalizedPrice = z.infer<typeof NormalizedPriceSchema>;

// Market data response schema
export const MarketDataResponseSchema = z.object({
  crop: z.string(),
  location: z.string(),
  price_today: z.number().positive(),
  currency: z.string().length(3),
  price_last_week: z.number().positive(),
  change_pct: z.number(),
  trend: z.enum(['rising', 'falling', 'stable']),
  volatility_score: z.number().min(0).max(1),
  anomaly_flag: z.boolean(),
  advice: z.record(z.string()),
  source: z.string(),
  updated_at: z.string().datetime(),
  confidence: z.number(),
  metadata: z.object({
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    price_history: z.array(
      z.object({
        price: z.number(),
        date: z.string(),
        source: z.string(),
      })
    ).optional(),
    confidence_indicators: z.object({
      data_freshness: z.number(),
      source_reliability: z.number(),
      data_consistency: z.number(),
    }).optional(),
    raw_data: z.array(z.unknown()).optional(),
    analysis: z.object({
      moving_averages: z.record(z.number().nullable()).optional(),
      support_level: z.number().optional(),
      resistance_level: z.number().optional(),
      rsi: z.number().optional(),
      macd: z.unknown().optional(),
    }).optional(),
  }).optional(),
});

export type MarketDataResponse = z.infer<typeof MarketDataResponseSchema>;

// Cache key components
export interface CacheKey {
  crop: string;
  location: string;
  currency: string;
  date: string; // YYYY-MM-DD
}

// Exchange rate response
export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Data source configuration
export interface DataSourceConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  cacheTtl: number; // in seconds
}

// Error types
export class PricingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly isRetryable: boolean = false,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PricingError';
  }
}

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  DATA_UNAVAILABLE: 'DATA_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  CACHE_ERROR: 'CACHE_ERROR',
} as const;
