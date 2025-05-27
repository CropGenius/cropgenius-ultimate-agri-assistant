import { ExchangeRateResponse, PricingError, ERROR_CODES } from '../models/types';
import { CacheManager } from '../cache/cache-manager';

const OPEN_EXCHANGE_RATES_APP_ID = process.env.OPEN_EXCHANGE_RATES_APP_ID || '';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class ExchangeRateService {
  private cache: CacheManager;
  private static instance: ExchangeRateService;

  private constructor() {
    this.cache = CacheManager.getInstance();
  }

  public static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Get exchange rate from one currency to another
   */
  public async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    const cacheKey = `fx_${fromCurrency}_${toCurrency}`;
    
    // Check cache first
    const cachedRate = await this.cache.get<number>(cacheKey);
    if (cachedRate !== null) {
      return cachedRate;
    }

    try {
      let rate: number;
      
      if (fromCurrency === 'USD') {
        // Fetch rates with USD as base
        const rates = await this.fetchExchangeRates('USD');
        rate = rates[toCurrency];
      } else if (toCurrency === 'USD') {
        // Fetch rates with target as base and invert
        const rates = await this.fetchExchangeRates(fromCurrency);
        rate = 1 / rates.USD;
      } else {
        // Convert through USD as intermediary
        const usdToFrom = await this.getExchangeRate('USD', fromCurrency);
        const usdToTo = await this.getExchangeRate('USD', toCurrency);
        rate = usdToTo / usdToFrom;
      }

      if (!rate || isNaN(rate)) {
        throw new Error('Invalid exchange rate received');
      }

      // Cache the result
      await this.cache.set(cacheKey, rate, CACHE_TTL);
      
      return rate;
    } catch (error) {
      console.error('Error in getExchangeRate:', error);
      throw new PricingError(
        `Failed to get exchange rate from ${fromCurrency} to ${toCurrency}: ${error.message}`,
        ERROR_CODES.NETWORK_ERROR,
        true,
        error
      );
    }
  }

  /**
   * Convert amount from one currency to another
   */
  public async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Fetch latest exchange rates from Open Exchange Rates API
   */
  private async fetchExchangeRates(
    baseCurrency: string = 'USD'
  ): Promise<Record<string, number>> {
    const cacheKey = `fx_rates_${baseCurrency}`;
    
    // Check cache first
    const cachedRates = await this.cache.get<Record<string, number>>(cacheKey);
    if (cachedRates) {
      return cachedRates;
    }

    try {
      const url = `https://open.forex-api.com/v6/latest?base=${baseCurrency}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid response format from exchange rate API');
      }

      // Cache the result
      await this.cache.set(cacheKey, data.rates, CACHE_TTL);
      
      return data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Fallback to hardcoded rates if API fails
      console.warn('Using fallback exchange rates');
      return this.getFallbackRates(baseCurrency);
    }
  }

  /**
   * Fallback exchange rates (updated monthly, for emergency use only)
   */
  private getFallbackRates(baseCurrency: string): Record<string, number> {
    // Last updated: May 2025
    const usdRates: Record<string, number> = {
      USD: 1,
      KES: 150.50,  // Kenyan Shilling
      NGN: 750.25,  // Nigerian Naira
      GHS: 11.80,   // Ghanaian Cedi
      XAF: 600.00,  // CFA Franc BEAC
      ZAR: 18.75,   // South African Rand
      TZS: 2300.00, // Tanzanian Shilling
      UGX: 3700.00, // Ugandan Shilling
      XOF: 600.00,  // CFA Franc BCEAO
      ZMW: 20.50,   // Zambian Kwacha
      EUR: 0.92,    // Euro
      GBP: 0.79,    // British Pound
    };

    // If base is USD, return as is
    if (baseCurrency === 'USD') {
      return usdRates;
    }

    // Convert base currency to USD first
    const baseToUsd = 1 / (usdRates[baseCurrency] || 1);
    
    // Convert all rates to the new base
    const result: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(usdRates)) {
      result[currency] = rate * baseToUsd;
    }
    
    return result;
  }
}
