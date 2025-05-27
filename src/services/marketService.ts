import { CropListing, MyCrop, Buyer, BulkDeal, AIInsights } from '@/types/market';
import { PricingIntelligenceService } from './pricing-intelligence/pricing-intelligence.service';
import { MarketDataResponse } from './pricing-intelligence/models/types';

export class MarketService {
  private static instance: MarketService;
  private pricingService: PricingIntelligenceService;

  private constructor() {
    this.pricingService = PricingIntelligenceService.getInstance();
  }

  public static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  public async getCurrentMarketPrice(cropType: string, location: string): Promise<number> {
    try {
      const marketData = await this.pricingService.getMarketData(cropType, location);
      return marketData.price_today;
    } catch (error) {
      console.error('Error fetching market price:', error);
      return 0;
    }
  }

  public async fetchMarketListings(): Promise<CropListing[]> {
    try {
      // In real app, this would be an API call to your backend
      const response = await fetch('/api/market/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching market listings:', error);
      throw error;
    }
  }

  public async fetchMyCrops(): Promise<MyCrop[]> {
    try {
      const response = await fetch('/api/market/my-crops');
      if (!response.ok) throw new Error('Failed to fetch my crops');
      const crops = await response.json();
      
      // Enhance crops with market data
      const enhancedCrops = await Promise.all(crops.map(async (crop: MyCrop) => {
        try {
          const marketData = await this.pricingService.getMarketData(crop.cropType, crop.location);
          return {
            ...crop,
            currentPrice: marketData.price_today,
            suggestedPrice: this.calculateSuggestedPrice(marketData),
            marketTrend: {
              status: marketData.trend,
              forecast: marketData.advice.en,
              changePercent: marketData.change_pct
            }
          };
        } catch (error) {
          console.error(`Error enhancing crop ${crop.cropType}:`, error);
          return crop;
        }
      }));
      
      return enhancedCrops;
    } catch (error) {
      console.error('Error fetching my crops:', error);
      throw error;
    }
  }

  private calculateSuggestedPrice(marketData: MarketDataResponse): number {
    const { price_today, trend, volatility_score } = marketData;
    
    // Adjust price based on market trend and volatility
    let adjustment = 0;
    if (trend === 'rising') {
      adjustment = 1.05; // 5% above current price
    } else if (trend === 'falling') {
      adjustment = 0.95; // 5% below current price
    } else {
      adjustment = 1; // Current price
    }
    
    // Reduce adjustment if volatility is high
    if (volatility_score > 0.7) {
      adjustment = 1 + (adjustment - 1) * 0.5;
    }
    
    return Math.round(price_today * adjustment);
  }

