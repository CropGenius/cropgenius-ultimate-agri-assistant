
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Undo, MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "sonner";
import MapboxSDK from "@mapbox/mapbox-sdk";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useErrorLogging } from "@/hooks/use-error-logging";
import MapSearchInput from "./MapSearchInput";
import MapNavigator from "./MapNavigator";
import FieldConfirmationCard from "./FieldConfirmationCard";
import ErrorBoundary from "@/components/error/ErrorBoundary";

// Temporary access token - will be moved to Supabase Edge Function secrets
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiY3JvcGdlbml1cyIsImEiOiJjbHQ1aWl0Zm8wcmd2MmptcXBvY2V5YWp2In0.HlnQI4Uy4R79P3QFKlKk4A";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapboxFieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  onLocationChange?: (location: Coordinates) => void;
  readOnly?: boolean;
  defaultLocation?: Coordinates;
}

export default function MapboxFieldMap({
  initialBoundary,
  onBoundaryChange,
  onLocationChange,
  readOnly = false,
  defaultLocation
}: MapboxFieldMapProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('MapboxFieldMap');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const geocodingClient = useRef<any>(null);
  const drawMarkers = useRef<mapboxgl.Marker[]>([]);
  const areaPolygon = useRef<any>(null);
  const flyToLocation = useRef<(lng: number, lat: number, zoom: number) => void>();
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const markerPulse = useRef<HTMLDivElement | null>(null);

  // Initialize geocoding client
  useEffect(() => {
    try {
      const baseClient = MapboxSDK({ accessToken: MAPBOX_ACCESS_TOKEN });
      geocodingClient.current = MapboxGeocoding(baseClient);
      console.log("✅ [MapboxFieldMap] Geocoding client initialized");
    } catch (error) {
      logError(error as Error, { context: 'geocodingClientInit' });
    }
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      console.log("🗺️ [MapboxFieldMap] Initializing map");
      
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

      // Define the flyToLocation function with improved animation
      flyToLocation.current = (lng: number, lat: number, zoom: number = 16) => {
        if (!map.current) return;
        
        console.log(`🚀 [MapboxFieldMap] Flying to: ${lng}, ${lat}, zoom: ${zoom}`);
        
        map.current.flyTo({
          center: [lng, lat],
          essential: true,
          zoom: zoom,
          duration: 2000,
          pitch: 60,
          bearing: Math.random() * 180 - 90, // Random bearing for dynamic feel
          easing: (t) => {
            return t * (2 - t); // easeOutQuad for smoother animation
          }
        });
        
        // Add animated marker at the target location
        if (locationMarker.current) {
          locationMarker.current.remove();
        }
        
        // Create pulsing dot element
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.innerHTML = `
          <div class="location-marker-inner"></div>
          <div class="location-marker-pulse"></div>
        `;
        
        // Add custom styles for the pulsing effect
        const style = document.createElement('style');
        style.innerHTML = `
          .location-marker {
            width: 24px;
            height: 24px;
            position: relative;
          }
          .location-marker-inner {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #4CAF50;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            position: absolute;
            top: 5px;
            left: 5px;
          }
          .location-marker-pulse {
            width: 40px;
            height: 40px;
            background: rgba(76, 175, 80, 0.4);
            border-radius: 50%;
            position: absolute;
            top: -8px;
            left: -8px;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
        
        // Create and add the marker
        locationMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        markerPulse.current = el;
        
        // Notify parent about location change if prop exists
        if (onLocationChange) {
          onLocationChange({ lng, lat });
        }
      };

      // Handle map load event
      mapInstance.on("load", () => {
        console.log("✅ [MapboxFieldMap] Map loaded successfully");
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
      logSuccess('map_initialized');

      // Map click event handler for drawing
      mapInstance.on('click', (e) => {
        if (isDrawing && !readOnly) {
          handleMapClick(e);
        }
      });

      // Cleanup function
      return () => {
        drawMarkers.current.forEach(marker => marker.remove());
        if (locationMarker.current) locationMarker.current.remove();
        mapInstance.remove();
      };
    } catch (error) {
      logError(error as Error, { context: 'mapInitialization' });
    }
  }, [defaultLocation, onLocationChange]);

  // Handle search functionality
  const handleSearch = trackOperation('searchLocation', async (searchInput: string) => {
    if (!searchInput.trim() || !geocodingClient.current) {
      toast.warning("Please enter a search term");
      return;
    }

    setIsSearching(true);
    console.log("🔍 [MapboxFieldMap] Searching for:", searchInput);
    
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
        
        console.log("✅ [MapboxFieldMap] Location found:", placeName, lng, lat);
        setLocationName(placeName);
        setSearchResults({ name: placeName, lat, lng });
        
        toast.success("Location found!", { 
          description: placeName,
          action: {
            label: "View",
            onClick: () => {
              if (flyToLocation.current) {
                flyToLocation.current(lng, lat, 16);
              }
            }
          }
        });
        
        // Fly to location with animation
        if (flyToLocation.current) {
          flyToLocation.current(lng, lat, 16);
        }
        
        // Update location for parent component
        if (onLocationChange) {
          onLocationChange({ lng, lat });
        }
      } else {
        console.error("❌ [MapboxFieldMap] No location found for:", searchInput);
        toast.warning("No location found", { description: "Try a different search term or be more specific" });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Search failed";
      console.error("❌ [MapboxFieldMap] Geocoding error:", errorMessage);
      logError(error, { context: 'geocoding' });
      toast.error("Search failed", { description: "Please check your connection and try again" });
    } finally {
      setIsSearching(false);
    }
  });

  // Draw field polygon on the map
  const drawFieldPolygon = (mapInstance: mapboxgl.Map, fieldCoords: Coordinates[]) => {
    try {
      // Remove existing polygon if any
      if (mapInstance.getSource('field-polygon')) {
        mapInstance.removeLayer('field-polygon-fill');
        mapInstance.removeLayer('field-polygon-outline');
        mapInstance.removeSource('field-polygon');
      }
      
      if (fieldCoords.length < 3) return;
      
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
      
      console.log("✅ [MapboxFieldMap] Field polygon drawn with", fieldCoords.length, "points");
    } catch (error) {
      logError(error as Error, { context: 'drawFieldPolygon' });
    }
  };

  // Handle starting the drawing mode
  const handleStartDrawing = (startPoint?: [number, number]) => {
    if (!map.current || readOnly) return;
    
    try {
      setIsDrawing(true);
      setCoordinates([]);
      
      console.log("🖌️ [MapboxFieldMap] Drawing mode activated");
      
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
    } catch (error) {
      logError(error as Error, { context: 'startDrawing' });
    }
  };

  // Add a point to the field boundary
  const addPoint = (lng: number, lat: number) => {
    if (!map.current || !isDrawing || readOnly) return;
    
    try {
      console.log(`📍 [MapboxFieldMap] Adding point at ${lng}, ${lat}`);
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
    } catch (error) {
      logError(error as Error, { context: 'addPoint' });
    }
  };

  // Handle map click for adding points
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || readOnly) return;
    
    try {
      const { lng, lat } = e.lngLat;
      addPoint(lng, lat);
    } catch (error) {
      logError(error as Error, { context: 'mapClick' });
    }
  };

  // Complete the drawing
  const handleComplete = () => {
    try {
      if (coordinates.length < 3) {
        toast.warning("Need more points", { 
          description: "Add at least 3 points to create a field boundary" 
        });
        return;
      }
      
      setIsDrawing(false);
      console.log("✅ [MapboxFieldMap] Field boundary completed with", coordinates.length, "points");
      
      if (onBoundaryChange) {
        onBoundaryChange({
          type: 'polygon',
          coordinates
        });
      }
      
      toast.success("Field boundary completed", { 
        description: `Field mapped with ${coordinates.length} points` 
      });
    } catch (error) {
      logError(error as Error, { context: 'completeDrawing' });
    }
  };

  // Remove the last point
  const handleUndo = () => {
    if (coordinates.length === 0) return;
    
    try {
      console.log("↩️ [MapboxFieldMap] Undoing last point");
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
    } catch (error) {
      logError(error as Error, { context: 'undoPoint' });
    }
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!map.current) return;
    
    try {
      console.log("📱 [MapboxFieldMap] Requesting user location");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("📍 [MapboxFieldMap] Got user location:", latitude, longitude);
          
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
          console.error("❌ [MapboxFieldMap] Geolocation error:", error.message);
          logError(new Error(error.message), { context: 'geolocation' });
          toast.error("Location error", {
            description: "Could not access your location. Please check permissions."
          });
        }
      );
    } catch (error) {
      logError(error as Error, { context: 'useCurrentLocation' });
    }
  };

  // Reset the field boundary
  const handleReset = () => {
    if (!map.current) return;
    
    try {
      console.log("🧹 [MapboxFieldMap] Resetting field boundary");
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
    } catch (error) {
      logError(error as Error, { context: 'resetField' });
    }
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

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative">
        {/* Search bar with reusable component */}
        <div className="absolute top-2 left-2 right-16 z-10 bg-white/95 dark:bg-gray-900/95 rounded-md shadow-md">
          <MapSearchInput 
            onSearch={handleSearch}
            onLocationSelect={(location) => {
              if (flyToLocation.current) {
                flyToLocation.current(location.lng, location.lat, 16);
              }
            }}
            isSearching={isSearching}
            className="px-1"
          />
        </div>

        {/* Drawing controls using MapNavigator component */}
        {!readOnly && (
          <div className="absolute top-16 right-2 z-10">
            <MapNavigator
              onComplete={isDrawing ? handleComplete : handleStartDrawing}
              onUndo={handleUndo}
              onUseCurrentLocation={handleUseCurrentLocation}
              onReset={handleReset}
              isDrawing={isDrawing}
              hasPoints={coordinates.length > 0}
            />
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

        {/* Field confirmation card */}
        {coordinates.length >= 3 && searchResults && (
          <div className="absolute bottom-4 left-2 right-2 z-10">
            <FieldConfirmationCard
              locationName={locationName || "Your Field"}
              coordinates={coordinates}
              area={calculateArea(coordinates)}
              areaUnit="hectares"
            />
          </div>
        )}

        {/* Field information overlay */}
        {coordinates.length >= 3 && (
          <div className="absolute bottom-20 left-2 bg-white/90 dark:bg-gray-900/90 p-2 rounded-md shadow-md text-xs space-y-1 max-w-xs">
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
    </ErrorBoundary>
  );
}
