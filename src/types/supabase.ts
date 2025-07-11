// Placeholder Database type to unblock compilation due to Supabase CLI issues.
export type Database = {
  public: {
    Tables: {
      fields: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          farm_id: string;
          user_id: string;
          size?: number | null;
          size_unit?: string | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
          boundary?: any | null;
          crop_type?: string | null;
          season?: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          farm_id: string;
          user_id: string;
          size?: number | null;
          size_unit?: string | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
          boundary?: any | null;
          crop_type?: string | null;
          season?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          farm_id?: string;
          user_id?: string;
          size?: number | null;
          size_unit?: string | null;
          location_description?: string | null;
          soil_type?: string | null;
          irrigation_type?: string | null;
          boundary?: any | null;
          crop_type?: string | null;
          season?: string | null;
        };
      },
      tasks: {
        Row: {
          id: string
          user_id: string
          field_id: string | null
          title: string
          description: string | null
          status: "pending" | "in_progress" | "completed"
          priority: "low" | "medium" | "high"
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          field_id?: string | null
          title: string
          description?: string | null
          status?: "pending" | "in_progress" | "completed"
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          field_id?: string | null
          title?: string
          description?: string | null
          status?: "pending" | "in_progress" | "completed"
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_field_id_fkey"
            columns: ["field_id"]
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      // Add other tables as needed to unblock compilation
      weather_data: {
        Row: any;
        Insert: any;
        Update: any;
      },
      scans: {
        Row: {
          id: string
          user_id: string
          field_id: string | null
          crop: string
          disease: string
          confidence: number
          severity: string
          status: string
          economic_impact: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          field_id?: string | null
          crop: string
          disease: string
          confidence: number
          severity: string
          status: string
          economic_impact: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          field_id?: string | null
          crop?: string
          disease?: string
          confidence?: number
          severity?: string
          status?: string
          economic_impact?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_field_id_fkey"
            columns: ["field_id"]
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      };
    };
    Enums: {
      [key: string]: string | string[];
    };
    Functions: {
      [key: string]: any;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

