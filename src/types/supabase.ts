import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type WeatherData = Tables<'weather_data'>;

export interface EnhancedSupabaseClient {
  channel: any; // Replace 'any' with proper type if available
  removeChannel: (channel: any) => void; // Replace 'any' with proper type if available
  // Add other Supabase client methods as needed
}
