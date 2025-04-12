export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  location: string | null;
  farm_size: number | null;
  farm_units: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
};

export type WeatherData = {
  id: string;
  user_id: string;
  location: { lat: number; lng: number };
  location_name: string | null;
  temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  wind_direction: string | null;
  uv_index: number | null;
  forecast: {
    condition: string;
    rain_chance: number;
    soil_moisture: number;
    next_rain_hours: number;
    icon: string;
    alert: string | null;
  } | null;
  recorded_at: string;
};

// Define the Database interface matching our Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Profile>;
      };
      weather_data: {
        Row: WeatherData;
        Insert: Omit<WeatherData, 'id' | 'recorded_at'>;
        Update: Partial<WeatherData>;
      };
    };
  };
}
