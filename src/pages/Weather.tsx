
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabaseClient";
import {
  Bell,
  Cloud,
  CloudRain,
  Droplet,
  ThermometerSun,
  Wind,
  AlertTriangle,
  CalendarDays,
  Tractor,
  TrendingUp,
  Umbrella,
  ArrowRight,
  RefreshCw,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LiveWeatherPanel from "@/components/weather/LiveWeatherPanel";
import ForecastPanel from "@/components/weather/ForecastPanel";
import DisasterAlerts from "@/components/weather/DisasterAlerts";
import SeasonalPredictions from "@/components/weather/SeasonalPredictions";
import MarketImpact from "@/components/weather/MarketImpact";
import FarmActionsList from "@/components/weather/FarmActionsList";
import Layout from "@/components/Layout";

export default function Weather() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: -0.42, lng: 36.95, name: "Nyeri, Kenya" });
  const [user, setUser] = useState<any>(null);
  const [farmData, setFarmData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState({
    current: {
      temperature: 26,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      uvIndex: 6,
      visibility: 10
    },
    forecast: [
      { day: 'Today', high: 28, low: 18, condition: 'Partly Cloudy', rain: 15 },
      { day: 'Tomorrow', high: 30, low: 20, condition: 'Sunny', rain: 5 },
      { day: 'Wednesday', high: 27, low: 19, condition: 'Light Rain', rain: 80 },
      { day: 'Thursday', high: 25, low: 17, condition: 'Cloudy', rain: 40 },
      { day: 'Friday', high: 29, low: 21, condition: 'Sunny', rain: 10 }
    ],
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'Heavy Rain Expected',
        message: 'Heavy rainfall expected Wednesday. Protect young plants and ensure proper drainage.',
        severity: 'medium',
        validUntil: 'Wednesday 6 PM'
      }
    ]
  });

  useEffect(() => {
    checkUser();
    getLocation();
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // In a real app, we would fetch the user's farm data from Supabase
      setFarmData({
        crops: ["Maize", "Beans", "Coffee"],
        size: 2.5,
        soilType: "Clay Loam",
        irrigationSystem: "Drip",
      });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Your Farm",
          });
        },
        () => {
          toast({
            variant: "destructive",
            description: "Unable to access location. Using default location.",
          });
        }
      );
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      toast({
        description: "Weather data updated with latest AI predictions",
      });
    }, 1500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="mt-4 text-2xl font-semibold">Loading AI Weather Intelligence</h2>
            <p className="text-muted-foreground">Analyzing hyperlocal conditions for your farm...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 space-y-8 max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Weather Intelligence</h1>
            <p className="text-muted-foreground mt-1">
              Hyperlocal AI-powered weather intelligence for optimized farming decisions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {location.name}
            </Badge>
            <Button size="sm" onClick={refreshData} disabled={refreshing} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Refresh"}
            </Button>
          </div>
        </header>

        {/* Current Weather Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThermometerSun className="h-5 w-5" />
                  Current Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{weatherData.current.temperature}°C</div>
                    <p className="text-sm text-muted-foreground">{weatherData.current.condition}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{weatherData.current.humidity}%</div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{weatherData.current.windSpeed} km/h</div>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">UV {weatherData.current.uvIndex}</div>
                    <p className="text-sm text-muted-foreground">UV Index</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {weatherData.alerts.map((alert) => (
                      <div key={alert.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-medium text-orange-900 text-sm">{alert.title}</h4>
                        <p className="text-xs text-orange-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-orange-600 mt-2">Until: {alert.validUntil}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No weather alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              5-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-sm mb-2">{day.day}</p>
                  <div className="text-2xl mb-2">
                    {day.condition === 'Sunny' && '☀️'}
                    {day.condition === 'Partly Cloudy' && '⛅'}
                    {day.condition === 'Cloudy' && '☁️'}
                    {day.condition === 'Light Rain' && '🌦️'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{day.high}° / {day.low}°</p>
                    <p className="text-xs text-blue-600">{day.rain}% rain</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tractor className="h-5 w-5" />
                AI Farm Recommendations
              </CardTitle>
              <CardDescription>
                Smart actions based on current weather conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="p-1 bg-green-500 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Perfect Planting Conditions</h4>
                    <p className="text-sm text-green-700">Current temperature and humidity are ideal for planting maize. Consider starting today.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="p-1 bg-orange-500 rounded-full">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-900">Prepare for Rain</h4>
                    <p className="text-sm text-orange-700">Heavy rain expected Wednesday. Ensure proper drainage and protect young plants.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="p-1 bg-blue-500 rounded-full">
                    <Droplet className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Irrigation Schedule</h4>
                    <p className="text-sm text-blue-700">Reduce watering by 30% this week due to expected rainfall.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Weather Impact
              </CardTitle>
              <CardDescription>
                How weather affects crop prices in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Maize Prices</p>
                    <p className="text-sm text-muted-foreground">Expected to rise due to rain</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+8%</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Tomato Prices</p>
                    <p className="text-sm text-muted-foreground">May drop due to oversupply</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-3%</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bean Prices</p>
                    <p className="text-sm text-muted-foreground">Stable conditions expected</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-600">+1%</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Weather Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Soil Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moisture Level</span>
                  <span className="font-bold text-blue-600">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Temperature</span>
                  <span className="font-bold">{weatherData.current.temperature - 3}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">pH Level</span>
                  <span className="font-bold text-green-600">6.8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growing Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Rating</span>
                  <span className="font-bold text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best for</span>
                  <span className="font-bold">Maize, Beans</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avoid</span>
                  <span className="font-bold text-red-600">Tomatoes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Temperature</span>
                  <span className="font-bold">27°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Rainfall</span>
                  <span className="font-bold text-blue-600">45mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sunny Days</span>
                  <span className="font-bold text-yellow-600">4/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
