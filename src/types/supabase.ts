
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          location?: string | null;
          farm_size?: number | null;
          farm_units?: string;
          preferred_language?: string;
        };
        Update: Partial<{
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          location?: string | null;
          farm_size?: number | null;
          farm_units?: string;
          preferred_language?: string;
        }>;
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string | null;
          total_size: number | null;
          size_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location?: string | null;
          total_size?: number | null;
          size_unit?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          name: string;
          location?: string | null;
          total_size?: number | null;
          size_unit?: string;
        }>;
      };
      fields: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string | null;
          name: string;
          size: number;
          size_unit: string;
          boundary: {
            type: 'polygon' | 'point';
            coordinates: { lat: number; lng: number }[];
          } | null;
          location_description: string | null;
          soil_type: string | null;
          irrigation_type: string | null;
          is_shared: boolean;
          shared_with: string[] | null; 
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          farm_id?: string | null;
          name: string;
          size?: number;
          size_unit?: string;
          boundary?: {
            type: 'polygon' | 'point';
            coordinates: { lat: number; lng: number }[];
          } | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
          is_shared?: boolean;
          shared_with?: string[] | null; 
        };
        Update: Partial<{
          id: string;
          user_id: string;
          farm_id?: string | null;
          name: string;
          size?: number;
          size_unit?: string;
          boundary?: {
            type: 'polygon' | 'point';
            coordinates: { lat: number; lng: number }[];
          } | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
          is_shared?: boolean;
          shared_with?: string[] | null;
        }>;
      };
      referrals: {
        Row: {
          id: string;
          inviter_id: string;
          invitee_contact: string;
          contact_type: string;
          status: string;
          created_at: string;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          inviter_id: string;
          invitee_contact: string;
          contact_type: string;
          status: string;
          created_at?: string;
          converted_at?: string | null;
        };
        Update: Partial<{
          id: string;
          inviter_id: string;
          invitee_contact: string;
          contact_type: string;
          status: string;
          created_at: string;
          converted_at: string | null;
        }>;
      };
      user_memory: {
        Row: {
          id: string;
          user_id: string;
          memory_data: Json;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          memory_data: Json;
          updated_at?: string;
          created_at?: string;
        };
        Update: Partial<{
          id?: string;
          user_id?: string;
          memory_data?: Json;
          updated_at?: string;
        }>;
      };
      weather_data: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          location: { lat: number; lng: number };
          location_name?: string | null;
          temperature?: number | null;
          humidity?: number | null;
          precipitation?: number | null;
          wind_speed?: number | null;
          wind_direction?: string | null;
          uv_index?: number | null;
          forecast?: {
            condition: string;
            rain_chance: number;
            soil_moisture: number;
            next_rain_hours: number;
            icon: string;
            alert: string | null;
          } | null;
          recorded_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          location: { lat: number; lng: number };
          location_name?: string | null;
          temperature?: number | null;
          humidity?: number | null;
          precipitation?: number | null;
          wind_speed?: number | null;
          wind_direction?: string | null;
          uv_index?: number | null;
          forecast?: {
            condition: string;
            rain_chance: number;
            soil_moisture: number;
            next_rain_hours: number;
            icon: string;
            alert: string | null;
          } | null;
          recorded_at: string;
        }>;
      };
    };
    Functions: {};
    Enums: {};
  };
};

// Re-export Profile type for backward compatibility
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type WeatherData = Database['public']['Tables']['weather_data']['Row'];

// Custom type for Field to be used throughout the app
export interface Field extends Database['public']['Tables']['fields']['Row'] {
  offline_id?: string;
  is_synced?: boolean;
  deleted?: boolean;
}

// Type for User Memory data structure
export interface UserMemory {
  id: string;
  user_id: string;
  memory_data: {
    farmerName: string | null;
    lastLogin: string | null;
    lastFieldCount: number;
    lastUsedFeature: string | null;
    recentCropsPlanted: string[] | null;
    preferredCrops: string[] | null;
    commonIssues: string[] | null;
    aiInteractions: number;
    scanCount: number;
    weatherChecks: number;
    marketChecks: number;
    taskCompletionRate: number;
    geniusScore: number;
    invitesSent: number;
    offlineSessions: number;
    proTrialEligible: boolean;
    proTrialUsed: boolean;
    proStatus: boolean;
    proExpirationDate: string | null;
  };
  updated_at: string;
  created_at: string;
}

// Type for AIInsightAlert
export interface AIInsightAlert {
  title: string;
  description: string;
  type: 'weather' | 'market' | 'pest' | 'fertilizer';
  actionText: string;
  actionPath: string;
}
