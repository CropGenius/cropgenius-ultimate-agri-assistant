import { BasePrice, NormalizedPrice, PricingError, ERROR_CODES } from '../models/types';

export class PriceAnalyzer {
  /**
   * Analyze price trends and generate insights
   */
  public analyzePrices(prices: NormalizedPrice[]): {
    currentPrice: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceChangePct: number;
    trend: 'rising' | 'falling' | 'stable';
    volatility: number;
    anomalyScore: number;
  } {
    if (prices.length === 0) {
      throw new PricingError('No price data provided for analysis', ERROR_CODES.INVALID_INPUT);
    }

    // Sort prices by timestamp (oldest first)
    const sortedPrices = [...prices].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const currentPrice = sortedPrices[sortedPrices.length - 1].normalizedPrice;
    const pricesOnly = sortedPrices.map(p => p.normalizedPrice);
    
    // Calculate basic statistics
    const averagePrice = this.calculateAverage(pricesOnly);
    const minPrice = Math.min(...pricesOnly);
    const maxPrice = Math.max(...pricesOnly);
    
    // Calculate price change percentage (current vs first)
    const firstPrice = sortedPrices[0].normalizedPrice;
    const priceChangePct = firstPrice !== 0 
      ? ((currentPrice - firstPrice) / firstPrice) * 100 
      : 0;

    // Determine trend
    const trend = this.determineTrend(priceChangePct);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(pricesOnly);
    
    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(sortedPrices);

    return {
      currentPrice,
      averagePrice,
      minPrice,
      maxPrice,
      priceChangePct,
      trend,
      volatility,
      anomalyScore,
    };
  }

  /**
   * Calculate simple moving average
   */
  public calculateSMA(prices: number[], period: number): number[] {
    if (prices.length < period) {
      throw new PricingError(
        `Not enough data points for SMA(${period})`,
        ERROR_CODES.INVALID_INPUT
      );
    }

    const sma: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }

    return sma;
  }

  /**
   * Calculate volatility (standard deviation of returns)
   */
  public calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const prevPrice = prices[i - 1];
      const currentPrice = prices[i];
      
      if (prevPrice !== 0) {
        returns.push((currentPrice - prevPrice) / prevPrice);
      }
    }

    if (returns.length === 0) return 0;

    // Calculate average return
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    // Calculate variance
    const variance = returns.reduce((sum, r) => {
      return sum + Math.pow(r - avgReturn, 2);
    }, 0) / (returns.length - 1);
    
    // Standard deviation (volatility)
    return Math.sqrt(variance);
  }

  /**
   * Detect price anomalies using Z-score
   */
  public detectAnomalies(
    prices: NormalizedPrice[], 
    threshold: number = 2.5
  ): { index: number; price: NormalizedPrice; zScore: number }[] {
    if (prices.length < 3) return []; // Need at least 3 points for meaningful analysis
    
    const values = prices.map(p => p.normalizedPrice);
    const mean = this.calculateAverage(values);
    const stdDev = this.calculateStandardDeviation(values);
    
    if (stdDev === 0) return []; // No variation in data
    
    const anomalies: { index: number; price: NormalizedPrice; zScore: number }[] = [];
    
    for (let i = 0; i < prices.length; i++) {
      const zScore = Math.abs((values[i] - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push({
          index: i,
          price: prices[i],
          zScore,
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Calculate an anomaly score (0-1) for the latest price
   */
  private calculateAnomalyScore(prices: NormalizedPrice[]): number {
    if (prices.length < 3) return 0; // Not enough data
    
    const values = prices.map(p => p.normalizedPrice);
    const latestPrice = values[values.length - 1];
    
    // Use median absolute deviation (MAD) for more robust anomaly detection
    const median = this.calculateMedian(values);
    const deviations = values.map(v => Math.abs(v - median));
    const mad = this.calculateMedian(deviations);
    
    // Modified z-score
    const modifiedZScore = 0.6745 * (latestPrice - median) / (1.4826 * mad);
    
    // Convert to 0-1 scale (0 = normal, 1 = extreme anomaly)
    return Math.min(1, Math.max(0, Math.abs(modifiedZScore) / 5));
  }

  private determineTrend(changePct: number): 'rising' | 'falling' | 'stable' {
    const THRESHOLD = 2; // Percentage threshold to consider a meaningful change
    
    if (changePct > THRESHOLD) return 'rising';
    if (changePct < -THRESHOLD) return 'falling';
    return 'stable';
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = this.calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.calculateAverage(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
}
