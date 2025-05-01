
import { Coordinates, Boundary, Field, Farm } from "@/types/field";

export interface FieldFormProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: Coordinates;
  farms?: Farm[];
}

export interface MapboxFieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  onLocationChange?: (location: Coordinates) => void;
  readOnly?: boolean;
  defaultLocation?: Coordinates;
}

export interface MapSearchInputProps {
  onSearch: (searchTerm: string) => void;
  onLocationSelect?: (location: Coordinates) => void;
  isSearching: boolean;
  className?: string;
}

export interface MapNavigatorProps {
  onComplete: (startPoint?: [number, number]) => void;
  onUndo: () => void;
  onUseCurrentLocation: () => void;
  onReset: () => void;
  isDrawing: boolean;
  hasPoints: boolean;
}

export interface FieldConfirmationCardProps {
  locationName: string;
  coordinates: Coordinates[];
  area: number;
  areaUnit?: string;
}

export interface SmartFieldRecommenderProps {
  coordinates: Coordinates[];
  locationName: string;
  area: number;
  onClose: () => void;
  onGetTips: () => void;
}

export interface ProEligibilityCheckProps {
  children: React.ReactNode;
  featureType?: string;
  triggerType?: 'weather' | 'scan' | 'predict' | 'market' | 'plan';
  forceShow?: boolean;
}

export interface GeniusGrowProps {
  fieldId: string;
}

// Add the missing FieldSelectCallback type
export type FieldSelectCallback = (field: Field) => void;
