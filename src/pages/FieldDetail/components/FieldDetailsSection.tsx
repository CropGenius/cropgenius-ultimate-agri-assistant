import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Droplets, Tractor } from 'lucide-react';
import { Field } from '@/types/field';

interface FieldDetailsSectionProps {
  field: Field;
}

export function FieldDetailsSection({ field }: FieldDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Location
          </div>
          <div className="text-sm">{field.location || 'Not specified'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Last Planted
          </div>
          <div className="text-sm">
            {field.lastPlantedAt
              ? new Date(field.lastPlantedAt).toLocaleDateString()
              : 'Not available'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <Droplets className="mr-2 h-4 w-4" />
            Irrigation
          </div>
          <div className="text-sm capitalize">
            {field.irrigationType || 'Not specified'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <Tractor className="mr-2 h-4 w-4" />
            Size
          </div>
          <div className="text-sm">
            {field.area ? `${field.area} hectares` : 'Not specified'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
