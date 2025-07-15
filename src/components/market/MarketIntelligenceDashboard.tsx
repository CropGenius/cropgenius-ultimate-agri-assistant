import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchMarketListings, MarketListing } from '@/agents/SmartMarketAgent';
import { toast } from 'sonner';

interface MarketData {
  crop: string;
  currentPrice: number;
  currency: string;
  trend: 'up' | 'down' | 'stable';
  priceChange: number;
  market: string;
}

export const MarketIntelligenceDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrops] = useState(['maize', 'beans', 'tomato', 'rice']);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Use real database data from SmartMarketAgent instead of fake MarketIntelligenceEngine
      const allMarketData: MarketData[] = [];
      
      for (const crop of selectedCrops) {
        try {
          const marketResult = await fetchMarketListings({
            cropType: crop,
            latitude: -1.2921,
            longitude: 36.8219,
            radiusKm: 100
          });

          // Convert real database listings to display format
          const cropData: MarketData[] = marketResult.listings.map(listing => ({
            crop: listing.crop_type,
            currentPrice: listing.price_per_unit,
            currency: 'KES', // Default to KES for Kenya, could be enhanced to detect from listing
            trend: 'stable' as const, // Could be enhanced with price history analysis
            priceChange: 0, // Could be enhanced with price history comparison
            market: listing.location_name || 'Local Market'
          }));

          allMarketData.push(...cropData);
        } catch (cropError) {
          console.warn(`Failed to load data for ${crop}:`, cropError);
          // Continue with other crops even if one fails
        }
      }

      setMarketData(allMarketData);
      
      if (allMarketData.length === 0) {
        toast.info('No market listings found. Add some market data to see prices.');
      } else {
        toast.success(`Loaded ${allMarketData.length} market listings from database`);
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data from database');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            💰 Market Intelligence
          </CardTitle>
          <Button onClick={loadMarketData} disabled={loading} size="sm">
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketData.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{item.crop}</h3>
                <Badge variant="outline">{item.market}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {item.currentPrice} {item.currency}
                  </span>
                  <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                    <span>{getTrendIcon(item.trend)}</span>
                    <span className="text-sm font-medium">
                      {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Price per kg • Last updated today
                </div>
              </div>
            </Card>
          ))}
        </div>

        {marketData.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No market data available</p>
            <Button onClick={loadMarketData} className="mt-2">
              Load Market Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};