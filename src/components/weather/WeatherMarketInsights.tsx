
import { TrendingUp, TrendingDown, ShoppingCart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WeatherMarketInsights() {
  // Mock market data with weather insights
  const marketInsights = [
    {
      crop: "Maize",
      priceDirection: "up",
      percentChange: 8.5,
      reason: "Heavy rainfall in major growing regions has delayed harvests, reducing supply.",
      recommendation: "Consider holding your harvest for 2-3 weeks for potential 12-15% price increase.",
      urgency: "medium"
    },
    {
      crop: "Tomatoes",
      priceDirection: "up",
      percentChange: 15.2,
      reason: "Recent heatwave has damaged crops in southern regions, creating supply shortages.",
      recommendation: "Prices will likely peak in 7-10 days. Optimal selling window approaching.",
      urgency: "high"
    },
    {
      crop: "Potatoes",
      priceDirection: "down",
      percentChange: 6.3,
      reason: "Ideal growing conditions have led to bumper harvests across the region.",
      recommendation: "Consider storage options or processing to avoid selling at current low prices.",
      urgency: "low"
    }
  ];
  
  const getDirectionIcon = (direction: string) => {
    if (direction === "up") {
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    } else {
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    }
  };
  
  const getPercentageStyle = (direction: string) => {
    if (direction === "up") {
      return "text-green-600";
    } else {
      return "text-red-600";
    }
  };
  
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Act Now</span>;
      case "medium":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Plan Soon</span>;
      case "low":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Monitor</span>;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Weather-Based Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {marketInsights.map((insight, index) => (
          <div key={index} className="border rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium text-lg">{insight.crop}</h3>
                  <div className="flex items-center ml-3">
                    {getDirectionIcon(insight.priceDirection)}
                    <span className={`ml-1 font-bold ${getPercentageStyle(insight.priceDirection)}`}>
                      {insight.percentChange}%
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm">{insight.reason}</p>
                <div className="mt-2 bg-gray-50 p-2 rounded-md border-l-4 border-crop-green-500">
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-crop-green-500 mt-0.5 mr-2" />
                    <p className="text-sm font-medium">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {getUrgencyBadge(insight.urgency)}
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" className="mr-2">
                View Market
              </Button>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Sell Now
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
