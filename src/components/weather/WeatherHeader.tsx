
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Bell, ArrowDown, ArrowUp, Droplet, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface WeatherHeaderProps {
  farmLocation?: string;
  setFarmLocation: (location: string) => void;
}

export default function WeatherHeader({ farmLocation, setFarmLocation }: WeatherHeaderProps) {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock geolocation detection for demo
  useEffect(() => {
    if (!farmLocation) {
      // This would normally use the user's actual location or saved farm location
      const defaultLocation = "Nairobi, Kenya";
      setFarmLocation(defaultLocation);
      
      // Simulate API call delay
      setTimeout(() => {
        fetchWeatherData(defaultLocation);
      }, 1000);
    } else {
      fetchWeatherData(farmLocation);
    }
  }, [farmLocation]);
  
  const fetchWeatherData = async (location: string) => {
    setLoading(true);
    try {
      // This would be a real API call in production
      // Simulating weather data for demo
      const mockData = {
        location: location,
        current: {
          temp_c: 25,
          temp_f: 77,
          condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
          },
          humidity: 65,
          wind_kph: 15,
          precip_mm: 0.2,
          feelslike_c: 27,
          uv: 6
        },
        forecast: {
          forecastday: [
            {
              date: new Date().toISOString().split('T')[0],
              day: {
                maxtemp_c: 28,
                mintemp_c: 18,
                daily_chance_of_rain: 35
              }
            }
          ]
        }
      };
      
      setCurrentWeather(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast({
        variant: "destructive",
        description: "Failed to load weather data. Please try again."
      });
      setLoading(false);
    }
  };
  
  const handleLocationUpdate = () => {
    const newLocation = prompt("Enter your farm location:", farmLocation);
    if (newLocation && newLocation !== farmLocation) {
      setFarmLocation(newLocation);
    }
  };
  
  if (loading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-gray-200 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentWeather) return null;
  
  const today = currentWeather.forecast.forecastday[0];
  const highTemp = today.day.maxtemp_c;
  const lowTemp = today.day.mintemp_c;
  const rainChance = today.day.daily_chance_of_rain;
  
  // Determine what action the farmer should take based on the weather
  const determineAction = () => {
    if (rainChance > 70) {
      return "Heavy rain expected - adjust irrigation schedules and secure crops.";
    } else if (rainChance > 40) {
      return "Moderate chance of rain - prepare cover for sensitive crops.";
    } else if (currentWeather.current.temp_c > 30) {
      return "High temperatures - increase irrigation and provide shade where possible.";
    } else if (currentWeather.current.wind_kph > 25) {
      return "Strong winds - secure young plants and structures.";
    } else {
      return "Favorable conditions - ideal for field work and regular farm activities.";
    }
  };
  
  const action = determineAction();
  
  return (
    <Card className="mb-6 overflow-hidden border-none shadow-md">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-crop-green-500 to-crop-green-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-1">
                <MapPin className="mr-1 h-4 w-4" />
                <h2 className="text-lg font-medium">{currentWeather.location}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-white h-6 hover:text-white hover:bg-white/20"
                  onClick={handleLocationUpdate}
                >
                  Change
                </Button>
              </div>
              <div className="flex items-center mb-4">
                <Calendar className="mr-1 h-4 w-4" />
                <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <img 
                  src={currentWeather.current.condition.icon} 
                  alt={currentWeather.current.condition.text}
                  className="w-16 h-16 mr-2"
                />
                <div className="flex flex-col">
                  <span className="text-4xl font-bold">{currentWeather.current.temp_c}°C</span>
                  <span className="text-sm">{currentWeather.current.condition.text}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 max-w-md">
                <div className="flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  <span>{highTemp}°C</span>
                </div>
                <div className="flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  <span>{lowTemp}°C</span>
                </div>
                <div className="flex items-center">
                  <Droplet className="mr-1 h-4 w-4" />
                  <span>{rainChance}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="bg-white/20 text-white border-0 mb-2">
                AI-Powered Forecast
              </Badge>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-crop-green-600">
                <Bell className="mr-2 h-4 w-4" />
                Set Alert
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <h3 className="font-medium text-lg text-yellow-800">AI Farm Recommendation</h3>
          <p className="text-yellow-800">{action}</p>
        </div>
      </CardContent>
    </Card>
  );
}
