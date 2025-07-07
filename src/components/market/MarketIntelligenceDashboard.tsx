import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchMarketListings } from '@/agents/SmartMarketAgent';
import { MarketIntelligenceEngine } from '@/services/marketIntelligence';
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
      const marketEngine = new MarketIntelligenceEngine();
      const location = { lat: -1.2921, lng: 36.8219, country: 'Kenya', region: 'Nairobi' };
      
      const analysis = await marketEngine.getLocalMarketAnalysis(location, selectedCrops, 1000);
      
      const formattedData: MarketData[] = analysis.currentPrices.map(price => ({
        crop: price.crop,
        currentPrice: price.currentPrice,
        currency: price.currency,
        trend: price.trend,
        priceChange: price.priceChange,
        market: price.market
      }));

      setMarketData(formattedData);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data');
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