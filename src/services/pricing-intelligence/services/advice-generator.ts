import { 
  Trend, 
  PricingError, 
  ERROR_CODES,
  NormalizedPrice 
} from '../models/types';

interface AdviceTemplates {
  [key: string]: {
    [key in Trend]: {
      highVolatility: string;
      mediumVolatility: string;
      lowVolatility: string;
    };
  };
}

export class AdviceGenerator {
  private static instance: AdviceGenerator;
  private templates: AdviceTemplates;

  private constructor() {
    this.templates = this.initializeTemplates();
  }

  public static getInstance(): AdviceGenerator {
    if (!AdviceGenerator.instance) {
      AdviceGenerator.instance = new AdviceGenerator();
    }
    return AdviceGenerator.instance;
  }

  /**
   * Generate advice based on price analysis
   */
  public generateAdvice(
    trend: Trend,
    volatility: number,
    priceChangePct: number,
    language: string = 'en',
    crop?: string,
    currentPrice?: number
  ): {
    advice: string;
    confidence: number;
    metadata: Record<string, unknown>;
  } {
    try {
      // Get the appropriate template based on language
      const template = this.templates[language] || this.templates.en;
      
      // Determine volatility level
      const volatilityLevel = this.getVolatilityLevel(volatility);
      
      // Get the base message
      let message = '';
      
      if (trend === 'rising') {
        message = template.rising[volatilityLevel];
      } else if (trend === 'falling') {
        message = template.falling[volatilityLevel];
      } else {
        message = template.stable[volatilityLevel];
      }
      
      // Replace placeholders
      if (crop) {
        message = message.replace(/{crop}/g, crop);
      }
      
      if (currentPrice !== undefined) {
        message = message.replace(/{price}/g, currentPrice.toFixed(2));
      }
      
      // Calculate confidence (0-1)
      const confidence = this.calculateConfidence(volatility, Math.abs(priceChangePct));
      
      return {
        advice: message,
        confidence,
        metadata: {
          trend,
          volatility,
          volatilityLevel,
          priceChangePct,
          language,
        },
      };
    } catch (error) {
      console.error('Error generating advice:', error);
      return {
        advice: 'Unable to provide pricing advice at this time. Please check back later.',
        confidence: 0,
        metadata: { error: error.message },
      };
    }
  }

  /**
   * Generate SMS-friendly advice (160 chars or less)
   */
  public generateSMSAdvice(
    trend: Trend,
    volatility: number,
    priceChangePct: number,
    language: string = 'en',
    crop?: string,
    currentPrice?: number
  ): string {
    const { advice } = this.generateAdvice(
      trend,
      volatility,
      priceChangePct,
      language,
      crop,
      currentPrice
    );
    
    // Truncate to 160 chars if needed
    return advice.length <= 160 ? advice : advice.substring(0, 157) + '...';
  }

  private getVolatilityLevel(volatility: number): 'highVolatility' | 'mediumVolatility' | 'lowVolatility' {
    if (volatility > 0.15) return 'highVolatility';
    if (volatility > 0.05) return 'mediumVolatility';
    return 'lowVolatility';
  }

  private calculateConfidence(volatility: number, absPriceChange: number): number {
    // Base confidence on inverse of volatility and magnitude of price change
    // More volatile markets and larger changes reduce confidence
    const volatilityFactor = 1 - Math.min(volatility * 2, 0.9); // Cap at 90% reduction
    const changeFactor = 1 - Math.min(Math.abs(absPriceChange) / 50, 0.5); // Cap at 50% reduction
    
    // Combine factors with some weighting
    return Math.max(0.5, (volatilityFactor * 0.7 + changeFactor * 0.3));
  }

  private initializeTemplates(): AdviceTemplates {
    return {
      en: {
        rising: {
          highVolatility: '⚠️ High volatility: {crop} prices rising rapidly ({priceChangePct}% this week). Consider selling soon as prices may fluctuate.',
          mediumVolatility: '📈 {crop} prices rising ({priceChangePct}% this week). Good time to sell if you have stock.',
          lowVolatility: '📈 {crop} prices gradually increasing. Consider selling when prices peak.',
        },
        falling: {
          highVolatility: '⚠️ High volatility: {crop} prices dropping sharply ({priceChangePct}% this week). Consider holding if possible.',
          mediumVolatility: '📉 {crop} prices decreasing ({priceChangePct}% this week). Consider waiting for better prices if storage is an option.',
          lowVolatility: '📉 {crop} prices slowly declining. May be a good time to buy if you need supply.',
        },
        stable: {
          highVolatility: '⚡ {crop} prices stable but with high volatility. Be cautious with large transactions.',
          mediumVolatility: '➡️ {crop} prices stable. No immediate action needed.',
          lowVolatility: '✅ {crop} prices stable with low volatility. Good conditions for planning.',
        },
      },
      sw: {
        rising: {
          highVolatility: '⚠️ Mabadiliko makubwa: Bei ya {crop} inapanda kwa kasi ({priceChangePct}% wiki hii). Fikiria kuuza hivi karibuni.',
          mediumVolatility: '📈 Bei ya {crop} inapanda ({priceChangePct}% wiki hii). Wakati mzuri kuuza kama una bidhaa.',
          lowVolatility: '📈 Bei ya {crop} inapanda polepole. Fikiria kuuza wakati itakapofikia kilele.',
        },
        // Add more translations as needed
      },
      // Add more languages as needed
    };
  }
}
