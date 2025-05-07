
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

export type FieldInsightSourceType = "agent" | "weather" | "scan" | "user" | "system";
export type FieldInsightType = "observation" | "suggestion" | "alert" | "summary";

export interface FieldInsight {
  id: string;
  fieldId: string;
  timestamp: number;
  type: FieldInsightType;
  content: string;
  confidence: number;
  source: FieldInsightSourceType;
  actionRequired: boolean;
  relatedData: {
    weatherForecast?: string;
    soilMoisture?: string;
    soilConditions?: string;
    diseaseRisk?: string;
    marketTrend?: string;
  };
}

export interface AgentMemory {
  id: string;
  fieldId: string;
  timestamp: number;
  content: string;
  source: FieldInsightSourceType;
  tags?: string[];
}

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
      field_insights: {
        Row: FieldInsight & {
          created_at: string;
        };
        Insert: Omit<FieldInsight, 'id'> & {
          created_at?: string;
        };
        Update: Partial<Omit<FieldInsight, 'id'>>;
      };
      agent_memory: {
        Row: AgentMemory & {
          created_at: string;
        };
        Insert: Omit<AgentMemory, 'id'> & {
          created_at?: string;
        };
        Update: Partial<Omit<AgentMemory, 'id'>>;
      };
    };
  };
}
