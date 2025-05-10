
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CloudSun, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherAlert {
  message: string;
  severity: "low" | "medium" | "high";
  icon: "sun" | "cloud" | "rain" | "storm";
}

interface MarketTrend {
  crop: string;
  change: number;
  direction: "up" | "down" | "stable";
}

interface SummaryPanelProps {
  className?: string;
}

export function SummaryPanel({ className }: SummaryPanelProps) {
  const { user } = useAuth();
  const [farmHealth, setFarmHealth] = useState<number | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to get data from localStorage first (offline support)
        const localData = localStorage.getItem(`dashboard_data_${user.id}`);
        if (localData) {
          const parsedData = JSON.parse(localData);
          setFarmHealth(parsedData.farmHealth);
          setWeatherAlert(parsedData.weatherAlert);
          setMarketTrend(parsedData.marketTrend);
        }

        // If online, fetch fresh data
        if (isOnline()) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          const { data: weatherData, error: weatherError } = await supabase
            .from("weather_data")
            .select("*")
            .eq("user_id", user.id)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (profileError || weatherError) {
            console.error("Error fetching dashboard data:", profileError || weatherError);
            setError("Failed to load dashboard data");
          } else {
            // Calculate farm health score (example algorithm)
            const completedTasksCount = localStorage.getItem(`completed_tasks_${user.id}`) 
              ? JSON.parse(localStorage.getItem(`completed_tasks_${user.id}`) || "0")
              : 0;
            
            const calculatedHealth = Math.min(
              Math.max(
                65 + // Base score
                (completedTasksCount * 2) + // Tasks completed boost
                (weatherData?.forecast?.rain_chance ? -10 : 5) + // Weather impact
                Math.floor(Math.random() * 10), // Small random factor for now
                0
              ),
              100
            );
            
            setFarmHealth(calculatedHealth);
            
            // Set weather alert based on forecast
            if (weatherData?.forecast) {
              setWeatherAlert({
                message: weatherData.forecast.rain_chance > 50 
                  ? "Rain expected today" 
                  : weatherData.forecast.rain_chance > 25
                    ? "Light rain possible"
                    : "Clear conditions today",
                severity: weatherData.forecast.rain_chance > 70 
                  ? "high" 
                  : weatherData.forecast.rain_chance > 40
                    ? "medium"
                    : "low",
                icon: weatherData.forecast.icon || "sun"
              });
            }

            // Example market trend (in real app, fetch from market data table)
            setMarketTrend({
              crop: "Maize",
              change: 12,
              direction: "up"
            });

            // Save to localStorage for offline use
            const dashboardData = {
              farmHealth: calculatedHealth,
              weatherAlert: weatherAlert || {
                message: weatherData?.forecast?.rain_chance > 50 
                  ? "Rain expected today" 
                  : "Clear conditions expected",
                severity: weatherData?.forecast?.rain_chance > 70 ? "high" : "low",
                icon: weatherData?.forecast?.icon || "sun"
              },
              marketTrend: {
                crop: "Maize",
                change: 12,
                direction: "up"
              }
            };
            
            localStorage.setItem(`dashboard_data_${user.id}`, JSON.stringify(dashboardData));
          }
        }
      } catch (err) {
        console.error("Error in dashboard data fetching:", err);
        setError("Couldn't load farm data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Get appropriate color for health score
  const getHealthColor = (score: number | null) => {
    if (score === null) return "bg-gray-200 text-gray-500";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-md", className)}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium opacity-90">Farm Health Score</h2>
              <div className="flex items-baseline">
                {loading ? (
                  <div className="h-10 w-16 animate-pulse rounded bg-white/30"></div>
                ) : (
                  <span className="text-3xl font-bold">{farmHealth || 0}%</span>
                )}
                <span className="ml-2 text-xs opacity-80">Based on rainfall, crops, and tasks</span>
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
              {farmHealth !== null && (
                <span className="text-xl font-bold">{farmHealth}%</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-800">
          {weatherAlert && (
            <div className="flex items-center gap-3 p-3">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                weatherAlert.severity === "high" 
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                  : weatherAlert.severity === "medium"
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                <CloudSun size={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Weather Alert</p>
                <p className="text-sm font-medium">{weatherAlert.message}</p>
              </div>
            </div>
          )}
          
          {marketTrend && (
            <div className="flex items-center gap-3 p-3">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                marketTrend.direction === "up"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : marketTrend.direction === "down"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
              )}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Price Trend</p>
                <p className="text-sm font-medium">
                  {marketTrend.crop} price {marketTrend.direction === "up" ? "+" : "-"}
                  {marketTrend.change}% this week
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Alert</p>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SummaryPanel;
