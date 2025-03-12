
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, 
  CloudRain, 
  Droplet, 
  Sun, 
  ThermometerSun, 
  Wind, 
  Umbrella,
  CloudSnow,
  CloudLightning,
} from "lucide-react";

interface LiveWeatherPanelProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function LiveWeatherPanel({ location }: LiveWeatherPanelProps) {
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Sunny",
    humidity: 65,
    windSpeed: 12,
    windDirection: "NE",
    rainChance: 10,
    soilMoisture: 42,
    nextRainHours: 36,
    icon: "sun",
    alert: null,
  });

  useEffect(() => {
    // In a real app, we would fetch real weather data based on location
    // This is a simulation that changes the weather data slightly every few seconds
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temp: prev.temp + (Math.random() - 0.5) * 0.5,
        humidity: Math.min(100, Math.max(30, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 0.8),
        soilMoisture: Math.max(0, Math.min(100, prev.soilMoisture - 0.1)),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch(weather.icon) {
      case "rain": return <CloudRain className="h-12 w-12 text-blue-500" />;
      case "cloud": return <Cloud className="h-12 w-12 text-slate-400" />;
      case "storm": return <CloudLightning className="h-12 w-12 text-purple-500" />;
      case "snow": return <CloudSnow className="h-12 w-12 text-blue-300" />;
      default: return <Sun className="h-12 w-12 text-amber-500" />;
    }
  };

  const getActionRecommendation = () => {
    if (weather.soilMoisture < 45) {
      return {
        text: "AI recommends irrigation within the next 12 hours",
        type: "warning",
      };
    }
    
    if (weather.rainChance > 70) {
      return {
        text: "Delay irrigation - rain expected within 24 hours",
        type: "info",
      };
    }
    
    return {
      text: "Conditions optimal - no immediate action required",
      type: "success",
    };
  };

  const recommendation = getActionRecommendation();

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>Live Farm Weather</span>
          <Badge className="text-xs animate-pulse bg-green-600 hover:bg-green-700">LIVE UPDATING</Badge>
        </CardTitle>
        <CardDescription>
          AI-powered hyperlocal weather tailored to your specific farm location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              {getWeatherIcon()}
              <div>
                <div className="text-4xl font-bold tracking-tighter">{weather.temp.toFixed(1)}°C</div>
                <div className="text-lg">{weather.condition}, {weather.windSpeed.toFixed(1)} km/h {weather.windDirection}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <span className="text-sm">{weather.humidity.toFixed(0)}%</span>
                </div>
                <Progress value={weather.humidity} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Umbrella className="h-4 w-4 text-blue-400" />
                    <span>Chance of Rain</span>
                  </div>
                  <span className="text-sm">{weather.rainChance}%</span>
                </div>
                <Progress value={weather.rainChance} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Droplet className="h-4 w-4 text-brown-500" />
                    <span>Soil Moisture</span>
                  </div>
                  <span className="text-sm">{weather.soilMoisture.toFixed(1)}%</span>
                </div>
                <Progress value={weather.soilMoisture} className="h-2" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Farm Insights</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ThermometerSun className="h-5 w-5 text-amber-500 mt-0.5" />
                  <span>
                    Temperature optimal for maize growth today
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Umbrella className="h-5 w-5 text-blue-500 mt-0.5" />
                  <span>
                    Next rainfall expected in <strong>{weather.nextRainHours} hours</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Wind className="h-5 w-5 text-slate-500 mt-0.5" />
                  <span>
                    Wind conditions suitable for pesticide application
                  </span>
                </li>
              </ul>
            </div>
            
            <div className={`mt-4 p-3 rounded-lg 
              ${recommendation.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' : 
               recommendation.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 
               'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
              <h4 className="font-semibold">AI Recommendation:</h4>
              <p>{recommendation.text}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
