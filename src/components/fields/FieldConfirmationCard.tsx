import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler } from 'lucide-react';
import { Coordinates } from '@/types/field';
import { cn } from '@/lib/utils';

interface FieldConfirmationCardProps {
  locationName: string;
  coordinates: Coordinates[];
  area: number;
  areaUnit: string;
  className?: string;
}

export default function FieldConfirmationCard({
  locationName,
  coordinates,
  area,
  areaUnit,
  className,
}: FieldConfirmationCardProps) {
  // Convert between hectares and acres
  const convertArea = () => {
    if (areaUnit === 'hectares') {
      return {
        value: (area * 2.47105).toFixed(2),
        unit: 'acres',
      };
    } else {
      return {
        value: (area * 0.404686).toFixed(2),
        unit: 'hectares',
      };
    }
  };

  const alternateArea = convertArea();

  return (
    <Card
      className={cn('bg-white/95 dark:bg-gray-900/95 shadow-md', className)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{locationName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {area.toFixed(2)} {areaUnit} ({alternateArea.value}{' '}
              {alternateArea.unit})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
