export type TaskPriority = 'urgent' | 'important' | 'routine';

export interface Task {
  estimated_roi: number;
  roi_currency: string;
  id: string;
  user_id: string;
  farm_id?: string;
  title: string;
  description?: string;
  type: 'planting' | 'irrigation' | 'pest_control' | 'harvesting' | 'soil_testing' | 'other';
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  source: 'user_created' | 'ai_generated' | 'template';
  recommendation_details?: {
    weather_icon?: string;
    weather_summary?: string;
    market_impact?: string;
  };
}
