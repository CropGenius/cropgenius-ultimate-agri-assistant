export type Tables = {
  profiles: {
    Row: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
      created_at: string;
    };
    Insert: {
      id: string;
      email: string;
      full_name?: string | null;
      avatar_url?: string | null;
    };
    Update: {
      id?: string;
      email?: string;
      full_name?: string | null;
      avatar_url?: string | null;
    };
  };
  chat_history: {
    Row: {
      id: string;
      user_id: string;
      message: string;
      response: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      message: string;
      response: string;
      created_at?: string;
    };
    Update: {
      user_id?: string;
      message?: string;
      response?: string;
      created_at?: string;
    };
  };
  weather_data: {
    Row: {
      id: string;
      location: string;
      temperature: number;
      humidity: number;
      wind_speed: number;
      created_at: string;
    };
    Insert: {
      location: string;
      temperature: number;
      humidity: number;
      wind_speed: number;
      created_at?: string;
    };
    Update: {
      location?: string;
      temperature?: number;
      humidity?: number;
      wind_speed?: number;
      created_at?: string;
    };
  };
  // Add other tables as needed
};

export type Database = {
  public: {
    Tables: Tables;
    Enums: {};
  };
};