import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  interface FarmUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}
interface FarmData {
  crops: string[];
  size: number;
  soilType: string;
  irrigationSystem: string;
}
const [user, setUser] = useState<FarmUser | null>(null);
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Define checkUser and getLocation before useEffect
  const checkUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser(); // Renamed to supabaseUser to avoid confusion
    if (supabaseUser) {
      const { id, email, ...rest } = supabaseUser;
      const farmUserInstance: FarmUser = {
        id,
        email: email ?? undefined, // Ensure email is explicitly string | undefined
        ...rest, // Spread remaining properties, compatible with [key: string]: unknown
      };
      setUser(farmUserInstance);
      
      setFarmData({
        crops: ["Maize", "Beans", "Coffee"],
        size: 2.5,
        soilType: "Clay Loam",
        irrigationSystem: "Drip",
      });
    }
  }, []); // setUser and setFarmData are stable

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not retrieve your location. Using default.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  useEffect(() => {
    checkUser();
    getLocation();
    setTimeout(() => setLoading(false), 1500);
  }, [checkUser, getLocation]);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveWeatherPanel location={location} />
          </div>
          <div className="lg:col-span-1">
            <DisasterAlerts location={location} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>AI Farm Action Recommendations</span>
                  <Badge className="bg-amber-500 hover:bg-amber-600">Priority Actions</Badge>
                </CardTitle>
                <CardDescription>
                  These AI-powered recommendations are based on current and forecasted weather conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FarmActionsList location={location} crops={farmData?.crops || []} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Market Weather Impact</span>
                </CardTitle>
                <CardDescription>
                  AI-predicted price fluctuations based on regional weather patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MarketImpact location={location} crops={farmData?.crops || []} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
            <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Predictions</TabsTrigger>
            <TabsTrigger value="rain">Rainfall Analysis</TabsTrigger>
            <TabsTrigger value="alerts">Alert History</TabsTrigger>
          </TabsList>
          <TabsContent value="forecast" className="mt-4">
            <ForecastPanel location={location} />
          </TabsContent>
          <TabsContent value="seasonal" className="mt-4">
            <SeasonalPredictions location={location} crops={farmData?.crops || []} />
          </TabsContent>
          <TabsContent value="rain" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rainfall Analysis & Predictions</CardTitle>
                <CardDescription>
                  AI-powered rainfall pattern analysis for optimal farming decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Droplet className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed rainfall analysis and forecast coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weather Alert History</CardTitle>
                <CardDescription>
                  Past alerts and notifications for your farm location
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4" />
                  <p>Weather alert history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
