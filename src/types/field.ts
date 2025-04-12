export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Boundary {
  type: 'polygon' | 'point';
  coordinates: Coordinates[];
}

export interface Field {
  id: string;
  user_id: string;
  farm_id: string | null;
  name: string;
  size: number;
  size_unit: string;
  boundary: Boundary | null;
  location_description: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string;
  updated_at: string;
  offline_id?: string; // For offline-first functionality
  is_synced?: boolean; // Track sync status
  is_shared?: boolean; // For co-op/shared management
  shared_with?: string[]; // User IDs the field is shared with
}

export interface FieldCrop {
  id: string;
  field_id: string;
  crop_name: string;
  variety: string | null;
  planting_date: string | null;
  harvest_date: string | null;
  yield_amount: number | null;
  yield_unit: string | null;
  notes: string | null;
  created_at: string;
  status: 'active' | 'harvested' | 'failed';
  offline_id?: string;
  is_synced?: boolean;
}

export interface FieldHistory {
  id: string;
  field_id: string;
  event_type: 'planting' | 'harvest' | 'treatment' | 'inspection' | 'other';
  description: string;
  date: string;
  notes: string | null;
  created_at: string;
  created_by: string;
  offline_id?: string;
  is_synced?: boolean;
}

export interface SoilType {
  id: string;
  name: string;
  description: string | null;
  properties: {
    texture?: string;
    ph_level?: number;
    organic_matter?: number;
    drainage?: string;
  } | null;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  total_size: number | null;
  size_unit: string;
  created_at: string;
  updated_at: string;
  offline_id?: string;
  is_synced?: boolean;
}
