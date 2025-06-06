export type HistoryEvent = {
  id: string;
  date: string;
  action: string;
  type:
    | 'planting'
    | 'harvest'
    | 'irrigation'
    | 'fertilization'
    | 'pest_control'
    | 'weather'
    | 'other';
  details?: Record<string, any>;
  userId?: string;
  userName?: string;
}; 