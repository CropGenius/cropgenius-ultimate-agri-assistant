
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, CircleDollarSign, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface MarketTrend {
  crop: string;
  price: number;
  change: number;
  trend: "up" | "down";
}

export default function MarketPreview() {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching market data
    setTimeout(() => {
      setMarketTrends([
        { crop: "Maize", price: 38.50, change: 2.5, trend: "up" },
        { crop: "Beans", price: 95.75, change: 1.2, trend: "up" },
        { crop: "Tomatoes", price: 65.30, change: 3.7, trend: "down" },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-blue-500" />
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
              <div key={index} className="flex items-center space-x-3">
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
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">${item.price.toFixed(2)}</span> per bag
                  </p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3 mt-3">
              <Link to="/market">
                <Button variant="outline" size="sm" className="w-full">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Visit Marketplace
                    <ArrowRight className="h-3 w-3 ml-auto" />
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
