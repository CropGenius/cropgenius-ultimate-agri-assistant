export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      farms: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          size_unit: string | null
          total_size: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          size_unit?: string | null
          total_size?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          size_unit?: string | null
          total_size?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      field_crops: {
        Row: {
          created_at: string | null
          crop_name: string
          field_id: string
          harvest_date: string | null
          id: string
          notes: string | null
          planting_date: string | null
          status: string | null
          variety: string | null
          yield_amount: number | null
          yield_unit: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          field_id: string
          harvest_date?: string | null
          id?: string
          notes?: string | null
          planting_date?: string | null
          status?: string | null
          variety?: string | null
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          field_id?: string
          harvest_date?: string | null
          id?: string
          notes?: string | null
          planting_date?: string | null
          status?: string | null
          variety?: string | null
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_crops_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      field_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          event_type: string
          field_id: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          event_type: string
          field_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          event_type?: string
          field_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_history_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      field_tasks: {
        Row: {
          ai_recommended: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          field_id: string
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          ai_recommended?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          field_id: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          ai_recommended?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          field_id?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_tasks_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          boundary: Json | null
          created_at: string | null
          farm_id: string
          id: string
          irrigation_type: string | null
          is_shared: boolean | null
          location_description: string | null
          name: string
          shared_with: Json | null
          size: number | null
          size_unit: string | null
          soil_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          boundary?: Json | null
          created_at?: string | null
          farm_id: string
          id?: string
          irrigation_type?: string | null
          is_shared?: boolean | null
          location_description?: string | null
          name: string
          shared_with?: Json | null
          size?: number | null
          size_unit?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          boundary?: Json | null
          created_at?: string | null
          farm_id?: string
          id?: string
          irrigation_type?: string | null
          is_shared?: boolean | null
          location_description?: string | null
          name?: string
          shared_with?: Json | null
          size?: number | null
          size_unit?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fields_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          farm_size: number | null
          farm_units: string | null
          full_name: string | null
          id: string
          location: string | null
          phone_number: string | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          farm_size?: number | null
          farm_units?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          farm_size?: number | null
          farm_units?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      soil_types: {
        Row: {
          description: string | null
          id: string
          name: string
          properties: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          properties?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          properties?: Json | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          forecast: Json | null
          humidity: number | null
          id: string
          location: Json
          location_name: string | null
          precipitation: number | null
          recorded_at: string | null
          temperature: number | null
          user_id: string
          uv_index: number | null
          wind_direction: string | null
          wind_speed: number | null
        }
        Insert: {
          forecast?: Json | null
          humidity?: number | null
          id?: string
          location: Json
          location_name?: string | null
          precipitation?: number | null
          recorded_at?: string | null
          temperature?: number | null
          user_id: string
          uv_index?: number | null
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Update: {
          forecast?: Json | null
          humidity?: number | null
          id?: string
          location?: Json
          location_name?: string | null
          precipitation?: number | null
          recorded_at?: string | null
          temperature?: number | null
          user_id?: string
          uv_index?: number | null
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
