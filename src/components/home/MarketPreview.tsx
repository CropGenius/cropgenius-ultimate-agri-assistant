
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, CircleDollarSign, ShoppingCart, ArrowRight, BarChart3, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface MarketTrend {
  crop: string;
  price: number;
  change: number;
  trend: "up" | "down";
  forecast: "rising" | "falling" | "stable";
  reason: string;
  buyRecommendation: boolean;
  sellRecommendation: boolean;
}

export default function MarketPreview() {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<MarketTrend | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  
  useEffect(() => {
    // Simulate fetching market data
    setTimeout(() => {
      const trends = [
        { 
          crop: "Maize", 
          price: 38.50, 
          change: 2.5, 
          trend: "up" as const, 
          forecast: "rising" as const,
          reason: "Reduced harvests in neighboring regions due to unexpected rainfall patterns",
          buyRecommendation: false,
          sellRecommendation: true
        },
        { 
          crop: "Beans", 
          price: 95.75, 
          change: 1.2, 
          trend: "up" as const, 
          forecast: "stable" as const,
          reason: "Steady demand with slightly decreased supply in central markets",
          buyRecommendation: false,
          sellRecommendation: false
        },
        { 
          crop: "Tomatoes", 
          price: 65.30, 
          change: 3.7, 
          trend: "down" as const, 
          forecast: "falling" as const,
          reason: "Peak harvest season with oversupply in most regional markets",
          buyRecommendation: true,
          sellRecommendation: false
        },
      ];
      
      setMarketTrends(trends);
      setSelectedTrend(trends[0]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleTrendClick = (trend: MarketTrend) => {
    setSelectedTrend(trend);
    setShowInsight(true);
    
    // Auto-hide insight after delay
    setTimeout(() => {
      setShowInsight(false);
    }, 5000);
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all relative overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-amber-500" />
          Smart Market
        </CardTitle>
        <CardDescription>
          Real-time prices and AI predictions for your crops
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-14 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-14 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-14 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {marketTrends.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                  selectedTrend?.crop === item.crop ? 'bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => handleTrendClick(item)}
              >
                <div className={`p-2 rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}`}>
                  {item.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{item.crop}</h4>
                    <Badge className={item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}>
                      {item.trend === 'up' ? '+' : '-'}{item.change.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">${item.price.toFixed(2)}</span> per bag
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={
                        item.forecast === 'rising' ? 'text-green-500' : 
                        item.forecast === 'falling' ? 'text-red-500' : 
                        'text-amber-500'
                      }>
                        {item.forecast === 'rising' ? 'Rising' : item.forecast === 'falling' ? 'Falling' : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {showInsight && selectedTrend && (
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg animate-fade-in">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">AI Market Insight</h4>
                    <p className="text-xs mt-1 text-amber-800 dark:text-amber-200">{selectedTrend.reason}</p>
                    
                    <div className="flex mt-3 gap-2">
                      {selectedTrend.buyRecommendation && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200">
                          Good Time to Buy
                        </Badge>
                      )}
                      {selectedTrend.sellRecommendation && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200">
                          Consider Selling
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t pt-3 mt-3">
              <Link to="/market">
                <Button variant="outline" size="sm" className="w-full group">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Visit Marketplace
                    <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
