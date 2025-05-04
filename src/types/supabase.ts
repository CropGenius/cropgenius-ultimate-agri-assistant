
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
  
  // Add these new fields
  mobile_phone: string | null;
  farm_region: string | null;
  user_language: string;
  farm_size_hectares: number | null;
  onboarding_completed: boolean;
  whatsapp_notifications: boolean;
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

// Enhanced database types to match Supabase schema
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
      fields: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string | null;
          name: string;
          size: number | null;
          size_unit: string | null;
          boundary: any | null;
          created_at: string | null;
          updated_at: string | null;
          is_shared: boolean | null;
          shared_with: string[] | null;
          location_description: string | null;
          soil_type: string | null;
          irrigation_type: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          farm_id?: string | null;
          name: string;
          size?: number | null;
          size_unit?: string | null;
          boundary?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_shared?: boolean | null;
          shared_with?: string[] | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["fields"]["Insert"]>;
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string | null;
          total_size: number | null;
          size_unit: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location?: string | null;
          total_size?: number | null;
          size_unit?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["farms"]["Insert"]>;
      };
    };
  };
}
