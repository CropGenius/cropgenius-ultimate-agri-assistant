// 🚀 FARM TYPES - Generated from Supabase Schema Analysis
export interface Farm {
  id: string;
  name: string;
  description?: string;
  size?: number;
  size_unit: 'hectares' | 'acres';
  location?: string; // 'lat,lng' format
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  fields_count?: number;
  total_area?: number;
  active_crops?: string[];
}

export interface FarmWithFields extends Farm {
  fields: Field[];
}

export interface FarmFormData {
  name: string;
  description?: string;
  size?: number;
  size_unit: 'hectares' | 'acres';
  location?: string;
}

export interface FarmStats {
  total_farms: number;
  total_area: number;
  total_fields: number;
  active_crops: number;
}

// Re-export Field from existing types
export type { Field } from './field';