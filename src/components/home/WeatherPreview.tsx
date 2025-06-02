
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, Wind, ArrowRight, Droplet, CloudLightning, Thermometer, CloudSun, Umbrella, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface WeatherPreview {
  temp: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  rainChance: number;
  humidity: number;
  windSpeed: number;
  recommendation: string;
  farmAction: string;
  urgency: "normal" | "warning" | "critical";
  forecast: Array<{
    day: string;
    temp: number;
    icon: "sun" | "cloud" | "rain" | "storm";
    rainChance: number;
  }>;
}

export default function WeatherPreview() {
  const [weather, setWeather] = useState<WeatherPreview | null>(null);
  const [loading, setLoading] = useState(false); // Always set loading to false to prevent loading screens
  const [activeDay, setActiveDay] = useState(0);
  const [animation, setAnimation] = useState(false);
  const [locationName, setLocationName] = useState("Your Farm");
  
  useEffect(() => {
    // Simulate fetching location
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationName("Detected Farm Location");
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
          },
          () => {
            fetchWeatherData(-1.2921, 36.8219); // Default to Nairobi if location not available
          }
        );
      } else {
        fetchWeatherData(-1.2921, 36.8219); // Default to Nairobi if geolocation not supported
      }
    }, 800);
  }, []);
  
  const fetchWeatherData = (lat: number, lon: number) => {
    // In a real app, this would fetch from a weather API
    // For now, we'll simulate AI-generated weather insights
    setTimeout(() => {
      // Determine if we should show a weather alert based on random chance (30%)
      const hasAlert = Math.random() > 0.7;
      
      setWeather({
        temp: Math.floor(22 + Math.random() * 10),
        condition: hasAlert ? "Heavy Rain Expected" : "Partly Cloudy",
        icon: hasAlert ? "rain" : "cloud",
        rainChance: hasAlert ? 80 : 30,
        humidity: 55 + Math.floor(Math.random() * 20),
        windSpeed: 8 + Math.floor(Math.random() * 10),
        recommendation: hasAlert 
          ? "Delay field work and secure crops before heavy rainfall arrives."
          : "Good conditions for field work today, monitor humidity levels for disease prevention.",
        farmAction: hasAlert
          ? "URGENT: Harvest mature crops within next 6 hours"
          : "Optimal conditions for applying foliar fertilizer",
        urgency: hasAlert ? "critical" : "normal",
        forecast: [
          { day: "Today", temp: 28, icon: hasAlert ? "rain" : "cloud", rainChance: hasAlert ? 80 : 30 },
          { day: "Tue", temp: 24, icon: "rain", rainChance: 70 },
          { day: "Wed", temp: 26, icon: "rain", rainChance: 60 },
          { day: "Thu", temp: 29, icon: "sun", rainChance: 10 },
          { day: "Fri", temp: 30, icon: "sun", rainChance: 5 },
        ]
      });
      
      setLoading(false);
      
      // Animate data refresh
      setAnimation(true);
      setTimeout(() => setAnimation(false), 1500);
      
      // Show alert if critical weather
      if (hasAlert) {
        setTimeout(() => {
          toast.warning("Weather Alert Detected", {
            description: "Heavy rainfall expected within 24 hours. AI recommends immediate action.",
            action: {
              label: "View Details",
              onClick: () => {}
            }
          });
        }, 1000);
      }
    }, 1200);
  };

  const getWeatherIcon = (icon: string, size: number = 10) => {
    const iconSize = `${size/4}rem`;
    
    switch(icon) {
      case "rain": 
        return <CloudRain style={{ height: iconSize, width: iconSize }} className="text-blue-500" />;
      case "cloud": 
        return <CloudSun style={{ height: iconSize, width: iconSize }} className="text-slate-400" />;
      case "storm": 
        return <CloudLightning style={{ height: iconSize, width: iconSize }} className="text-purple-500" />;
      default: 
        return <Sun style={{ height: iconSize, width: iconSize }} className="text-amber-500" />;
    }
  };

  const refreshWeather = () => {
    setLoading(true);
    fetchWeatherData(-1.2921, 36.8219);
  };

  return (
    <Card className={`h-full border-2 hover:border-primary/50 transition-all ${animation ? 'animate-pulse' : ''}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
        <CardTitle className="flex justify-between items-center">
          <span>AI Weather Intelligence</span>
          <Badge className="text-xs animate-pulse bg-green-600 hover:bg-green-700">LIVE</Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>Hyperlocal forecast for {locationName}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5" 
            onClick={refreshWeather}
          >
            <Cloud className="h-3 w-3" />
          </Button>
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
            
            <div className={`p-3 rounded-lg mb-4 ${
              weather.urgency === 'critical' 
                ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 animate-pulse' 
                : weather.urgency === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500'
                  : 'bg-blue-50 dark:bg-blue-900/30'
            }`}>
              {weather.urgency === 'critical' && (
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">WEATHER ALERT</span>
                </div>
              )}
              
              <p className={`text-sm ${
                weather.urgency === 'critical' 
                  ? 'text-red-800 dark:text-red-200 font-medium' 
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                <span className="font-medium">AI Farm Action:</span> {weather.farmAction}
              </p>
            </div>
            
            <Link to="/weather">
              <Button variant="outline" size="sm" className="w-full group">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Full Weather Intelligence
                  <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>Unable to load weather data</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={refreshWeather}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
