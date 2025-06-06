import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MapboxFieldMap from '@/components/fields/MapboxFieldMap';
import MapSearchInput from '@/components/fields/MapSearchInput';
import { Boundary, Coordinates } from '@/types/field';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { isOnline } from '@/core/network/isOnline';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface FieldMapperStepProps {
  defaultLocation?: Coordinates;
  onNext: (data: {
    boundary: Boundary;
    location: Coordinates;
    name?: string;
  }) => void;
  onBack: () => void;
  onSkip: () => void;
  initialBoundary?: Boundary | null;
  initialName?: string;
}

export default function FieldMapperStep({
  defaultLocation,
  onNext,
  onBack,
  onSkip,
  initialBoundary = null,
  initialName = '',
}: FieldMapperStepProps) {
  const { logError, trackOperation } = useErrorLogging('FieldMapperStep');
  const [fieldName, setFieldName] = useState(initialName);
  const [boundary, setBoundary] = useState<Boundary | null>(initialBoundary);
  const [location, setLocation] = useState<Coordinates | null>(
    defaultLocation || null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleMapLocation = useCallback((loc: Coordinates) => {
    setLocation(loc);
  }, []);

  const handleBoundaryChange = useCallback((newBoundary: Boundary) => {
    setBoundary(newBoundary);
    setIsDrawing(false);
  }, []);

  const handleContinue = async () => {
    try {
      if (!boundary || boundary.coordinates.length < 3) {
        toast.warning('Complete your field boundary', {
          description: 'Draw at least 3 points to create a field',
        });
        return;
      }

      if (!location) {
        toast.warning('Missing location', {
          description: 'Please locate your field on the map first',
        });
        return;
      }

      // Auto-generate field name if not provided
      let processedName = fieldName.trim();
      if (!processedName) {
        processedName = `Field ${new Date().toLocaleDateString()}`;
      }

      // Proceed to next step with data
      onNext({
        boundary,
        location,
        name: processedName,
      });
    } catch (error) {
      logError('handleContinue', error);
      toast.error('Something went wrong');
    }
  };

  // Create a wrapped version for trackOperation
  const trackedHandleContinue = trackOperation(
    'continueWithField',
    handleContinue
  );

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Map Your Field</h2>
        <p className="text-center text-muted-foreground text-sm">
          Draw your field boundaries on the map
        </p>

        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="h-[350px] md:h-[450px] lg:h-[500px] w-full relative">
              <MapboxFieldMap
                onBoundaryChange={handleBoundaryChange}
                onLocationChange={handleMapLocation}
                initialBoundary={boundary}
                defaultLocation={location || undefined}
                readOnly={false}
              />

              {!isOnlineStatus && (
                <div className="absolute bottom-3 left-3 right-3 bg-background/90 text-xs p-2 rounded">
                  ⚠️ You're currently offline. Your field will be saved locally
                  and synced when you're back online.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="fieldName"
              className="block text-sm font-medium mb-1"
            >
              Field Name
            </label>
            <Input
              id="fieldName"
              placeholder="Enter a name for your field"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onBack} type="button">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button variant="outline" onClick={onSkip} type="button">
              Skip
            </Button>
            <Button onClick={trackedHandleContinue} type="button">
              {boundary?.coordinates.length >= 3 ? 'Continue' : 'Draw Field'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {boundary && boundary.coordinates.length >= 3 && (
          <div className="text-center text-xs text-muted-foreground mt-2">
            <MapPin className="inline-block h-3 w-3 mr-1" />
            Field boundary mapped with {boundary.coordinates.length} points
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
