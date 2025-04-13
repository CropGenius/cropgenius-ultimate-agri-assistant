
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Sun, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import YourFarmButton from './YourFarmButton';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
}

const sampleWeatherData: WeatherData = {
  temperature: 28,
  humidity: 75,
  windSpeed: 15,
  condition: "Partly Cloudy",
  location: "Your Farm"
};

export default function LiveWeatherPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching weather data
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace this with actual API call
        setTimeout(() => {
          setWeather(sampleWeatherData);
          setLoading(false);
        }, 1500);
      } catch (e: any) {
        setError(e.message || "Failed to fetch weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          Live Weather
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>AI-powered hyperlocal weather tailored to your specific farm location</span>
          <YourFarmButton size="sm" buttonText="View Your Farm" variant="secondary" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : weather ? (
          <div className="space-y-4">
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <div className="text-sm text-muted-foreground">{weather.condition} in {weather.location}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <div>{weather.temperature}°C</div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>{weather.humidity}% Humidity</div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <div>{weather.windSpeed} km/h Wind</div>
              </div>
            </div>
          </div>
        ) : (
          <div>No weather data available.</div>
        )}
      </CardContent>
    </Card>
  );
}
