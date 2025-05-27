import { z } from 'zod';
import { BasePrice, DataSourceConfig, PricingError, ERROR_CODES } from '../models/types';

export abstract class BaseDataSource {
  protected config: DataSourceConfig;
  protected name: string;

  constructor(config: DataSourceConfig, name: string) {
    this.config = config;
    this.name = name;
  }

  /**
   * Fetch price data for a specific crop and location
   */
  abstract fetchPriceData(params: {
    crop: string;
    location: string;
    currency?: string;
  }): Promise<BasePrice[]>;

  /**
   * Helper method to make HTTP requests with retries and timeouts
   */
  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    schema: z.ZodSchema<T>,
    retries = this.config.retries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter && attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
              continue;
            }
            throw new PricingError(
              'Rate limited by data source',
              ERROR_CODES.RATE_LIMITED,
              true
            );
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return schema.parse(data);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) except 429
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
          break;
        }

        // Exponential backoff
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new PricingError(
      `Failed to fetch data after ${retries + 1} attempts: ${lastError?.message}`,
      lastError instanceof PricingError ? lastError.code : ERROR_CODES.NETWORK_ERROR,
      true,
      lastError
    );
  }

  /**
   * Helper to validate and normalize location names
   */
  protected normalizeLocation(location: string): string {
    return location
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-');
  }

  /**
   * Helper to validate and normalize crop names
   */
  protected normalizeCropName(crop: string): string {
    return crop
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
