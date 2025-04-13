
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Undo, MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "sonner";
import * as MapboxClient from "@mapbox/mapbox-sdk";
import * as MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

// Temporary access token - will be moved to Supabase Edge Function secrets
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiY3JvcGdlbml1cyIsImEiOiJjbHQ1aWl0Zm8wcmd2MmptcXBvY2V5YWp2In0.HlnQI4Uy4R79P3QFKlKk4A";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapboxFieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  readOnly?: boolean;
  defaultLocation?: Coordinates;
}

export default function MapboxFieldMap({
  initialBoundary,
  onBoundaryChange,
  readOnly = false,
  defaultLocation
}: MapboxFieldMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const geocodingClient = useRef<MapboxGeocoding.GeocodeService | null>(null);
  const drawMarkers = useRef<mapboxgl.Marker[]>([]);
  const areaPolygon = useRef<mapboxgl.Polygon | null>(null);
  const flyToLocation = useRef<(lng: number, lat: number, zoom: number) => void>();

  // Initialize geocoding client
  useEffect(() => {
    const baseClient = MapboxClient({ accessToken: MAPBOX_ACCESS_TOKEN });
    geocodingClient.current = MapboxGeocoding(baseClient);
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    // Default center - can be Africa-centered coordinates
    const defaultCenter: [number, number] = defaultLocation 
      ? [defaultLocation.lng, defaultLocation.lat]
      : [20, 5]; // Center of Africa

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // Satellite imagery with streets
      center: defaultCenter,
      zoom: 4,
      attributionControl: false,
    });

    // Add navigation controls
    mapInstance.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add scale control
    mapInstance.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 150,
        unit: "metric",
      }),
      "bottom-left"
    );

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    mapInstance.addControl(geolocateControl, "top-right");

    // Define the flyToLocation function
    flyToLocation.current = (lng: number, lat: number, zoom: number = 14) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          essential: true,
          zoom: zoom,
          duration: 2000,
          pitch: 60,
          bearing: Math.random() * 180 - 90, // Random bearing for dynamic feel
        });
      }
    };

    // Handle map load event
    mapInstance.on("load", () => {
      setMapLoaded(true);

      // Add source for field polygon if coordinates exist
      if (coordinates.length > 2) {
        drawFieldPolygon(mapInstance, coordinates);
        
        // Fit to coordinates bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord) => {
          bounds.extend([coord.lng, coord.lat]);
        });
        
        mapInstance.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        });
      }
    });

    // Save map instance to ref
    map.current = mapInstance;

    // Cleanup function
    return () => {
      drawMarkers.current.forEach(marker => marker.remove());
      mapInstance.remove();
    };
  }, [defaultLocation]);

  // Handle search submission
  const handleSearch = async () => {
    if (!searchInput.trim() || !geocodingClient.current) return;

    setIsSearching(true);
    try {
      const response = await geocodingClient.current
        .forwardGeocode({
          query: searchInput,
          limit: 1,
          countries: ["ng", "gh", "ke", "za", "et", "tz", "ug", "rw"], // Limit to African countries
        })
        .send();

      const features = response.body.features;
      if (features && features.length > 0) {
        const [lng, lat] = features[0].center;
        const placeName = features[0].place_name;
        
        toast.success("Location found!", { description: placeName });
        
        // Fly to location with animation
        if (flyToLocation.current) {
          flyToLocation.current(lng, lat, 15);
        }
        
        // Check if the location has polygon data (not typically available with geocoding)
        // If not, we'll just drop a pin
        if (map.current) {
          // Clear existing markers
          drawMarkers.current.forEach(marker => marker.remove());
          drawMarkers.current = [];
          
          // Add a marker at the found location
          const newMarker = new mapboxgl.Marker({ color: "#4CAF50" })
            .setLngLat([lng, lat])
            .addTo(map.current);
            
          drawMarkers.current.push(newMarker);
          
          // Generate a simple field boundary around the point (placeholder)
          if (!readOnly && !isDrawing) {
            // Suggest to start drawing from this point
            toast.info("Location selected", {
              description: "Click 'Draw Field' to map your field boundaries",
              action: {
                label: "Draw Now",
                onClick: () => handleStartDrawing([lng, lat])
              }
            });
          }
        }
      } else {
        toast.warning("No location found", { description: "Try a different search term" });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Search failed", { description: "Please check your connection and try again" });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search input and results
  const handleClearSearch = () => {
    setSearchInput("");
  };

  // Draw field polygon on the map
  const drawFieldPolygon = (mapInstance: mapboxgl.Map, fieldCoords: Coordinates[]) => {
    // Remove existing polygon if any
    if (mapInstance.getSource('field-polygon')) {
      mapInstance.removeLayer('field-polygon-fill');
      mapInstance.removeLayer('field-polygon-outline');
      mapInstance.removeSource('field-polygon');
    }
    
    // Convert coordinates to GeoJSON format
    const geojsonCoords = fieldCoords.map(coord => [coord.lng, coord.lat]);
    
    // Add source for the polygon
    mapInstance.addSource('field-polygon', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            // Close the polygon by repeating the first point
            [...geojsonCoords, geojsonCoords[0]]
          ]
        }
      }
    });
    
    // Add fill layer for the polygon
    mapInstance.addLayer({
      id: 'field-polygon-fill',
      type: 'fill',
      source: 'field-polygon',
      layout: {},
      paint: {
        'fill-color': '#4CAF50',
        'fill-opacity': 0.3
      }
    });
    
    // Add outline layer for the polygon
    mapInstance.addLayer({
      id: 'field-polygon-outline',
      type: 'line',
      source: 'field-polygon',
      layout: {},
      paint: {
        'line-color': '#4CAF50',
        'line-width': 2
      }
    });
  };

  // Handle starting the drawing mode
  const handleStartDrawing = (startPoint?: [number, number]) => {
    if (!map.current || readOnly) return;
    
    setIsDrawing(true);
    setCoordinates([]);
    
    // Clear existing markers
    drawMarkers.current.forEach(marker => marker.remove());
    drawMarkers.current = [];
    
    // If we have a starting point, add it automatically
    if (startPoint) {
      const [lng, lat] = startPoint;
      addPoint(lng, lat);
    }
    
    toast.info("Drawing mode activated", {
      description: "Click on the map to add points to your field boundary"
    });
  };

  // Add a point to the field boundary
  const addPoint = (lng: number, lat: number) => {
    if (!map.current || !isDrawing || readOnly) return;
    
    const newCoords = [...coordinates, { lng, lat }];
    setCoordinates(newCoords);
    
    // Add a marker for the point
    const marker = new mapboxgl.Marker({ color: "#FF5722" })
      .setLngLat([lng, lat])
      .addTo(map.current);
    
    drawMarkers.current.push(marker);
    
    // If we have at least 3 points, draw the polygon
    if (newCoords.length >= 3) {
      drawFieldPolygon(map.current, newCoords);
    }
    
    // Notify parent component
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates: newCoords
      });
    }
  };

  // Handle map click for adding points
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || readOnly) return;
    
    const { lng, lat } = e.lngLat;
    addPoint(lng, lat);
  };

  // Complete the drawing
  const handleComplete = () => {
    if (coordinates.length < 3) {
      toast.warning("Need more points", { 
        description: "Add at least 3 points to create a field boundary" 
      });
      return;
    }
    
    setIsDrawing(false);
    
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates
      });
    }
    
    toast.success("Field boundary completed", { 
      description: `Field mapped with ${coordinates.length} points` 
    });
  };

  // Remove the last point
  const handleUndo = () => {
    if (coordinates.length === 0) return;
    
    const newCoords = coordinates.slice(0, -1);
    setCoordinates(newCoords);
    
    // Remove the last marker
    if (drawMarkers.current.length > 0) {
      const marker = drawMarkers.current.pop();
      if (marker) marker.remove();
    }
    
    // Redraw polygon
    if (map.current) {
      if (newCoords.length >= 3) {
        drawFieldPolygon(map.current, newCoords);
      } else if (map.current.getSource('field-polygon')) {
        map.current.removeLayer('field-polygon-fill');
        map.current.removeLayer('field-polygon-outline');
        map.current.removeSource('field-polygon');
      }
    }
    
    // Notify parent component
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates: newCoords
      });
    }
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!map.current) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Fly to user location
        if (flyToLocation.current) {
          flyToLocation.current(longitude, latitude, 17);
        }
        
        if (isDrawing) {
          // Add point to field boundary
          addPoint(longitude, latitude);
          toast.success("Added current location", {
            description: "Your current position has been added to the field boundary"
          });
        } else {
          // Just center the map on user location
          toast.success("Located", {
            description: "Map centered on your current position"
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location error", {
          description: "Could not access your location. Please check permissions."
        });
      }
    );
  };

  // Reset the field boundary
  const handleReset = () => {
    if (!map.current) return;
    
    setCoordinates([]);
    
    // Clear markers
    drawMarkers.current.forEach(marker => marker.remove());
    drawMarkers.current = [];
    
    // Clear polygon
    if (map.current.getSource('field-polygon')) {
      map.current.removeLayer('field-polygon-fill');
      map.current.removeLayer('field-polygon-outline');
      map.current.removeSource('field-polygon');
    }
    
    // Notify parent component
    if (onBoundaryChange) {
      onBoundaryChange({
        type: 'polygon',
        coordinates: []
      });
    }
    
    toast.info("Cleared", { description: "Field boundary has been reset" });
  };

  // Calculate area of the polygon in hectares
  const calculateArea = (coords: Coordinates[]): number => {
    if (coords.length < 3) return 0;
    
    // Use turf.js or another geospatial library for accurate calculations
    // This is a simplified implementation using the Shoelace formula
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to hectares (approximate conversion)
    // This simplified calculation needs to be replaced with proper geodesic area calculation
    const areaInHectares = area * 111319.9 * 111319.9 / 10000;
    return parseFloat(areaInHectares.toFixed(2));
  };

  // Connect map click event
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const clickHandler = (e: mapboxgl.MapMouseEvent) => handleMapClick(e);
    
    map.current.on('click', clickHandler);
    
    return () => {
      if (map.current) {
        map.current.off('click', clickHandler);
      }
    };
  }, [map.current, mapLoaded, isDrawing, coordinates, readOnly]);

  return (
    <div className="w-full h-full relative">
      {/* Search bar */}
      <div className="absolute top-2 left-2 right-16 z-10 bg-white/95 dark:bg-gray-900/95 rounded-md shadow-md flex items-center">
        <div className="relative flex-1">
          <Search 
            className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Search for a location or farm region..."
            className="pl-8 h-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          {searchInput && (
            <button 
              className="absolute right-2 top-2.5"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-1"
          onClick={handleSearch}
          disabled={isSearching || !searchInput.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </Button>
      </div>

      {/* Drawing controls */}
      {!readOnly && (
        <div className="absolute top-16 right-2 z-10 flex flex-col gap-2">
          {isDrawing ? (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-8 px-2"
                onClick={handleComplete}
                disabled={coordinates.length < 3}
                title="Complete the field boundary"
              >
                <Save className="h-4 w-4 mr-1" />
                <span className="text-xs">Complete</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={handleUndo}
                disabled={coordinates.length === 0}
                title="Remove last point"
              >
                <Undo className="h-4 w-4 mr-1" />
                <span className="text-xs">Undo</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={handleUseCurrentLocation}
                title="Add your current location"
              >
                <Navigation className="h-4 w-4 mr-1" />
                <span className="text-xs">Use My Location</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-2"
                onClick={handleReset}
                title="Clear all points"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="text-xs">Clear</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="h-8 px-2"
              onClick={() => handleStartDrawing()}
              title="Start drawing field boundary"
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-xs">Draw Field</span>
            </Button>
          )}
        </div>
      )}

      {/* Mapbox container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-md overflow-hidden"
        onClick={(e) => {
          // Prevent form submission when clicking on map
          e.stopPropagation();
        }}
      />

      {/* Field information overlay */}
      {coordinates.length >= 3 && (
        <div className="absolute bottom-8 left-2 bg-white/90 dark:bg-gray-900/90 p-2 rounded-md shadow-md text-xs space-y-1 max-w-xs">
          <div className="font-medium">Field Statistics:</div>
          <div>Points: {coordinates.length}</div>
          <div>Area (approx): {calculateArea(coordinates)} hectares</div>
          <div className="text-muted-foreground">
            {isDrawing ? "Click to add more points" : "Field boundary complete"}
          </div>
        </div>
      )}

      {/* Map loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading map...</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {isDrawing && !readOnly && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/90 p-2 px-3 rounded text-xs text-center">
          Click on map to add points. Add at least 3 points to create a field boundary.
        </div>
      )}
    </div>
  );
}
