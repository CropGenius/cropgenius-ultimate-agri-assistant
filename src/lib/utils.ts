
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Coordinates } from "@/types/field";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the area of a polygon defined by GPS coordinates
 * @param coordinates Array of lat/lng pairs that form a polygon
 * @returns Area in square meters
 */
export function calculatePolygonArea(coordinates: Coordinates[]): number {
  // Need at least 3 points to form a polygon
  if (coordinates.length < 3) {
    return 0;
  }

  // Earth's radius in meters
  const EARTH_RADIUS = 6371000;

  // Convert coordinates to radians
  const radiansCoords = coordinates.map(coord => ({
    lat: (coord.lat * Math.PI) / 180,
    lng: (coord.lng * Math.PI) / 180
  }));

  // Add the first point at the end to close the polygon
  radiansCoords.push(radiansCoords[0]);

  // Apply the Spherical Law of Cosines formula
  let area = 0;
  for (let i = 0; i < radiansCoords.length - 1; i++) {
    area += 
      (radiansCoords[i + 1].lng - radiansCoords[i].lng) * 
      Math.sin(radiansCoords[i].lat);
  }

  // Calculate final area in square meters
  area = Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);
  
  return area;
}

/**
 * Convert area in square meters to hectares or acres
 * @param areaSqMeters Area in square meters
 * @param unit Target unit ('hectares' or 'acres')
 * @returns Area in specified unit
 */
export function convertArea(areaSqMeters: number, unit: 'hectares' | 'acres'): number {
  if (unit === 'hectares') {
    // 1 hectare = 10,000 square meters
    return areaSqMeters / 10000;
  } else {
    // 1 acre = 4046.86 square meters
    return areaSqMeters / 4046.86;
  }
}
