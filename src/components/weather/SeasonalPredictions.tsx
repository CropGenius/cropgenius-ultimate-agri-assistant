import React from 'react';
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Cloud,
  CloudRain,
  Droplet,
  Sun,
  Sprout,
  Thermometer,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SeasonalPredictionsProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  crops: string[];
}

export default function SeasonalPredictions({ location, crops }: SeasonalPredictionsProps) {
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    // In a real app, we would fetch real seasonal predictions based on location
    // This is a simulation with realistic data
    generatePredictions();
  }, [location, crops]);

  const generatePredictions = () => {
    // Simulate a seasonal forecast with realistic data
    const now = new Date();
    const seasonStart = new Date(now);
    const seasonEnd = new Date(now);
    seasonEnd.setMonth(seasonEnd.getMonth() + 4);
    
    const seasonType = Math.random() > 0.5 ? "drier" : "wetter";
    const seasonDeviation = 15 + Math.floor(Math.random() * 25); // 15-40% deviation
    
    const rainfallExpected = seasonType === "drier" 
      ? 400 - (400 * seasonDeviation / 100) 
      : 400 + (400 * seasonDeviation / 100);
    
    const tempDeviation = Math.random() > 0.5 
      ? 1 + Math.random() * 2 
      : -(1 + Math.random() * 2);
    
    const cropRecommendations = [];
    
    if (crops.includes("Maize")) {
      cropRecommendations.push(
        seasonType === "drier" 
          ? {
              crop: "Drought-resistant Maize",
              recommended: true,
              reason: "Lower water requirements suitable for predicted drier conditions",
              expectedYield: 80 + Math.floor(Math.random() * 10),
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 15),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 5),
              },
            }
          : {
              crop: "High-yield Maize",
              recommended: true,
              reason: "Can maximize growth with expected higher rainfall",
              expectedYield: 90 + Math.floor(Math.random() * 10),
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 10),
                end: new Date(now.getFullYear(), now.getMonth(), 25),
              },
            }
      );
    }
    
    if (crops.includes("Beans")) {
      cropRecommendations.push(
        seasonType === "drier" 
          ? {
              crop: "Drought-tolerant Beans",
              recommended: true,
              reason: "Can withstand water stress during drier periods",
              expectedYield: 75 + Math.floor(Math.random() * 10),
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 5),
                end: new Date(now.getFullYear(), now.getMonth(), 20),
              },
            }
          : {
              crop: "Standard Beans",
              recommended: true,
              reason: "Expected rainfall matches ideal growing conditions",
              expectedYield: 85 + Math.floor(Math.random() * 10),
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: new Date(now.getFullYear(), now.getMonth(), 15),
              },
            }
      );
    }
    
    if (crops.includes("Coffee")) {
      cropRecommendations.push({
        crop: "Coffee",
        recommended: seasonType !== "drier",
        reason: seasonType === "drier" 
          ? "May require supplemental irrigation due to drier conditions" 
          : "Expected rainfall suitable for coffee growth",
        expectedYield: seasonType === "drier" 
          ? 65 + Math.floor(Math.random() * 10)
          : 80 + Math.floor(Math.random() * 10),
        plantingWindow: null, // Coffee is a perennial crop
      });
    }
    
    // If no crops provided, give general recommendations
    if (cropRecommendations.length === 0) {
      cropRecommendations.push(
        seasonType === "drier" 
          ? {
              crop: "Drought-resistant Crops",
              recommended: true,
              reason: "Lower water requirements suitable for predicted drier conditions",
              expectedYield: null,
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 15),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 5),
              },
            }
          : {
              crop: "High-yield Varieties",
              recommended: true,
              reason: "Can maximize growth with expected higher rainfall",
              expectedYield: null,
              plantingWindow: {
                start: new Date(now.getFullYear(), now.getMonth(), 10),
                end: new Date(now.getFullYear(), now.getMonth(), 25),
              },
            }
      );
    }
    
    setPredictions({
      seasonPeriod: {
        start: seasonStart,
        end: seasonEnd,
      },
      seasonType,
      seasonDeviation,
      rainfallExpected,
      temperatureDeviation: tempDeviation,
      cropRecommendations,
      marketImpact: seasonType === "drier" 
        ? {
            trend: "upward",
            reason: "Potential crop shortages due to drier conditions",
            expectedChange: 5 + Math.floor(Math.random() * 15),
          }
        : {
            trend: "downward",
            reason: "Possible oversupply due to favorable growing conditions",
            expectedChange: 5 + Math.floor(Math.random() * 10),
          },
    });
  };

  if (!predictions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Predictions</CardTitle>
          <CardDescription>Loading prediction data...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          AI Seasonal Forecast
        </CardTitle>
        <CardDescription>
          Long-term climate predictions with crop-specific recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Season Overview</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Season Period</span>
                    <span className="text-sm font-medium">
                      {predictions.seasonPeriod.start.toLocaleDateString('en-US', { month: 'short' })} - {predictions.seasonPeriod.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <Badge className={predictions.seasonType === "drier" ? "bg-amber-500" : "bg-blue-500"}>
                        {predictions.seasonType === "drier" ? "Drier" : "Wetter"}
                      </Badge>
                      <span className="text-sm">than average</span>
                    </div>
                    <span className="text-sm font-medium">{predictions.seasonDeviation}% {predictions.seasonType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {predictions.seasonType === "drier" ? (
                      <>
                        <Sun className="h-5 w-5 text-amber-500" />
                        <Progress 
                          value={predictions.seasonDeviation} 
                          max={100} 
                          className="h-2 flex-1 bg-blue-100"
                        />
                        <CloudRain className="h-5 w-5 text-blue-400" />
                      </>
                    ) : (
                      <>
                        <Sun className="h-5 w-5 text-amber-500" />
                        <Progress 
                          value={100 - predictions.seasonDeviation} 
                          max={100} 
                          className="h-2 flex-1 bg-blue-100"
                        />
                        <CloudRain className="h-5 w-5 text-blue-400" />
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Expected Rainfall</span>
                    <span className="text-sm font-medium">{Math.round(predictions.rainfallExpected)} mm</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {predictions.temperatureDeviation.toFixed(1)}°C 
                      {predictions.temperatureDeviation > 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-blue-500" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Market Impact</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-full ${
                  predictions.marketImpact.trend === "upward"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {predictions.marketImpact.trend === "upward" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {predictions.marketImpact.trend === "upward" 
                      ? "Price Increase Expected" 
                      : "Price Decrease Likely"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ~{predictions.marketImpact.expectedChange}% change
                  </div>
                </div>
              </div>
              <p className="text-sm">{predictions.marketImpact.reason}</p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">AI Crop Recommendations</h3>
            <div className="space-y-4">
              {predictions.cropRecommendations.map((rec: any, index: number) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${rec.recommended ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{rec.crop}</h4>
                        {rec.recommended ? (
                          <Badge className="bg-green-500">Recommended</Badge>
                        ) : (
                          <Badge variant="outline">Consider Alternatives</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{rec.reason}</p>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {rec.expectedYield && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expected Yield:</span>
                            <span className="font-medium">{rec.expectedYield}%</span>
                          </div>
                        )}
                        
                        {rec.plantingWindow && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Best Planting:</span>
                            <span className="font-medium">
                              {rec.plantingWindow.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {rec.plantingWindow.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" />
                Water Management Strategy
              </h3>
              <p className="text-sm mb-3">
                {predictions.seasonType === "drier" 
                  ? "Based on AI predictions of a drier season, consider implementing water conservation strategies:"
                  : "With higher expected rainfall, prepare for effective water management:"}
              </p>
              <ul className="text-sm space-y-2">
                {predictions.seasonType === "drier" ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Implement drip irrigation to maximize water efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Consider mulching to reduce soil evaporation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Schedule irrigation during early morning or evening to reduce evaporation</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Ensure proper drainage systems are in place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Consider water harvesting to capture excess rainfall</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>Monitor for potential waterlogging and disease pressure</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
