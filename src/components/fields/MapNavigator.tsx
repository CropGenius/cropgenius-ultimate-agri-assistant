
import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Undo, Save, MapPin, Navigation } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface MapNavigatorProps {
  onComplete: () => void;
  onUndo: () => void;
  onUseCurrentLocation: () => void;
  onReset: () => void;
  isDrawing: boolean;
  hasPoints: boolean;
}

export default function MapNavigator({ 
  onComplete, 
  onUndo, 
  onUseCurrentLocation, 
  onReset,
  isDrawing,
  hasPoints
}: MapNavigatorProps) {
  const { logError } = useErrorLogging('MapNavigator');
  
  const handleAction = useCallback((action: string, handler: () => void) => {
    try {
      console.log(`🗺️ [MapNavigator] Action: ${action}`);
      handler();
    } catch (error: any) {
      logError(error, { context: `handler_${action}` });
    }
  }, [logError]);

  return (
    <div className="flex flex-col gap-2">
      {isDrawing ? (
        <>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-2"
            onClick={() => handleAction('complete', onComplete)}
            disabled={!hasPoints}
            title="Complete the field boundary"
          >
            <Save className="h-4 w-4 mr-1" />
            <span className="text-xs">Complete</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => handleAction('undo', onUndo)}
            disabled={!hasPoints}
            title="Remove last point"
          >
            <Undo className="h-4 w-4 mr-1" />
            <span className="text-xs">Undo</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => handleAction('useLocation', onUseCurrentLocation)}
            title="Add your current location"
          >
            <Navigation className="h-4 w-4 mr-1" />
            <span className="text-xs">Use My Location</span>
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="default"
          className="h-8 px-2"
          onClick={() => handleAction('startDrawing', onComplete)}
          title="Start drawing field boundary"
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-xs">Draw Field</span>
        </Button>
      )}
    </div>
  );
}
