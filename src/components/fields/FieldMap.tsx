import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

interface FieldMapProps {
  coordinates?: number[][];
  center?: [number, number];
  zoom?: number;
  fieldName?: string;
}

const FieldMap: React.FC<FieldMapProps> = ({
  coordinates = [],
  center = [-1.2921, 36.8219], // Default to Kenya coordinates
  zoom = 13,
  fieldName = 'Field'
}) => {
  // Convert coordinates to the correct format for Leaflet
  const polygonCoords: LatLngExpression[] = coordinates.length > 0 
    ? coordinates.map(coord => [coord[1], coord[0]] as LatLngExpression)
    : [
        [center[0] - 0.01, center[1] - 0.01],
        [center[0] - 0.01, center[1] + 0.01],
        [center[0] + 0.01, center[1] + 0.01],
        [center[0] + 0.01, center[1] - 0.01]
      ];

  return (
    <div className="h-64 w-full rounded-md overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polygon 
          fillColor="#10b981"
          fillOpacity={0.4}
          color="#059669"
          weight={2}
          positions={polygonCoords}
        >
          <Popup>{fieldName}</Popup>
        </Polygon>
      </MapContainer>
    </div>
  );
};

export default FieldMap;
