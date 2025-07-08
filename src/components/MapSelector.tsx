import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapSelectorProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialCenter = { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya as default
  zoom = 10,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);
        
        const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        
        if (!mapboxToken) {
          throw new Error('CRITICAL: Mapbox access token REQUIRED for 100M farmers. Configure VITE_MAPBOX_ACCESS_TOKEN immediately.');
        }
        
        const mapboxgl = (await import('mapbox-gl')).default;
        
        // Set access token
        (mapboxgl as any).accessToken = mapboxToken;
        
        // Check browser support
        if (!(mapboxgl as any).supported()) {
          throw new Error('Your browser does not support Mapbox GL. Please update your browser or use a different one.');
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12', // Better for farming
          center: [initialCenter.lng, initialCenter.lat],
          zoom: zoom,
        });

        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl());

        // Add click handler
        if (onLocationSelect) {
          map.current.on('click', (e: any) => {
            const { lng, lat } = e.lngLat;
            
            // Update marker position
            if (marker.current) {
              marker.current.setLngLat([lng, lat]);
            } else {
              marker.current = new mapboxgl.Marker({
                color: '#10b981' // Green marker for farming theme
              })
                .setLngLat([lng, lat])
                .addTo(map.current);
            }
            
            // Call the callback
            onLocationSelect({ lat, lng });
          });
        }
        
        map.current.on('load', () => {
          setIsLoading(false);
        });
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initialCenter, zoom, onLocationSelect]);

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (onLocationSelect) {
            onLocationSelect({ lat: latitude, lng: longitude });
          }
          
          // Update map center if available
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15
            });
            
            // Add or update marker
            if (marker.current) {
              marker.current.setLngLat([longitude, latitude]);
            } else {
              const mapboxgl = (await import('mapbox-gl')).default;
              marker.current = new mapboxgl.Marker({
                color: '#10b981'
              })
                .setLngLat([longitude, latitude])
                .addTo(map.current);
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMapError('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      setMapError('Geolocation is not supported by your browser.');
    }
  };

  if (mapError) {
    throw new Error(`CRITICAL MAP FAILURE: ${mapError}. Maps are REQUIRED for 100M farmers.`);
  }

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        id="map"
        className="w-full h-full min-h-[400px] rounded-lg"
        data-testid="map-container"
      />
      
      {!isLoading && (
        <Button
          onClick={handleUseCurrentLocation}
          className="absolute top-4 right-4 z-10"
          size="sm"
          variant="secondary"
        >
          <MapPin className="h-4 w-4 mr-2" />
          My Location
        </Button>
      )}
    </div>
  );
};

export default MapSelector;
