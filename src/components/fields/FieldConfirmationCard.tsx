
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin } from 'lucide-react';
import { Coordinates } from '@/types/field';

interface FieldConfirmationCardProps {
  locationName: string;
  coordinates: Coordinates[];
  area: number;
  areaUnit: string;
}

export default function FieldConfirmationCard({
  locationName,
  coordinates,
  area,
  areaUnit
}: FieldConfirmationCardProps) {
  // Get appropriate emoji based on field size
  const getEmoji = () => {
    if (areaUnit === 'hectares') {
      if (area > 10) return '🚜'; // Large farm
      if (area > 2) return '🌱'; // Medium farm
      return '🌾'; // Small farm
    } else {
      if (area > 25) return '🚜'; // Large farm in acres
      if (area > 5) return '🌱'; // Medium farm in acres
      return '🌾'; // Small farm in acres
    }
  };

  return (
    <Card className="w-full bg-primary/10 shadow-sm border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 rounded-full p-1">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="text-sm font-medium">{locationName}</span>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span>{getEmoji()} {area.toFixed(2)} {areaUnit} mapped successfully</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
