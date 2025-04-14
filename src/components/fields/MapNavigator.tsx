
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Undo, MapPin, Navigation, Trash2 } from "lucide-react";

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
  return (
    <div className="flex flex-col gap-1 bg-white/90 dark:bg-gray-900/90 p-1 rounded-md shadow-md">
      {isDrawing ? (
        <>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-2 py-1"
            onClick={onComplete}
            disabled={!hasPoints || hasPoints && hasPoints < 3}
          >
            <Save className="h-3 w-3 mr-1" />
            <span className="text-xs">Complete</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 py-1"
            onClick={onUndo}
            disabled={!hasPoints}
          >
            <Undo className="h-3 w-3 mr-1" />
            <span className="text-xs">Undo</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 py-1"
            onClick={onUseCurrentLocation}
          >
            <Navigation className="h-3 w-3 mr-1" />
            <span className="text-xs">Use My Location</span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 px-2 py-1"
            onClick={onReset}
            disabled={!hasPoints}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="default"
          className="h-8 px-2 py-1"
          onClick={onComplete}
        >
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-xs">Draw Field</span>
        </Button>
      )}
    </div>
  );
}
