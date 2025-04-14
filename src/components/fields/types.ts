
import { Field } from '@/types/field';

export interface FieldSelectCallback {
  (field: Field): void;
}

export interface FieldFormProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: { lat: number; lng: number };
  farms?: any[];
}
