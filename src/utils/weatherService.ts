
import { supabase } from "@/integrations/supabase/client";

// Interface for weather data
export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  rainChance: number;
  soilMoisture: number;
  nextRainHours: number;
  icon: "sun" | "rain" | "cloud" | "storm" | "snow";
  alert: string | null;
}

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

// Function to fetch weather data from OpenWeatherMap API
export const fetchWeatherData = async (location: LocationData): Promise<WeatherData> => {
  try {
    // OpenWeatherMap API key
    const apiKey = "demo_key"; // Replace with your actual API key in production
    
    // Fetch current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    // Fetch forecast data for rain prediction
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    
    // Calculate hours until next rain
    let nextRainHours = 72; // Default if no rain predicted
    const rainForecast = forecastData.list?.find((item: any) => 
      item.weather[0].main === "Rain" || item.weather[0].main === "Drizzle"
    );
    
    if (rainForecast) {
      const rainTime = new Date(rainForecast.dt * 1000);
      const currentTime = new Date();
      const hoursDiff = Math.round((rainTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
      nextRainHours = Math.max(0, hoursDiff);
    }
    
    // Determine weather icon
    let icon: "sun" | "rain" | "cloud" | "storm" | "snow" = "sun";
    const weatherMain = weatherData.weather?.[0]?.main?.toLowerCase() || "";
    
    if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
      icon = "rain";
    } else if (weatherMain.includes("cloud")) {
      icon = "cloud";
    } else if (weatherMain.includes("storm") || weatherMain.includes("thunder")) {
      icon = "storm";
    } else if (weatherMain.includes("snow")) {
      icon = "snow";
    }
    
    // Simulate soil moisture based on recent precipitation and humidity
    // In a real app, this would come from soil sensors or more advanced models
    const recentPrecipitation = weatherData.rain?.["1h"] || weatherData.rain?.["3h"] || 0;
    const soilMoisture = Math.min(100, Math.max(20, 
      40 + (recentPrecipitation * 15) + (weatherData.main.humidity * 0.2)
    ));
    
    // Determine rain chance from forecast
    const next24hForecasts = forecastData.list?.slice(0, 8) || [];
    const rainForecasts = next24hForecasts.filter((item: any) => 
      item.weather[0].main === "Rain" || item.weather[0].main === "Drizzle"
    );
    const rainChance = Math.round((rainForecasts.length / next24hForecasts.length) * 100);
    
    // Check for any weather alerts
    const alert = weatherData.alerts?.[0]?.description || null;
    
    return {
      temp: weatherData.main.temp,
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      windDirection: getWindDirection(weatherData.wind.deg),
      rainChance,
      soilMoisture,
      nextRainHours,
      icon,
      alert
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    
    // Return fallback weather data if API call fails
    return {
      temp: 28,
      condition: "Sunny",
      humidity: 65,
      windSpeed: 12,
      windDirection: "NE",
      rainChance: 10,
      soilMoisture: 42,
      nextRainHours: 36,
      icon: "sun",
      alert: null
    };
  }
};

// Helper function to convert wind direction in degrees to cardinal direction
const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Function to get AI-powered farming recommendations based on weather
export const getFarmingRecommendations = async (weather: WeatherData, crops: string[]): Promise<string[]> => {
  try {
    // In production, this would call an AI service through Supabase
    // For now, we'll return weather-based recommendations
    
    const recommendations: string[] = [];
    
    if (weather.soilMoisture < 40) {
      recommendations.push("Irrigation recommended - soil moisture levels are below optimal thresholds for most crops");
    }
    
    if (weather.rainChance > 70) {
      recommendations.push("Delay pesticide application - high chance of rain in the next 24 hours may wash away chemicals");
    }
    
    if (weather.temp > 32) {
      recommendations.push("High temperature alert - consider providing shade for sensitive crops and additional irrigation");
    }
    
    if (weather.windSpeed > 20) {
      recommendations.push("High wind alert - secure farm structures and delay spraying operations");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Conditions are currently optimal for most farming operations");
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error getting farming recommendations:", error);
    return ["Unable to generate recommendations at this time"];
  }
};
