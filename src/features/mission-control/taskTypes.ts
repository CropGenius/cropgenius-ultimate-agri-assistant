// Priority as defined in the new schema: 1: High, 2: Medium, 3: Low
// We can map this to string representations in the UI if needed.
export type TaskPriority = 1 | 2 | 3;
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string; // UUID
  title: string;
  description?: string | null;
  field_id: string; // UUID, Foreign Key to fields table
  assigned_to?: string | null; // UUID, Foreign Key to auth.users table
  due_date?: string | null; // TIMESTAMPTZ
  status: TaskStatus;
  priority: TaskPriority;
  created_by?: string | null; // UUID, Foreign Key to auth.users table
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  // Fields removed: user_id (implicit via field/farm or created_by), farm_id, type (specific enum),
  // completed_at (replaced by status), source, estimated_roi, roi_currency, recommendation_details
}

// Helper function to map schema integer priority to string for display (optional)
export const mapPriorityToDisplay = (priority: TaskPriority): string => {
  switch (priority) {
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Low';
    default: return 'Unknown';
  }
};

export const mapDisplayPriorityToInteger = (priority: string): TaskPriority => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent': // Assuming urgent maps to high
      return 1;
    case 'medium':
    case 'important': // Assuming important maps to medium
      return 2;
    case 'low':
    case 'routine': // Assuming routine maps to low
      return 3;
    default:
      return 2; // Default to medium
  }
}
