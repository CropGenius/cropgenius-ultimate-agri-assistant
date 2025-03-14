
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, Wind, ArrowRight, Droplet, CloudLightning } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface WeatherPreview {
  temp: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  rainChance: number;
  humidity: number;
  recommendation: string;
}

export default function WeatherPreview() {
  const [weather, setWeather] = useState<WeatherPreview | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching weather data
    setTimeout(() => {
      setWeather({
        temp: 28,
        condition: "Partly Cloudy",
        icon: "cloud",
        rainChance: 30,
        humidity: 65,
        recommendation: "Good conditions for field work today, rain expected tomorrow"
      });
      setLoading(false);
    }, 1200);
  }, []);

  const getWeatherIcon = (icon: string) => {
    switch(icon) {
      case "rain": return <CloudRain className="h-10 w-10 text-blue-500" />;
      case "cloud": return <Cloud className="h-10 w-10 text-slate-400" />;
      case "storm": return <CloudLightning className="h-10 w-10 text-purple-500" />;
      default: return <Sun className="h-10 w-10 text-amber-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Farm Weather</span>
          <Badge className="text-xs animate-pulse bg-green-600 hover:bg-green-700">LIVE</Badge>
        </CardTitle>
        <CardDescription>
          Hyperlocal weather for your exact farm location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="h-16 w-16 rounded-full bg-gray-100 animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-100 animate-pulse"></div>
          </div>
        ) : weather ? (
          <div>
            <div className="flex items-center gap-4 mb-4">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-3xl font-bold tracking-tighter">{weather.temp}°C</div>
                <div className="text-sm text-muted-foreground">{weather.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Droplet className="h-4 w-4 text-blue-500" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CloudRain className="h-4 w-4 text-blue-500" />
                <span>Rain: {weather.rainChance}%</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Farm Advice:</span> {weather.recommendation}
              </p>
            </div>
            
            <Link to="/weather">
              <Button variant="outline" size="sm" className="w-full">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Full Weather Forecast
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>Unable to load weather data</p>
            <Button variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
