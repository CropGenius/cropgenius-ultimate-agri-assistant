export interface Task {
  id: string;
  user_id: string;
  farm_id?: string;
  title: string;
  description?: string;
  type: 'water' | 'harvest' | 'market' | 'alert';
  due_date?: string; // ISO
  urgent?: boolean;
  completed_at?: string;
  created_at?: string;
}
