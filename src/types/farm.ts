export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  size: number | null;
  size_unit: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmWithStats extends Farm {
  fields_count?: number;
  health_score?: number;
  last_activity?: string;
}

export interface CreateFarmData {
  name: string;
  location?: string;
  size?: number;
  size_unit?: string;
  description?: string;
}

export interface UpdateFarmData extends Partial<CreateFarmData> {
  id: string;
}