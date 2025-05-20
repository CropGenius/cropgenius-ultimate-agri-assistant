import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Wheat, 
  BarChart3, 
  Timer, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CropPricing {
  name: string;
  currentPrice: number;
  change: number;
  trend: "up" | "down" | "stable";
  aiRecommendation: string;
  action: "buy" | "sell" | "hold";
  urgency: "high" | "medium" | "low";
  opportunity?: string;
  prediction?: {
    days: number;
    price: number;
    reason: string;
  };
}

export default function MarketPreview() {
  const [marketData, setMarketData] = useState<CropPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchMarketData();
    
    // Set up interval to periodically update prices
    const interval = setInterval(() => {
      updateRandomPrice();
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchMarketData = () => {
    // In a real app, this would fetch from an API
    // For now, we'll generate realistic pricing data
    setTimeout(() => {
      const crops: CropPricing[] = [
        {
          name: "Maize",
          currentPrice: 42.75,
          change: 3.8,
          trend: "up",
          aiRecommendation: "Strong demand due to regional shortages. AI predicts continued price increases over next 10 days.",
          action: "hold",
          urgency: "medium",
          prediction: {
            days: 10,
            price: 47.25,
            reason: "Regional shortages and increased demand from processors"
          }
        },
        {
          name: "Coffee",
          currentPrice: 238.15,
          change: -2.1,
          trend: "down",
          aiRecommendation: "Temporary price drop due to market oversupply. Hold until next month for better prices.",
          action: "hold",
          urgency: "low",
          prediction: {
            days: 30,
            price: 255.30,
            reason: "Seasonal demand increase and projected export growth"
          }
        },
        {
          name: "Tomatoes",
          currentPrice: 85.30,
          change: 12.5,
          trend: "up",
          aiRecommendation: "URGENT: Current prices exceptionally high due to regional shortages. Sell immediately to maximize profit.",
          action: "sell",
          urgency: "high",
          opportunity: "3 buyers within 50km offering premium rates",
          prediction: {
            days: 7,
            price: 76.45,
            reason: "Incoming harvest from northern region will increase supply"
          }
        }
      ];
      
      setMarketData(crops);
      setLoading(false);
      
      // Show toast for high urgency actions
      const urgentCrops = crops.filter(c => c.urgency === 'high');
      if (urgentCrops.length > 0) {
        setTimeout(() => {
          toast.warning(`Market Alert: ${urgentCrops[0].name}`, {
            description: urgentCrops[0].aiRecommendation
          });
        }, 2000);
      }
    }, 1000);
  };
  
  const updateRandomPrice = () => {
    if (marketData.length === 0) return;
    
    // Update a random crop with a small price change
    const index = Math.floor(Math.random() * marketData.length);
    const changeAmount = (Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
    
    setMarketData(prevData => {
      const newData = [...prevData];
      const crop = {...newData[index]};
      const oldPrice = crop.currentPrice;
      const newPrice = parseFloat((oldPrice + (oldPrice * changeAmount / 100)).toFixed(2));
      
      crop.currentPrice = newPrice;
      crop.change = parseFloat(((newPrice - oldPrice) / oldPrice * 100).toFixed(1));
      crop.trend = newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : "stable";
      
      // Update recommendation based on significant changes
      if (Math.abs(crop.change) > 3) {
        if (crop.trend === "up") {
          crop.aiRecommendation = "Prices rising quickly. Consider selling if ready for market.";
          crop.action = "sell";
          crop.urgency = "medium";
        } else {
          crop.aiRecommendation = "Prices dropping. Hold until market stabilizes.";
          crop.action = "hold";
          crop.urgency = "low";
        }
        
        // Show toast for significant changes
        toast.info(`${crop.name} price update`, {
          description: `Price ${crop.trend === "up" ? "increased" : "decreased"} by ${Math.abs(crop.change).toFixed(1)}%`
        });
      }
      
      newData[index] = crop;
      return newData;
    });
  };

  const refreshMarketData = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      // Update all prices with small variations
      setMarketData(prevData => 
        prevData.map(crop => {
          const changeAmount = (Math.random() * 2 - 1) * (Math.random() > 0.7 ? 3 : 1);
          const oldPrice = crop.currentPrice;
          const newPrice = parseFloat((oldPrice + (oldPrice * changeAmount / 100)).toFixed(2));
          
          return {
            ...crop,
            currentPrice: newPrice,
            change: parseFloat(((newPrice - oldPrice) / oldPrice * 100).toFixed(1)),
            trend: newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : "stable"
          };
        })
      );
      
      setRefreshing(false);
      toast.success("Market data updated", {
        description: "Latest prices and AI predictions refreshed"
      });
    }, 1500);
  };
  
  const toggleExpand = (cropName: string) => {
    if (expanded === cropName) {
      setExpanded(null);
    } else {
      setExpanded(cropName);
    }
  };
  
  const getActionButton = (crop: CropPricing) => {
    switch(crop.action) {
      case "sell":
        return (
          <Button 
            size="sm" 
            className={crop.urgency === "high" ? "bg-green-600 hover:bg-green-700 animate-pulse" : ""}
            onClick={() => {
              toast.success(`AI Market Action: ${crop.name}`, {
                description: `Finding best buyers for your ${crop.name} harvest...`
              });
            }}
          >
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Sell Now
            </span>
          </Button>
        );
      case "buy":
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              toast.success(`AI Market Action: ${crop.name}`, {
                description: `Finding best suppliers for ${crop.name}...`
              });
            }}
          >
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5" />
              Buy
            </span>
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => {
              toast.info(`AI Market Action: ${crop.name}`, {
                description: `Setting price alert for ${crop.name}...`
              });
            }}
          >
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              Set Alert
            </span>
          </Button>
        );
    }
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
        <CardTitle className="flex justify-between items-center">
          <span>Smart Market</span>
          <Badge variant="outline" className="text-xs">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span className={refreshing ? "animate-pulse" : ""}>Live Prices</span>
            </span>
          </Badge>
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>AI-powered price analytics & alerts</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={refreshMarketData}
            disabled={refreshing}
          >
            <BarChart3 className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {marketData.map((crop) => (
              <div key={crop.name} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => toggleExpand(crop.name)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">{crop.name}</h3>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${
                      crop.trend === 'up' 
                        ? 'text-green-600' 
                        : crop.trend === 'down' 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {crop.trend === 'up' 
                        ? <ArrowUpRight className="h-4 w-4" /> 
                        : crop.trend === 'down' 
                          ? <ArrowDownRight className="h-4 w-4" /> 
                          : <TrendingUp className="h-4 w-4" />
                      }
                      <span className="font-medium">${crop.currentPrice.toFixed(2)}</span>
                      <span className="text-xs">
                        {crop.change > 0 ? '+' : ''}{crop.change}%
                      </span>
                    </div>
                  </div>
                  
                  {crop.urgency === "high" && (
                    <div className="flex items-center gap-1 mt-1 text-xs bg-amber-50 dark:bg-amber-900/20 p-1 px-2 rounded-md">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200 font-medium">{crop.aiRecommendation}</span>
                    </div>
                  )}
                </div>
                
                {expanded === crop.name && (
                  <div className="p-3 pt-0 border-t animate-fade-in">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        <span className="font-semibold">AI Market Analysis:</span> {crop.aiRecommendation}
                      </p>
                      
                      {crop.prediction && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Timer className="h-3.5 w-3.5 text-amber-600" />
                          <div className="text-amber-800 dark:text-amber-200">
                            <span className="font-medium">AI Prediction:</span> ${crop.prediction.price.toFixed(2)} in {crop.prediction.days} days
                          </div>
                        </div>
                      )}
                      
                      {crop.opportunity && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <ShoppingCart className="h-3.5 w-3.5 text-amber-600" />
                          <div className="text-amber-800 dark:text-amber-200">
                            <span className="font-medium">Opportunity:</span> {crop.opportunity}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      {getActionButton(crop)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Link to="/market">
              <Button variant="ghost" size="sm" className="w-full group">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  View Full Market Intelligence
                  <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
