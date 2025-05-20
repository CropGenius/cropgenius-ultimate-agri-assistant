import React from 'react';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  Wind,
  Droplet,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForecastPanelProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function ForecastPanel({ location }: ForecastPanelProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would fetch real forecast data based on location
    // This is a simulation with realistic data
    generateForecast();
  }, [location]);

  const generateForecast = () => {
    const days = 7;
    const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"];
    const weatherIcons = ["sun", "cloud", "cloud", "cloud-rain", "cloud-rain", "cloud-lightning"];
    
    const newForecast = [];
    
    let baseTemp = 25 + Math.random() * 5;
    let rainTrend = Math.random() > 0.5;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add some variation but keep the trend
      baseTemp += (Math.random() - 0.5) * 2;
      let rainProb = rainTrend 
        ? Math.min(90, 20 + i * 10 + (Math.random() - 0.5) * 15) 
        : Math.max(10, 70 - i * 10 + (Math.random() - 0.5) * 15);
        
      const conditionIndex = rainProb > 70 
        ? 4 + Math.floor(Math.random() * 2) // Heavy rain or thunderstorm
        : rainProb > 40 
          ? 3 // Light rain
          : rainProb > 20 
            ? 1 + Math.floor(Math.random() * 2) // Partly cloudy or cloudy
            : 0; // Sunny
      
      const hourlyForecast = [];
      
      for (let h = 0; h < 24; h += 3) {
        const tempVariation = h < 12 
          ? h * 0.5 // Temperature rising in the morning
          : (24 - h) * 0.5; // Temperature falling in the evening
          
        const hourTemp = baseTemp + tempVariation + (Math.random() - 0.5) * 2;
        const hourRainProb = Math.max(0, Math.min(100, rainProb + (Math.random() - 0.5) * 20));
        
        hourlyForecast.push({
          hour: h,
          temp: hourTemp,
          rainProb: hourRainProb,
          condition: weatherConditions[conditionIndex],
          icon: weatherIcons[conditionIndex],
        });
      }
      
      newForecast.push({
        date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        temp: {
          max: baseTemp + 2 + Math.random() * 2,
          min: baseTemp - 3 - Math.random() * 2,
        },
        rainProb,
        condition: weatherConditions[conditionIndex],
        icon: weatherIcons[conditionIndex],
        windSpeed: 5 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        hourly: hourlyForecast,
        farmAction: getFarmAction(conditionIndex, rainProb),
      });
    }
    
    setForecast(newForecast);
  };
  
  const getFarmAction = (conditionIndex: number, rainProb: number) => {
    if (conditionIndex >= 4) {
      return {
        action: "Protect Crops",
        description: "Heavy rain/storm expected. Secure structures and improve drainage.",
        urgency: "high",
      };
    } else if (conditionIndex === 3) {
      return {
        action: "Delay Fertilizing",
        description: "Light rain expected. Wait until after rainfall to apply fertilizer.",
        urgency: "medium",
      };
    } else if (conditionIndex <= 1 && rainProb < 20) {
      return {
        action: "Irrigation Needed",
        description: "Dry conditions expected. Schedule irrigation for optimal moisture.",
        urgency: "medium",
      };
    } else {
      return {
        action: "Normal Operations",
        description: "Weather conditions suitable for standard farming activities.",
        urgency: "low",
      };
    }
  };

  const getWeatherIcon = (icon: string, size = 5) => {
    switch(icon) {
      case "sun": return <Sun className={`h-${size} w-${size} text-amber-500`} />;
      case "cloud": return <Cloud className={`h-${size} w-${size} text-slate-400`} />;
      case "cloud-rain": return <CloudRain className={`h-${size} w-${size} text-blue-500`} />;
      case "cloud-drizzle": return <CloudDrizzle className={`h-${size} w-${size} text-blue-400`} />;
      case "cloud-lightning": return <CloudLightning className={`h-${size} w-${size} text-purple-500`} />;
      case "cloud-snow": return <CloudSnow className={`h-${size} w-${size} text-blue-300`} />;
      default: return <Sun className={`h-${size} w-${size} text-amber-500`} />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "medium": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    }
  };

  const handlePrevDay = () => {
    setActiveDay(prev => Math.max(0, prev - 1));
  };

  const handleNextDay = () => {
    setActiveDay(prev => Math.min(forecast.length - 1, prev + 1));
  };

  if (!forecast || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Loading forecast data...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  const selectedDay = forecast[activeDay];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            7-Day Farm Forecast
          </span>
          <div className="flex items-center text-sm">
            <Button variant="ghost" size="sm" onClick={handlePrevDay} disabled={activeDay === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2">{selectedDay.date.toLocaleDateString()}</span>
            <Button variant="ghost" size="sm" onClick={handleNextDay} disabled={activeDay === forecast.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered weather forecast with farm-specific recommendations
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 py-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {forecast.map((day, index) => (
            <div 
              key={index}
              onClick={() => setActiveDay(index)}
              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                index === activeDay 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-secondary'
              }`}
            >
              <div className="text-sm font-medium">{day.day}</div>
              <div className="my-1">{getWeatherIcon(day.icon)}</div>
              <div className="text-xs space-x-1">
                <span className="font-medium">{Math.round(day.temp.max)}°</span>
                <span className="text-muted-foreground">{Math.round(day.temp.min)}°</span>
              </div>
              <Badge variant="outline" className="mt-1 text-xs px-1.5">
                {day.rainProb}%
              </Badge>
            </div>
          ))}
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedDay.date.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                <div>{getWeatherIcon(selectedDay.icon, 6)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium">{selectedDay.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-medium">
                    {Math.round(selectedDay.temp.max)}° / {Math.round(selectedDay.temp.min)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rain Probability:</span>
                  <span className="font-medium">{selectedDay.rainProb}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind Speed:</span>
                  <span className="font-medium">{selectedDay.windSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Humidity:</span>
                  <span className="font-medium">{Math.round(selectedDay.humidity)}%</span>
                </div>
              </div>
              
              <div className={`mt-6 p-3 rounded-lg ${getUrgencyColor(selectedDay.farmAction.urgency)}`}>
                <h4 className="font-semibold text-sm uppercase">AI Farm Action:</h4>
                <p className="font-bold">{selectedDay.farmAction.action}</p>
                <p className="text-sm mt-1">{selectedDay.farmAction.description}</p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Hourly Forecast</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {selectedDay.hourly.map((hour: any, index: number) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-center">
                  <div className="text-sm font-medium">
                    {hour.hour === 0 ? '12am' : hour.hour === 12 ? '12pm' : hour.hour > 12 ? `${hour.hour-12}pm` : `${hour.hour}am`}
                  </div>
                  <div className="my-1">{getWeatherIcon(hour.icon, 4)}</div>
                  <div className="text-sm font-semibold">{Math.round(hour.temp)}°</div>
                  <div className="text-xs text-muted-foreground">{hour.rainProb}%</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Weather Impact Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-1 mb-1">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    Moisture Impact
                  </h4>
                  <p className="text-sm">
                    {selectedDay.rainProb > 60 
                      ? "High moisture expected. Soil saturation possible, monitor drainage."
                      : selectedDay.rainProb > 30
                        ? "Moderate moisture expected. Good conditions for crop growth."
                        : "Low moisture expected. Consider irrigation planning."}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-1 mb-1">
                    <Wind className="h-4 w-4 text-slate-500" />
                    Wind Impact
                  </h4>
                  <p className="text-sm">
                    {selectedDay.windSpeed > 20
                      ? "High winds expected. Secure structures and young plants."
                      : selectedDay.windSpeed > 10
                        ? "Moderate winds. Suitable for most farming activities."
                        : "Light winds. Ideal conditions for spraying and fertilizing."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
