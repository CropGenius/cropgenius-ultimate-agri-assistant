
import React, { useEffect, useRef, useState } from "react";
import { Coordinates, Boundary } from "@/types/field";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Undo, MapPin, Navigation } from "lucide-react";

// This is a placeholder until we can integrate a real mapping library
interface FieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  readOnly?: boolean;
}

export default function FieldMap({ 
  initialBoundary, 
  onBoundaryChange,
  readOnly = false
}: FieldMapProps) {
  const [boundary, setBoundary] = useState<Boundary | null>(initialBoundary || null);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 300, height: 300 });
  
  // Update map dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainerRef.current) {
        setMapDimensions({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Initialize with user's location if available
  useEffect(() => {
    if (navigator.geolocation && !initialBoundary && !readOnly) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Center the map on user's location
          // In a real implementation, this would use a mapping library
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set a default location (e.g., center of the country)
          setUserLocation({ lat: 9.082, lng: 8.675 }); // Default to Nigeria center
        }
      );
    }
  }, [initialBoundary, readOnly]);
  
  // Draw the map and boundaries
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = mapDimensions.width;
    canvas.height = mapDimensions.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a placeholder map background
    ctx.fillStyle = '#e5f5e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#a8ddb5';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw boundary polygon if coordinates exist
    if (coordinates.length > 0) {
      ctx.beginPath();
      
      // Convert GPS coordinates to canvas coordinates (simplified)
      // In a real implementation, this would use map projection
      const points = coordinates.map(coord => {
        // This is a placeholder transformation
        // In reality, you'd use proper map projections
        const x = (coord.lng % 0.1) * 3000 % canvas.width;
        const y = (coord.lat % 0.1) * 3000 % canvas.height;
        return { x, y };
      });
      
      // Draw the polygon
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (points.length > 2) {
          ctx.closePath();
        }
      }
      
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.fill();
      
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#2196F3' : '#FF5722';
        ctx.fill();
      });
    }
    
    // Draw user location marker if available
    if (userLocation) {
      // Convert GPS to canvas coordinates (simplified)
      const x = (userLocation.lng % 0.1) * 3000 % canvas.width;
      const y = (userLocation.lat % 0.1) * 3000 % canvas.height;
      
      // Draw location marker
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#2196F3';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [coordinates, mapDimensions, userLocation]);
  
  // Handle canvas click for adding points
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get click position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert canvas coordinates to GPS (simplified)
    // In a real implementation, this would use map projection
    const lng = (x / 3000) + 0.05;
    const lat = (y / 3000) + 0.05;
    
    // Add point to boundary
    const newCoordinates = [...coordinates, { lat, lng }];
    setCoordinates(newCoordinates);
    
    // Update boundary and notify parent
    const newBoundary: Boundary = {
      type: 'polygon',
      coordinates: newCoordinates
    };
    
    setBoundary(newBoundary);
    
    if (onBoundaryChange) {
      onBoundaryChange(newBoundary);
    }
  };
  
  // Reset the boundary
  const handleReset = () => {
    setCoordinates([]);
    setBoundary(null);
    
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates: []
      });
    }
  };
  
  // Remove the last added point
  const handleUndo = () => {
    if (coordinates.length === 0) return;
    
    const newCoordinates = coordinates.slice(0, -1);
    setCoordinates(newCoordinates);
    
    const newBoundary: Boundary = {
      type: 'polygon',
      coordinates: newCoordinates
    };
    
    setBoundary(newBoundary);
    
    if (onBoundaryChange) {
      onBoundaryChange(newBoundary);
    }
  };
  
  // Complete the polygon by connecting to the first point
  const handleComplete = () => {
    if (coordinates.length < 3) {
      // Need at least 3 points to form a polygon
      return;
    }
    
    setIsDrawing(false);
    
    // Ensure the polygon is closed
    const newBoundary: Boundary = {
      type: 'polygon',
      coordinates: coordinates
    };
    
    setBoundary(newBoundary);
    
    if (onBoundaryChange) {
      onBoundaryChange(newBoundary);
    }
  };
  
  // Start drawing mode
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCoordinates([]);
    setBoundary(null);
    
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates: []
      });
    }
  };
  
  // Use current location as a point
  const handleUseCurrentLocation = () => {
    if (!userLocation || !isDrawing) return;
    
    const newCoordinates = [...coordinates, userLocation];
    setCoordinates(newCoordinates);
    
    const newBoundary: Boundary = {
      type: 'polygon',
      coordinates: newCoordinates
    };
    
    setBoundary(newBoundary);
    
    if (onBoundaryChange) {
      onBoundaryChange(newBoundary);
    }
  };

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      {readOnly ? (
        <div className="absolute top-2 left-2 bg-background/90 p-1 px-2 rounded text-xs">
          Read Only Map
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          {isDrawing ? (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-8 px-2 py-1"
                onClick={handleComplete}
                disabled={coordinates.length < 3}
              >
                <Save className="h-3 w-3 mr-1" />
                <span className="text-xs">Complete</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 py-1"
                onClick={handleUndo}
                disabled={coordinates.length === 0}
              >
                <Undo className="h-3 w-3 mr-1" />
                <span className="text-xs">Undo</span>
              </Button>
              {userLocation && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 py-1"
                  onClick={handleUseCurrentLocation}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  <span className="text-xs">Use My Location</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-2 py-1"
                onClick={handleReset}
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
              onClick={handleStartDrawing}
            >
              <MapPin className="h-3 w-3 mr-1" />
              <span className="text-xs">Draw Field</span>
            </Button>
          )}
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`w-full h-full ${!readOnly && isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
      />
      
      {/* Instructions */}
      {isDrawing && !readOnly && (
        <div className="absolute bottom-2 left-2 bg-background/90 p-1 px-2 rounded text-xs">
          Click on map to add points ({coordinates.length} points added)
        </div>
      )}
    </div>
  );
}
