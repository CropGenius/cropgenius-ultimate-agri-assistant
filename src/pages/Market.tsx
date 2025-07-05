import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, MapPin, Phone } from 'lucide-react';
import { MarketIntelligenceEngine } from '@/services/marketIntelligence';
import { toast } from 'sonner';

const Market = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location] = useState({ lat: -1.2921, lng: 36.8219, country: 'Kenya', region: 'Nairobi' });
  const [crops] = useState(['maize', 'beans', 'tomato', 'rice']);
  const [bestMarkets, setBestMarkets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const marketEngine = new MarketIntelligenceEngine();

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const analysis = await marketEngine.getLocalMarketAnalysis(location, crops, 1000);
      
      setMarketData(analysis.currentPrices.map(price => ({
        crop: price.crop,
        price: price.currentPrice,
        change: price.priceChange,
        trend: price.trend,
        market: price.market,
        currency: price.currency
      })));
      
      setBestMarkets(analysis.bestMarkets.slice(0, 3));
      setAlerts(analysis.marketAlerts.filter(alert => alert.urgency === 'high'));
      
      if (analysis.marketAlerts.length > 0) {
        toast.info('Market Alert', {
          description: analysis.marketAlerts[0].message
        });
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
      toast.error('Failed to load market data');
      setMarketData([
        { crop: 'Maize', price: 45, change: +5.2, trend: 'up', market: 'Local', currency: 'KES' },
        { crop: 'Beans', price: 120, change: +2.1, trend: 'up', market: 'Local', currency: 'KES' },
        { crop: 'Tomato', price: 80, change: -1.5, trend: 'down', market: 'Local', currency: 'KES' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Market Intelligence</h1>
              <p className="text-sm text-white/70">{location.region}, {location.country}</p>
            </div>
          </div>
          <Button 
            onClick={loadMarketData} 
            disabled={loading}
            size="sm"
            className="glass-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {alerts.length > 0 && (
          <Card className="glass-card border-orange-500">
            <CardContent className="p-3">
              <h3 className="font-semibold text-orange-400 mb-2">🚨 Market Alerts</h3>
              {alerts.map((alert, index) => (
                <p key={index} className="text-sm text-white/90">{alert.message}</p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Current Prices</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <Card key={i} className="glass-card animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            marketData.map((item) => (
              <Card key={item.crop} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.crop}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-white">{item.currency} {item.price}</span>
                        <span className="text-xs text-white/70">per kg</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{item.market} Market</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        item.trend === 'up' ? 'text-green-400' : 
                        item.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                        <span className="font-semibold text-sm">
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </span>
                      </div>
                      <span className="text-xs text-white/50">24h change</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {bestMarkets.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Best Markets to Sell</h2>
            {bestMarkets.map((market, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{market.marketName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-white/60" />
                        <span className="text-sm text-white/70">{market.location} ({market.distance}km)</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">Demand: {market.demandLevel}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-400">${market.averagePrice}</span>
                      <p className="text-xs text-white/60">avg price</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="glass-btn flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" className="glass-btn flex-1">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button className="glass-btn h-12">
            📊 Price History
          </Button>
          <Button className="glass-btn h-12">
            🔔 Price Alerts
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Market;