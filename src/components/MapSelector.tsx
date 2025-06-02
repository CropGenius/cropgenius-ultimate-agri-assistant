import React, { useEffect, useRef } from 'react';

interface MapSelectorProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialCenter = { lat: 0, lng: 0 },
  zoom = 2,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const initializeMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        
        // Set access token
        (mapboxgl as any).accessToken = process.env.VITE_MAPBOX_ACCESS_TOKEN || '';
        
        // Check browser support
        if (!(mapboxgl as any).supported()) {
          throw new Error('Your browser does not support Mapbox GL');
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
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
              marker.current = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map.current);
            }
            
            // Call the callback
            onLocationSelect({ lat, lng });
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
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

  return (
    <div 
      ref={mapContainer} 
      id="map"
      className={`w-full h-full min-h-[400px] ${className}`}
      data-testid="map-container"
    />
  );
};

export default MapSelector;
