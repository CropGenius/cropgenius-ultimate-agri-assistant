
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherData as AppWeatherData, LocationData } from "./weatherService";
import { WeatherData as DbWeatherData } from "@/types/supabase";

/**
 * Enhanced API for fetching weather data for a user's location from Supabase
 * Now with improved error handling, performance, and real-time capabilities
 */
export const fetchUserWeatherData = async (userId: string, location: LocationData): Promise<AppWeatherData | null> => {
  try {
    console.log("Fetching weather data for user:", userId, "at location:", location);
    
    if (!userId) {
      console.error("User ID is required to fetch weather data");
      toast.error("Authentication error", {
        description: "Please sign in to access weather data."
      });
      return null;
    }
    
    // Using the improved index on location_name for better performance
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
        icon: validateWeatherIcon(data[0].forecast?.icon),
        alert: data[0].forecast?.alert || null,
      };
      
      return weatherData;
    }
    
    // If we don't have data in Supabase, fetch from the weather service
    console.log("No weather data found in Supabase for this location");
    return null;
  } catch (error) {
    console.error("Error fetching weather data from Supabase:", error);
    toast.error("Failed to fetch weather data", {
      description: "There was an error retrieving your weather data. Please try again."
    });
    return null;
  }
};

/**
 * Enhanced function to store weather data in Supabase
 * Now with improved error handling and validation
 */
export const storeWeatherData = async (
  userId: string, 
  location: LocationData, 
  weatherData: AppWeatherData
): Promise<{data: any, error: string | null}> => {
  try {
    if (!userId) {
      return { 
        data: null, 
        error: "User ID is required to store weather data"
      };
    }
    
    console.log("Storing weather data in Supabase:", weatherData);
    
    // Validate data before sending to Supabase
    // These checks complement server-side validation triggers
    if (weatherData.temp < -50 || weatherData.temp > 60) {
      return { 
        data: null, 
        error: "Temperature is outside valid range (-50°C to 60°C)"
      };
    }
    
    if (weatherData.humidity < 0 || weatherData.humidity > 100) {
      return { 
        data: null, 
        error: "Humidity must be between 0% and 100%"
      };
    }
    
    // Prepare data for Supabase insert with proper typing
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
    
    // Insert with proper error handling
    const { data, error } = await supabase
      .from('weather_data')
      .insert(newWeatherData)
      .select();
    
    if (error) {
      console.error("Database error storing weather data:", error);
      throw error;
    }
    
    console.log("Weather data stored successfully:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error storing weather data:", error);
    toast.error("Failed to store weather data", {
      description: error.message || "An unexpected error occurred"
    });
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to real-time weather updates for a specific location
 * Returns a cleanup function to unsubscribe
 */
export const subscribeToWeatherUpdates = (
  userId: string, 
  locationName: string, 
  callback: (weatherData: AppWeatherData) => void
): () => void => {
  const channel = supabase
    .channel('weather-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'weather_data',
        filter: `user_id=eq.${userId}&location_name=eq.${locationName}`
      },
      (payload) => {
        console.log('New weather data received:', payload);
        if (payload.new) {
          const newData = payload.new as DbWeatherData;
          
          // Transform to application format
          const appWeatherData: AppWeatherData = {
            temp: newData.temperature || 0,
            condition: newData.forecast?.condition || "Clear",
            humidity: newData.humidity || 0,
            windSpeed: newData.wind_speed || 0,
            windDirection: newData.wind_direction || "N",
            rainChance: newData.forecast?.rain_chance || 0,
            soilMoisture: newData.forecast?.soil_moisture || 50,
            nextRainHours: newData.forecast?.next_rain_hours || 0,
            icon: validateWeatherIcon(newData.forecast?.icon),
            alert: newData.forecast?.alert || null,
          };
          
          callback(appWeatherData);
        }
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Helper function to validate and convert weather icon strings to allowed types
 * This ensures we never assign an invalid icon type
 */
const validateWeatherIcon = (icon?: string): "sun" | "rain" | "cloud" | "storm" | "snow" => {
  if (!icon) return "sun"; // Default fallback
  
  // Check if the icon string is already a valid type
  if (icon === "sun" || icon === "rain" || icon === "cloud" || icon === "storm" || icon === "snow") {
    return icon;
  }
  
  // Map similar strings to valid icons
  if (icon.includes("rain") || icon.includes("drizzle")) {
    return "rain";
  } else if (icon.includes("cloud")) {
    return "cloud";
  } else if (icon.includes("storm") || icon.includes("thunder") || icon.includes("lightning")) {
    return "storm";
  } else if (icon.includes("snow") || icon.includes("frost") || icon.includes("freezing")) {
    return "snow";
  }
  
  // Fallback to sun for unknown icons
  return "sun";
}
