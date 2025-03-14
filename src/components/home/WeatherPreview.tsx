
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, Wind, ArrowRight, Droplet, CloudLightning, Thermometer, CloudSun, Umbrella } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface WeatherPreview {
  temp: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  rainChance: number;
  humidity: number;
  windSpeed: number;
  recommendation: string;
  forecast: Array<{
    day: string;
    temp: number;
    icon: "sun" | "cloud" | "rain" | "storm";
    rainChance: number;
  }>;
}

export default function WeatherPreview() {
  const [weather, setWeather] = useState<WeatherPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  
  useEffect(() => {
    // Simulate fetching weather data
    setTimeout(() => {
      setWeather({
        temp: 28,
        condition: "Partly Cloudy",
        icon: "cloud",
        rainChance: 30,
        humidity: 65,
        windSpeed: 12,
        recommendation: "Good conditions for field work today, rain expected tomorrow.",
        forecast: [
          { day: "Today", temp: 28, icon: "cloud", rainChance: 30 },
          { day: "Tue", temp: 24, icon: "rain", rainChance: 70 },
          { day: "Wed", temp: 26, icon: "rain", rainChance: 60 },
          { day: "Thu", temp: 29, icon: "sun", rainChance: 10 },
          { day: "Fri", temp: 30, icon: "sun", rainChance: 5 },
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);

  const getWeatherIcon = (icon: string, size: number = 10) => {
    const className = `h-${size} w-${size}`;
    switch(icon) {
      case "rain": return <CloudRain className={className} style={{height: `${size/4}rem`, width: `${size/4}rem`}} text-blue-500" />;
      case "cloud": return <CloudSun className={className} style={{height: `${size/4}rem`, width: `${size/4}rem`}} text-slate-400" />;
      case "storm": return <CloudLightning className={className} style={{height: `${size/4}rem`, width: `${size/4}rem`}} text-purple-500" />;
      default: return <Sun className={className} style={{height: `${size/4}rem`, width: `${size/4}rem`}} text-amber-500" />;
    }
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
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
              <div className="relative">
                {getWeatherIcon(weather.icon, 10)}
                <div className="absolute inset-0 rounded-full bg-blue-200/20 dark:bg-blue-500/10 blur-xl -z-10"></div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tighter flex items-start">
                  {weather.temp}°C
                  <span className="text-sm text-muted-foreground ml-1 mt-1">
                    {weather.condition}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Wind: {weather.windSpeed} km/h
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <span className="text-sm">{weather.humidity}%</span>
                </div>
                <Progress value={weather.humidity} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span>Rain</span>
                  </div>
                  <span className="text-sm">{weather.rainChance}%</span>
                </div>
                <Progress value={weather.rainChance} className="h-2" />
              </div>
            </div>
            
            <div className="mb-4 overflow-x-auto">
              <div className="flex space-x-1 pb-1 min-w-max">
                {weather.forecast.map((day, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg flex-1 min-w-24 text-center cursor-pointer transition-all ${
                      activeDay === index 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => setActiveDay(index)}
                  >
                    <div className="font-medium text-xs">{day.day}</div>
                    <div className="my-1">{getWeatherIcon(day.icon, 6)}</div>
                    <div className="text-sm font-semibold">{day.temp}°</div>
                    <div className="text-xs flex justify-center items-center gap-1">
                      <Umbrella className="h-3 w-3" />
                      {day.rainChance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Farm Advice:</span> {weather.recommendation}
              </p>
            </div>
            
            <Link to="/weather">
              <Button variant="outline" size="sm" className="w-full group">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Full Weather Forecast
                  <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
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
