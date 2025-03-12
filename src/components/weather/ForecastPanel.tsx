
import { useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Thermometer, Wind, Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    daily_chance_of_rain: number;
    condition: {
      text: string;
      code: number;
    };
  };
  hour: Array<{
    time: string;
    temp_c: number;
    chance_of_rain: number;
    condition: {
      text: string;
      code: number;
    };
  }>;
}

export default function ForecastPanel() {
  const [forecastType, setForecastType] = useState("daily");
  
  // Mock forecast data
  const dailyForecast: ForecastDay[] = [
    {
      date: new Date().toISOString().split('T')[0],
      day: {
        maxtemp_c: 28,
        mintemp_c: 18,
        daily_chance_of_rain: 35,
        condition: { text: "Partly cloudy", code: 1003 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 29,
        mintemp_c: 19,
        daily_chance_of_rain: 45,
        condition: { text: "Partly cloudy", code: 1003 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 27,
        mintemp_c: 18,
        daily_chance_of_rain: 65,
        condition: { text: "Moderate rain", code: 1189 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 25,
        mintemp_c: 17,
        daily_chance_of_rain: 80,
        condition: { text: "Heavy rain", code: 1195 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 24,
        mintemp_c: 16,
        daily_chance_of_rain: 55,
        condition: { text: "Light rain", code: 1183 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 26,
        mintemp_c: 17,
        daily_chance_of_rain: 30,
        condition: { text: "Partly cloudy", code: 1003 }
      },
      hour: []
    },
    {
      date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      day: {
        maxtemp_c: 27,
        mintemp_c: 18,
        daily_chance_of_rain: 20,
        condition: { text: "Sunny", code: 1000 }
      },
      hour: []
    }
  ];
  
  // Mock seasonal forecast data
  const seasonalForecast = {
    season: "Growing Season 2023",
    rainfall: {
      predicted: 750, // mm
      normal: 850, // mm
      difference: -12 // percentage
    },
    temperature: {
      predicted: 24.5, // celsius
      normal: 23.8, // celsius
      difference: 3 // percentage
    },
    drought_risk: 35, // percentage
    flood_risk: 15, // percentage
    start_date: "2023-03-15",
    end_date: "2023-08-30",
    recommendations: [
      "Consider drought-resistant crop varieties",
      "Implement water conservation techniques",
      "Plan for supplemental irrigation",
      "Monitor soil moisture levels closely"
    ]
  };
  
  // Helper function to get icon for weather condition
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
      return <CloudRain className="h-6 w-6" />;
    } else if (condition.includes("snow")) {
      return <CloudSnow className="h-6 w-6" />;
    } else if (condition.includes("thunder") || condition.includes("lightning")) {
      return <CloudLightning className="h-6 w-6" />;
    } else if (condition.includes("cloud")) {
      return <Cloud className="h-6 w-6" />;
    } else {
      return <Sun className="h-6 w-6" />;
    }
  };
  
  // Format date to display day name
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Weather Forecast</span>
          <Tabs defaultValue="daily" className="w-[400px]" onValueChange={setForecastType}>
            <TabsList>
              <TabsTrigger value="daily">7-Day Forecast</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Outlook</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TabsContent value="daily" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {dailyForecast.map((day, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-3 pb-2">
                  <CardTitle className="text-sm font-medium text-center">
                    {formatDate(day.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 text-center">
                  <div className="mb-2 flex justify-center">
                    {getWeatherIcon(day.day.condition.text)}
                  </div>
                  <div className="text-xs mb-1">{day.day.condition.text}</div>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <span className="font-bold">{day.day.maxtemp_c}°</span>
                    <span className="text-gray-500 text-sm">{day.day.mintemp_c}°</span>
                  </div>
                  <div className="flex items-center justify-center text-xs text-blue-600">
                    <Droplet className="h-3 w-3 mr-1" />
                    {day.day.daily_chance_of_rain}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="seasonal">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Rainfall Outlook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span>Predicted: {seasonalForecast.rainfall.predicted}mm</span>
                    <span className="text-amber-600">
                      {seasonalForecast.rainfall.difference}% below average
                    </span>
                  </div>
                  <Progress value={100 - Math.abs(seasonalForecast.rainfall.difference)} className="h-3 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                      <div className="flex items-center mb-1">
                        <Thermometer className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="font-medium">Drought Risk</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">{seasonalForecast.drought_risk}%</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="flex items-center mb-1">
                        <CloudRain className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium">Flood Risk</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{seasonalForecast.flood_risk}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Temperature Outlook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span>Predicted: {seasonalForecast.temperature.predicted}°C</span>
                    <span className="text-red-600">
                      {seasonalForecast.temperature.difference}% above average
                    </span>
                  </div>
                  <Progress value={100 - Math.abs(seasonalForecast.temperature.difference)} className="h-3 mb-4" />
                  
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium">Growing Season</span>
                    </div>
                    <div className="text-sm">
                      {new Date(seasonalForecast.start_date).toLocaleDateString()} to {new Date(seasonalForecast.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {seasonalForecast.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="hourly">
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground">Hourly forecast data is available for premium accounts</p>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
}
