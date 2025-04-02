
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherData as AppWeatherData, LocationData } from "./weatherService";
import { WeatherData as DbWeatherData } from "@/types/supabase";

// Fetch weather data for a user's location from Supabase
export const fetchUserWeatherData = async (userId: string, location: LocationData) => {
  try {
    console.log("Fetching weather data for user:", userId, "at location:", location);
    
    // First, try to get the most recent weather data for this user's location
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('user_id', userId)
      .eq('location_name', location.name)
      .order('recorded_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // If we have data, return it
    if (data && data.length > 0) {
      console.log("Weather data found in Supabase:", data[0]);
      
      // Transform the data to match our WeatherData type
      const weatherData: AppWeatherData = {
        temp: data[0].temperature || 0,
        condition: data[0].forecast?.condition || "Clear",
        humidity: data[0].humidity || 0,
        windSpeed: data[0].wind_speed || 0,
        windDirection: data[0].wind_direction || "N",
        rainChance: data[0].forecast?.rain_chance || 0,
        soilMoisture: data[0].forecast?.soil_moisture || 50,
        nextRainHours: data[0].forecast?.next_rain_hours || 0,
        icon: data[0].forecast?.icon || "sun",
        alert: data[0].forecast?.alert || null,
      };
      
      return weatherData;
    }
    
    // If we don't have data in Supabase, fetch from the weather service and store it
    console.log("No weather data found in Supabase, fetching from weather service...");
    return null;
  } catch (error) {
    console.error("Error fetching weather data from Supabase:", error);
    toast.error("Failed to fetch weather data", {
      description: "There was an error retrieving your weather data."
    });
    return null;
  }
};

// Store weather data in Supabase
export const storeWeatherData = async (userId: string, location: LocationData, weatherData: AppWeatherData) => {
  try {
    console.log("Storing weather data in Supabase:", weatherData);
    
    const newWeatherData = {
      user_id: userId,
      location: { lat: location.lat, lng: location.lng },
      location_name: location.name,
      temperature: weatherData.temp,
      humidity: weatherData.humidity,
      wind_speed: weatherData.windSpeed,
      wind_direction: weatherData.windDirection,
      forecast: {
        condition: weatherData.condition,
        rain_chance: weatherData.rainChance,
        soil_moisture: weatherData.soilMoisture,
        next_rain_hours: weatherData.nextRainHours,
        icon: weatherData.icon,
        alert: weatherData.alert
      }
    };
    
    const { data, error } = await supabase
      .from('weather_data')
      .insert(newWeatherData)
      .select();
    
    if (error) throw error;
    
    console.log("Weather data stored successfully:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error storing weather data:", error);
    return { data: null, error: error.message };
  }
};
