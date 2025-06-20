import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Undo, MapPin, Navigation, Search, X, AlertTriangle, RefreshCw, WifiOff, Image } from "lucide-react";
import { toast } from "sonner";
import MapboxSDK from "@mapbox/mapbox-sdk";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useErrorLogging } from "@/hooks/use-error-logging";
import MapSearchInput from "./MapSearchInput";
import MapNavigator from "./MapNavigator";
import FieldConfirmationCard from "./FieldConfirmationCard";
import SmartFieldRecommender from "./SmartFieldRecommender";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Use environment variable for access token with fallback and UI error handling
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Set the token for mapbox-gl if available
if (MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
} else {
  console.error("❌ [MapboxFieldMap] VITE_MAPBOX_ACCESS_TOKEN not found in environment variables");
  // We'll handle the missing token in the component rendering
}

interface MapboxFieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  onLocationChange?: (location: Coordinates) => void;
  readOnly?: boolean;
  defaultLocation?: Coordinates;
  isSaving?: boolean;
}

export default function MapboxFieldMap({
  initialBoundary,
  onBoundaryChange,
  onLocationChange,
  readOnly = false,
  defaultLocation,
  isSaving = false,
}: MapboxFieldMapProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('MapboxFieldMap');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);

  // Local storage for caching map data
  const [cachedMapData, setCachedMapData] = useLocalStorage<{
    snapshot?: string;
    boundary?: Boundary;
    location?: { name: string; coordinates: Coordinates };
  }>('mapboxFieldMapData');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 [MapboxFieldMap] Network connection restored");
      setIsOffline(false);
      toast.success("You're back online", {
        description: "Map functionality has been restored"
      });
    };

    const handleOffline = () => {
      console.log("🌐 [MapboxFieldMap] Network connection lost");
      setIsOffline(true);
      toast.warning("You're offline", {
        description: "Limited map functionality available"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize geocoding client
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError("Missing Mapbox access token. Please check your environment configuration.");
      toast.error("Map configuration error", {
        description: "Map loading failed – check your internet or configuration"
      });
      return;
    }

    try {
      // Only initialize if online
      if (!isOffline) {
        const baseClient = MapboxSDK({ accessToken: MAPBOX_ACCESS_TOKEN });
        geocodingClient.current = MapboxGeocoding(baseClient);
        console.log("✅ [MapboxFieldMap] Geocoding client initialized");
      }
    } catch (error) {
      logError(error as Error, { context: 'geocodingClientInit' });
      setMapError("Failed to initialize geocoding client");
    }
  }, [isOffline]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // If offline and we have a cached snapshot, don't try to initialize the map
    if (isOffline && cachedMapData.snapshot) {
      console.log("🌐 [MapboxFieldMap] Offline mode - using cached map data");
      setMapLoaded(true);

      // If we have cached coordinates, use them
      if (cachedMapData.boundary?.coordinates?.length > 2) {
        setCoordinates(cachedMapData.boundary.coordinates);
      }

      // If we have cached location name, use it
      if (cachedMapData.location?.name) {
        setLocationName(cachedMapData.location.name);
      }

      return;
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError("Missing Mapbox access token. Please check your environment configuration.");
      return;
    }

    try {
      console.log("🗺️ [MapboxFieldMap] Initializing map");

      // Use cached location if available, otherwise use default
      const cachedLocation = cachedMapData.location?.coordinates;
      const defaultCenter: [number, number] = cachedLocation 
        ? [cachedLocation.lng, cachedLocation.lat]
        : defaultLocation 
          ? [defaultLocation.lng, defaultLocation.lat]
          : [20, 5]; // Center of Africa

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: defaultCenter,
        zoom: cachedLocation ? 16 : 4,
        attributionControl: false,
      });

      mapInstance.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      mapInstance.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 150,
          unit: "metric",
        }),
        "bottom-left"
      );

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });
      mapInstance.addControl(geolocateControl, "top-right");

      flyToLocation.current = (lng: number, lat: number, zoom: number = 16) => {
        if (!map.current) return;

        console.log(`🚀 [MapboxFieldMap] Flying to: ${lng}, ${lat}, zoom: ${zoom}`);

        map.current.flyTo({
          center: [lng, lat],
          essential: true,
          zoom: zoom,
          duration: 2000,
          pitch: 60,
          bearing: Math.random() * 180 - 90,
          easing: (t) => {
            return t * (2 - t);
          }
        });

        if (locationMarker.current) {
          locationMarker.current.remove();
        }

        const el = document.createElement('div');
        el.className = 'location-marker';
        el.innerHTML = `
          <div class="location-marker-inner"></div>
          <div class="location-marker-pulse"></div>
        `;

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

        locationMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);

        markerPulse.current = el;

        if (onLocationChange) {
          onLocationChange({ lng, lat });
        }
      };

      mapInstance.on("load", () => {
        console.log("✅ [MapboxFieldMap] Map loaded successfully");
        setMapLoaded(true);

        // Use cached coordinates if available and no coordinates are set
        const coordsToUse = coordinates.length > 0 
          ? coordinates 
          : cachedMapData.boundary?.coordinates || [];

        if (coordsToUse.length > 2) {
          drawFieldPolygon(mapInstance, coordsToUse);
          setCoordinates(coordsToUse);

          const bounds = new mapboxgl.LngLatBounds();
          coordsToUse.forEach((coord) => {
            bounds.extend([coord.lng, coord.lat]);
          });

          mapInstance.fitBounds(bounds, {
            padding: 50,
            duration: 1000,
          });
        }

        // Capture snapshot after map has loaded and rendered
        // Use a timeout to ensure the map has fully rendered
        setTimeout(() => {
          captureMapSnapshot();
        }, 2000);

        // Set up periodic snapshot capture (every 30 seconds when map changes)
        let lastMoveTime = Date.now();
        mapInstance.on('moveend', () => {
          // Only capture snapshot if it's been more than 30 seconds since the last one
          // and the user has stopped moving the map
          const now = Date.now();
          if (now - lastMoveTime > 30000) {
            captureMapSnapshot();
          }
          lastMoveTime = now;
        });

        // Also capture snapshot when field boundary changes
        if (onBoundaryChange) {
          const originalOnBoundaryChange = onBoundaryChange;
          onBoundaryChange = (boundary: Boundary) => {
            originalOnBoundaryChange(boundary);
            // Capture snapshot after a short delay to ensure the boundary is rendered
            setTimeout(() => {
              captureMapSnapshot();
            }, 500);
          };
        }
      });

      map.current = mapInstance;
      logSuccess('map_initialized');

      mapInstance.on('click', (e) => {
        if (isDrawing && !readOnly) {
          handleMapClick(e);
        }
      });

      return () => {
        drawMarkers.current.forEach(marker => marker.remove());
        if (locationMarker.current) locationMarker.current.remove();
        mapInstance.remove();
      };
    } catch (error) {
      logError(error as Error, { context: 'mapInitialization' });
      setMapError("Failed to load map. Please check your internet connection.");
    }
  }, [defaultLocation, onLocationChange]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCoordinates([]);
    toast.info("Drawing started. Click on the map to add points.");
  };

  const handleUndo = () => {
    setCoordinates(coords => coords.slice(0, -1));
  };
  
  const handleComplete = () => {
    if (coordinates.length < 3) {
      toast.warning("Please draw at least 3 points.");
      return;
    }
    const newBoundary: Boundary = {
      type: "polygon",
      coordinates: [...coordinates, coordinates[0]], // Close polygon
    };
    setIsDrawing(false);
    if (onBoundaryChange) onBoundaryChange(newBoundary);
  };
  
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        if (map.current) {
            map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
        }
      },
      (error) => toast.error("Could not get location", { description: error.message })
    );
  };

  return (
    <ErrorBoundary fallback={<p>Map failed to load.</p>}>
      <div ref={mapContainer} className="relative w-full h-full min-h-[400px] bg-gray-200">
        {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-20">
                <p className="text-destructive">{mapError}</p>
            </div>
        )}

        {!readOnly && (
          <div className="absolute top-4 right-4 z-10">
            <MapNavigator 
              onStartDrawing={handleStartDrawing}
              onUseCurrentLocation={handleUseCurrentLocation}
              isDrawing={isDrawing}
            />
          </div>
        )}
        
        {isDrawing && !readOnly && (
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 p-2 rounded-lg shadow-lg flex items-center gap-2">
             <Button onClick={handleUndo} variant="outline" disabled={coordinates.length === 0 || isSaving}>
               <Undo className="mr-2 h-4 w-4" />
               Undo
             </Button>
             <Button onClick={handleComplete} disabled={coordinates.length < 3 || isSaving}>
               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               {isSaving ? 'Saving...' : 'Complete Field'}
             </Button>
           </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
