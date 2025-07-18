import { supabase } from '@/integrations/supabase/client';
import * as Sentry from "@sentry/react";

export interface MarketListing {
  id: string;
  crop_type: string;
  variety?: string;
  price_per_unit: number;
  unit: string;
  quantity_available?: number;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  source: string;
  quality_rating?: number;
  harvest_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

export interface MarketAnalysis {
  crop_type: string;
  average_price: number;
  min_price: number;
  max_price: number;
  total_listings: number;
  total_quantity: number;
  price_trend: 'rising' | 'falling' | 'stable';
  recommendations: string[];
  regional_breakdown: Array<{
    location: string;
    average_price: number;
    listings_count: number;
  }>;
}

export interface MarketIntelligenceOptions {
  crop_type?: string;
  location?: { lat: number; lng: number; radius_km?: number };
  max_price?: number;
  min_quality_rating?: number;
  limit?: number;
}

/**
 * Market Intelligence Oracle - Smart Market Agent
 * Provides comprehensive market analysis for African agricultural markets
 */
export class SmartMarketAgent {
  
  /**
   * Get market listings based on filters
   */
  async getMarketListings(options: MarketIntelligenceOptions = {}): Promise<MarketListing[]> {
    try {
      let query = supabase
        .from('market_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.crop_type) {
        query = query.ilike('crop_type', `%${options.crop_type}%`);
      }

      if (options.max_price) {
        query = query.lte('price_per_unit', options.max_price);
      }

      if (options.min_quality_rating) {
        query = query.gte('quality_rating', options.min_quality_rating);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching market listings:', error);
        return [];
      }

      // Filter by location if provided
      if (options.location && data) {
        const { lat, lng, radius_km = 50 } = options.location;
        return data.filter((listing: MarketListing) => {
          if (!listing.location_lat || !listing.location_lng) return true;
          
          const distance = this.calculateDistance(
            lat, lng, 
            listing.location_lat, listing.location_lng
          );
          
          return distance <= radius_km;
        });
      }

      return data || [];

    } catch (error) {
      console.error('Market listings fetch error:', error);
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Get comprehensive market analysis for a specific crop
   */
  async getMarketAnalysis(crop_type: string, location?: { lat: number; lng: number }): Promise<MarketAnalysis> {
    try {
      const listings = await this.getMarketListings({ 
        crop_type, 
        location: location ? { ...location, radius_km: 100 } : undefined 
      });

      if (listings.length === 0) {
        return this.generateFallbackAnalysis(crop_type);
      }

      const prices = listings.map(l => l.price_per_unit);
      const average_price = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const min_price = Math.min(...prices);
      const max_price = Math.max(...prices);
      const total_quantity = listings.reduce((sum, l) => sum + (l.quantity_available || 0), 0);

      // Calculate price trend (simplified)
      const recent_listings = listings.slice(0, Math.floor(listings.length / 2));
      const older_listings = listings.slice(Math.floor(listings.length / 2));
      
      const recent_avg = recent_listings.length > 0 
        ? recent_listings.reduce((sum, l) => sum + l.price_per_unit, 0) / recent_listings.length
        : average_price;
        
      const older_avg = older_listings.length > 0
        ? older_listings.reduce((sum, l) => sum + l.price_per_unit, 0) / older_listings.length
        : average_price;

      const price_trend: 'rising' | 'falling' | 'stable' = 
        recent_avg > older_avg * 1.05 ? 'rising' :
        recent_avg < older_avg * 0.95 ? 'falling' : 'stable';

      // Regional breakdown
      const regional_breakdown = this.calculateRegionalBreakdown(listings);

      // Generate recommendations
      const recommendations = this.generateMarketRecommendations(
        crop_type, price_trend, average_price, listings.length, regional_breakdown
      );

      return {
        crop_type,
        average_price: Number(average_price.toFixed(2)),
        min_price: Number(min_price.toFixed(2)),
        max_price: Number(max_price.toFixed(2)),
        total_listings: listings.length,
        total_quantity,
        price_trend,
        recommendations,
        regional_breakdown
      };

    } catch (error) {
      console.error('Market analysis error:', error);
      Sentry.captureException(error);
      return this.generateFallbackAnalysis(crop_type);
    }
  }

  /**
   * Get price trends for multiple crops
   */
  async getPriceTrends(crop_types: string[]): Promise<Record<string, MarketAnalysis>> {
    const trends: Record<string, MarketAnalysis> = {};
    
    for (const crop_type of crop_types) {
      trends[crop_type] = await this.getMarketAnalysis(crop_type);
    }
    
    return trends;
  }

  /**
   * Find best selling opportunities near a location
   */
  async findSellingOpportunities(
    farmer_location: { lat: number; lng: number },
    farmer_crops: string[]
  ): Promise<Array<{
    crop: string;
    best_market: string;
    price: number;
    distance_km: number;
    profit_potential: string;
  }>> {
    const opportunities = [];

    for (const crop of farmer_crops) {
      const listings = await this.getMarketListings({ 
        crop_type: crop,
        location: { ...farmer_location, radius_km: 200 }
      });

      if (listings.length > 0) {
        // Find highest price market
        const best_listing = listings.reduce((best, current) => 
          current.price_per_unit > best.price_per_unit ? current : best
        );

        const distance = best_listing.location_lat && best_listing.location_lng
          ? this.calculateDistance(
              farmer_location.lat, farmer_location.lng,
              best_listing.location_lat, best_listing.location_lng
            )
          : 0;

        const profit_potential = best_listing.price_per_unit > 1.0 ? 'High' :
                               best_listing.price_per_unit > 0.5 ? 'Medium' : 'Low';

        opportunities.push({
          crop,
          best_market: best_listing.location_name || 'Market Location',
          price: best_listing.price_per_unit,
          distance_km: Number(distance.toFixed(1)),
          profit_potential
        });
      }
    }

    return opportunities.sort((a, b) => b.price - a.price);
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate regional price breakdown
   */
  private calculateRegionalBreakdown(listings: MarketListing[]) {
    const regions: Record<string, { total_price: number; count: number }> = {};
    
    listings.forEach(listing => {
      const location = listing.location_name || 'Unknown Location';
      if (!regions[location]) {
        regions[location] = { total_price: 0, count: 0 };
      }
      regions[location].total_price += listing.price_per_unit;
      regions[location].count++;
    });

    return Object.entries(regions).map(([location, data]) => ({
      location,
      average_price: Number((data.total_price / data.count).toFixed(2)),
      listings_count: data.count
    })).sort((a, b) => b.average_price - a.average_price);
  }

  /**
   * Generate market recommendations based on analysis
   */
  private generateMarketRecommendations(
    crop_type: string,
    price_trend: 'rising' | 'falling' | 'stable',
    average_price: number,
    total_listings: number,
    regional_breakdown: Array<{ location: string; average_price: number; listings_count: number }>
  ): string[] {
    const recommendations = [];

    // Price trend recommendations
    if (price_trend === 'rising') {
      recommendations.push(`📈 ${crop_type} prices are trending upward - consider selling soon to maximize profits.`);
    } else if (price_trend === 'falling') {
      recommendations.push(`📉 ${crop_type} prices are declining - consider holding inventory if possible.`);
    } else {
      recommendations.push(`📊 ${crop_type} prices are stable - good time for consistent sales planning.`);
    }

    // Market activity recommendations
    if (total_listings < 5) {
      recommendations.push(`🔍 Limited ${crop_type} listings found - potential supply shortage may drive higher prices.`);
    } else if (total_listings > 20) {
      recommendations.push(`📦 High ${crop_type} market activity - competitive pricing recommended.`);
    }

    // Regional recommendations
    if (regional_breakdown.length > 1) {
      const best_market = regional_breakdown[0];
      recommendations.push(`🎯 Best ${crop_type} prices found in ${best_market.location} (${best_market.average_price}/kg).`);
    }

    // Price-specific recommendations
    if (average_price > 1.0) {
      recommendations.push(`💰 ${crop_type} showing premium pricing - focus on quality to capture higher margins.`);
    } else if (average_price < 0.5) {
      recommendations.push(`⚠️ ${crop_type} prices below average - consider value-addition strategies.`);
    }

    // General advice
    recommendations.push(`📅 Monitor market prices weekly to optimize selling timing.`);
    recommendations.push(`🤝 Build relationships with multiple buyers to ensure consistent sales.`);

    return recommendations;
  }

  /**
   * Generate fallback analysis when no data is available
   */
  private generateFallbackAnalysis(crop_type: string): MarketAnalysis {
    // Default African crop prices (rough estimates)
    const default_prices: Record<string, number> = {
      'maize': 0.35,
      'cassava': 0.25,
      'beans': 1.10,
      'rice': 0.95,
      'tomato': 0.80,
      'yam': 0.45,
      'plantain': 0.60,
      'cocoa': 2.20,
      'coffee': 3.50
    };

    const base_price = default_prices[crop_type.toLowerCase()] || 0.50;

    return {
      crop_type,
      average_price: base_price,
      min_price: base_price * 0.8,
      max_price: base_price * 1.3,
      total_listings: 0,
      total_quantity: 0,
      price_trend: 'stable',
      recommendations: [
        `📊 No recent ${crop_type} market data available.`,
        `💡 Based on regional averages, ${crop_type} typically sells for ${base_price}/kg.`,
        `🔍 Check with local markets for current pricing.`,
        `📱 Consider posting your ${crop_type} listing to help build market data.`
      ],
      regional_breakdown: []
    };
  }
}

// Export singleton instance
export const smartMarketAgent = new SmartMarketAgent(); 