  public async fetchTopBuyers(): Promise<Buyer[]> {
    // In real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockTopBuyers());
      }, 400);
    });
  }

  public async fetchBulkDeals(): Promise<BulkDeal[]> {
    // In real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockBulkDeals());
      }, 350);
    });
  }

  public async createListing(formData: {
    cropType: string;
    quantity: number;
    unit: string;
    quality: string;
    location: string;
    price: number;
  }): Promise<CropListing> {
    // In real app, this would be an API call
    const currentMarketPrice = await this.getCurrentMarketPrice(formData.cropType, formData.location);
    
    const newListing: CropListing = {
      id: Date.now(), // Use timestamp as ID for now
      cropType: formData.cropType,
      quantity: formData.quantity,
      unit: formData.unit,
      quality: formData.quality,
      location: formData.location,
      price: formData.price,
      marketPrice: currentMarketPrice,
      expiresIn: "7 days",
      priceStatus: formData.price > currentMarketPrice ? 'rising' : 
                  formData.price < currentMarketPrice ? 'falling' : 'stable',
      priceChange: Math.abs(Math.round((formData.price / currentMarketPrice - 1) * 100)),
      holdRecommendation: {
        recommend: formData.price > currentMarketPrice,
        days: formData.price > currentMarketPrice ? 7 : 0,
        expectedIncrease: formData.price > currentMarketPrice ? 
          Math.round((formData.price / currentMarketPrice - 1) * 100) : 0
      },
      seller: {
        name: "You", // Current user
        rating: 4.6,
        verified: true,
        transactions: 15
      },
      isMine: true
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newListing);
      }, 1000);
    });
  }

  public async contactSeller(listingId: number): Promise<boolean> {
    // In real app, this would send a message or notification
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  public async joinBulkDeal(dealId: number): Promise<boolean> {
    // In real app, this would update the deal in the database
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 600);
    });
  }

  public async contactBuyer(buyerId: number): Promise<boolean> {
    // In real app, this would send a contact request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 400);
    });
  }

  public async getAIInsights(): Promise<AIInsights> {
    try {
      // In real app, this would be an API call to your AI service
      const response = await fetch('/api/market/ai-insights');
      if (!response.ok) throw new Error('Failed to fetch AI insights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return {
        lastUpdated: new Date().toISOString(),
        marketOverview: "Unable to fetch market overview at this time.",
        topOpportunities: []
      };
    }
  }

  public async withdrawListing(listingId: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/market/listings/${listingId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to withdraw listing');
      return true;
    } catch (error) {
      console.error('Error withdrawing listing:', error);
      throw error;
    }
  }

  public async sellNow(listingId: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/market/listings/${listingId}/sell`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to complete sale');
      return true;
    } catch (error) {
      console.error('Error completing sale:', error);
      throw error;
    }
  }

  private getMockMarketListings(): CropListing[] {
    return [
      {
        id: 1,
        cropType: "Maize",
        quantity: 2500,
        unit: "kg",
        quality: "Premium",
        location: "Central Region",
        price: 175,
        marketPrice: 150,
        expiresIn: "3 days",
        priceStatus: "rising",
        priceChange: 8,
        holdRecommendation: {
          recommend: true,
          days: 7,
          expectedIncrease: 15
        },
        seller: {
          name: "Thomas N.",
          rating: 4.8,
          verified: true,
          transactions: 26
        }
      },
      {
        id: 2,
        cropType: "Tomatoes",
        quantity: 850,
        unit: "kg",
        quality: "Standard",
        location: "Western Region",
        price: 120,
        marketPrice: 125,
        expiresIn: "2 days",
        priceStatus: "falling",
        priceChange: 4,
        holdRecommendation: {
          recommend: false,
          days: 0,
          expectedIncrease: 0
        },
        seller: {
          name: "Martha K.",
          rating: 4.2,
          verified: true,
          transactions: 14
        },
        bulkDeal: {
          farmersJoined: 8,
          targetFarmers: 10,
          bonusPercentage: 12
        }
      },
      {
        id: 3,
        cropType: "Cassava",
        quantity: 3200,
        unit: "kg",
        quality: "Premium",
        location: "Eastern Region",
        price: 90,
        marketPrice: 85,
        expiresIn: "5 days",
        priceStatus: "stable",
        priceChange: 0,
        holdRecommendation: {
          recommend: false,
          days: 0,
          expectedIncrease: 0
        },
        seller: {
          name: "Joseph M.",
          rating: 4.9,
          verified: true,
          transactions: 41
        }
      },
      {
        id: 4,
        cropType: "Rice",
        quantity: 1200,
        unit: "kg",
        quality: "Premium",
        location: "Central Region",
        price: 210,
        marketPrice: 200,
        expiresIn: "7 days",
        priceStatus: "rising",
        priceChange: 5,
        holdRecommendation: {
          recommend: true,
          days: 14,
          expectedIncrease: 18
        },
        seller: {
          name: "Grace O.",
          rating: 4.7,
          verified: true,
          transactions: 22
        }
      }
    ];
  }

  private getMockMyCrops(): MyCrop[] {
    return [
      {
        id: 1,
        cropType: "Maize",
        readyToSell: true,
        harvestDate: "Last week",
        quantity: 1800,
        unit: "kg",
        quality: "Premium",
        isListed: false,
        currentPrice: 150,
        suggestedPrice: 175,
        marketTrend: {
          status: "rising",
          forecast: "Prices expected to increase by 15% in the next 7 days",
          changePercent: 15
        }
      },
      {
        id: 2,
        cropType: "Tomatoes",
        readyToSell: true,
        harvestDate: "Yesterday",
        quantity: 350,
        unit: "kg",
        quality: "Standard",
        isListed: false,
        currentPrice: 120,
        suggestedPrice: 120,
        marketTrend: {
          status: "falling",
          forecast: "Prices expected to drop by 8% in the next 3 days. Sell now.",
          changePercent: -8
        }
      },
      {
        id: 3,
        cropType: "Beans",
        readyToSell: false,
        harvestDate: "In 2 weeks",
        quantity: 450,
        unit: "kg",
        quality: "Premium",
        isListed: false,
        currentPrice: 195,
        suggestedPrice: 205,
        marketTrend: {
          status: "stable",
          forecast: "Prices expected to remain stable for the next month",
          changePercent: 1
        }
      }
    ];
  }

  private getMockTopBuyers(): Buyer[] {
    return [
      {
        id: 1,
        name: "National Food Processors",
        location: "Central Region",
        lookingFor: ["Maize", "Rice", "Soybeans"],
        verified: true,
        rating: 4.9,
        transactions: 372,
        offersAboveMarket: 8,
        paymentMethods: ["Mobile Money", "Bank Transfer"],
        dealSize: "large",
        paysFast: true
      },
      {
        id: 2,
        name: "Fresh Grocers Ltd",
        location: "Western Region",
        lookingFor: ["Tomatoes", "Onions", "Peppers"],
        verified: true,
        rating: 4.7,
        transactions: 156,
        offersAboveMarket: 12,
        paymentMethods: ["Mobile Money"],
        dealSize: "medium",
        paysFast: true
      },
      {
        id: 3,
        name: "Eastern Exporters Co.",
        location: "Eastern Region",
        lookingFor: ["Cassava", "Cocoa", "Yams"],
        verified: true,
        rating: 4.8,
        transactions: 203,
        offersAboveMarket: 15,
        paymentMethods: ["Bank Transfer", "Mobile Money"],
        dealSize: "large",
        paysFast: false
      }
    ];
  }

  private getMockBulkDeals(): BulkDeal[] {
    return [
      {
        id: 1,
        cropType: "Maize",
        organizer: "Regional Cooperative",
        farmersJoined: 28,
        targetFarmers: 50,
        priceBonus: 25,
        deadline: "4 days",
        location: "Central Region",
        minQuantity: 500,
        buyer: "National Food Processors",
        isNew: true
      },
      {
        id: 2,
        cropType: "Tomatoes",
        organizer: "Western Farmers Alliance",
        farmersJoined: 8,
        targetFarmers: 10,
        priceBonus: 12,
        deadline: "2 days",
        location: "Western Region",
        minQuantity: 200,
        buyer: "Fresh Grocers Ltd",
        isNew: false
      },
      {
        id: 3,
        cropType: "Cassava",
        organizer: "Eastern Growers Association",
        farmersJoined: 35,
        targetFarmers: 40,
        priceBonus: 18,
        deadline: "6 days",
        location: "Eastern Region",
        minQuantity: 400,
        buyer: "Eastern Exporters Co.",
        isNew: false
      }
    ];
  }
}

export const marketService = MarketService.getInstance();