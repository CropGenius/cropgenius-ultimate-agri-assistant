import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FieldCrop } from '@/types/field';
import { Leaf, PlusCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface CropsSectionProps {
  crops: FieldCrop[];
  isLoading?: boolean;
  error?: Error | null;
  fieldId?: string;
  showAll?: boolean;
}

export function CropsSection({
  crops = [],
  isLoading = false,
  error = null,
  fieldId,
  showAll = false,
}: CropsSectionProps) {
  const navigate = useNavigate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading crops</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to load crop data. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (crops.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Leaf className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No crops found
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by adding a new crop to this field.
        </p>
        {fieldId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/fields/${fieldId}/crops/new`)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Crop
          </Button>
        )}
      </div>
    );
  }

  // Filter to show only active crops by default unless showAll is true
  const displayCrops = showAll
    ? crops
    : crops.filter((crop) => crop.status === 'active');

  return (
    <div className="space-y-6">
      {!showAll && crops.length > 3 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/fields/${fieldId}/crops`)}
          >
            View all crops ({crops.length})
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCrops.map((crop) => (
          <Card
            key={crop.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium capitalize">
                    {crop.cropType || 'Unspecified Crop'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Planted on{' '}
                    {format(new Date(crop.plantingDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={
                    crop.status === 'active'
                      ? 'default'
                      : crop.status === 'harvested'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="capitalize"
                >
                  {crop.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                {crop.variety && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Variety:</span>
                    <span className="font-medium text-right">
                      {crop.variety}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">
                    {crop.area ? `${crop.area} ha` : 'N/A'}
                  </span>
                </div>

                {crop.expectedHarvestDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harvest:</span>
                    <span className="font-medium">
                      {format(
                        new Date(crop.expectedHarvestDate),
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>
                )}

                {crop.yieldAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-medium">
                      {crop.yieldAmount} {crop.yieldUnit || 'kg'}
                    </span>
                  </div>
                )}
              </div>

              {crop.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {crop.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(`/fields/${fieldId}/crops/${crop.id}`)
                  }
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {fieldId && displayCrops.length === 0 && crops.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No active crops. All crops have been harvested or archived.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/fields/${fieldId}/crops/new`)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Crop
          </Button>
        </div>
      )}
    </div>
  );
}
