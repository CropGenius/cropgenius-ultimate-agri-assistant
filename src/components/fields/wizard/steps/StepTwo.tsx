import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Target, Map as MapIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Boundary, Coordinates } from '@/types/field';
import { toast } from 'sonner';

// Lazy load Mapbox map to defer heavy libraries
const MapboxFieldMap = lazy(() => import('@/components/fields/MapboxFieldMap'));

interface StepTwoProps {
  location: Coordinates | null;
  boundary: Boundary | null;
  onLocationChange: (location: Coordinates) => void;
  onBoundaryChange: (boundary: Boundary) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function StepTwo({ 
  location, 
  boundary, 
  onLocationChange, 
  onBoundaryChange,
  onNext,
  onBack,
  onSkip
}: StepTwoProps) {
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [recentLocations, setRecentLocations] = useState<{name: string, coordinates: Coordinates}[]>([]);

  useEffect(() => {
    // Try to load recent locations from localStorage
    try {
      const savedLocations = localStorage.getItem('recentLocations');
      if (savedLocations) {
        setRecentLocations(JSON.parse(savedLocations).slice(0, 3));
      }
    } catch (error) {
      console.error("Error loading recent locations:", error);
    }
    
    // If no initial location, try to get user's current location
    if (!location && !boundary) {
      getCurrentLocation();
    }
  }, [location, boundary]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        onLocationChange(newLocation);
        
        // Get location name
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${newLocation.lng},${newLocation.lat}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            if (data.features && data.features.length > 0) {
              setSearchedLocation(data.features[0].place_name);
            }
          })
          .catch(err => console.error("Error getting location name:", err))
          .finally(() => setIsGettingLocation(false));
      },
      (error) => {
        console.error("Error getting current location:", error);
        setIsGettingLocation(false);
        toast.error("Couldn't get your location", {
          description: "Please search for your location on the map instead"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUseRecentLocation = (recent: {name: string, coordinates: Coordinates}) => {
    onLocationChange(recent.coordinates);
    setSearchedLocation(recent.name);
    toast.info(`Using location: ${recent.name}`);
  };

  const handleLocationChange = (location: Coordinates) => {
    onLocationChange(location);
    
    // Get location name when location changes
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          setSearchedLocation(data.features[0].place_name);
          
          // Save to recent locations
          const newLocation = {
            name: data.features[0].place_name,
            coordinates: location
          };
          
          try {
            const savedLocations = localStorage.getItem('recentLocations');
            let locations = savedLocations ? JSON.parse(savedLocations) : [];
            
            // Add to beginning, avoid duplicates
            locations = [
              newLocation,
              ...locations.filter(loc => 
                loc.coordinates.lat !== location.lat || loc.coordinates.lng !== location.lng
              )
            ].slice(0, 5); // Keep only 5 most recent
            
            localStorage.setItem('recentLocations', JSON.stringify(locations));
          } catch (error) {
            console.error("Error saving recent locations:", error);
          }
        }
      })
      .catch(err => console.error("Error getting location name:", err));
  };

  const handleNextStep = () => {
    if (!location && !boundary) {
      toast.warning("Please select a location or draw your field boundary");
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Where is your field?</h2>
        <p className="text-center text-muted-foreground mb-4">
          Search or mark your field's location on the map
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="overflow-hidden border shadow-md">
          <CardContent className="p-0">
            <div className="h-[300px] md:h-[400px] w-full">
              <Suspense fallback={<div>Loading map...</div>}>
                <MapboxFieldMap
                  onBoundaryChange={onBoundaryChange}
                  onLocationChange={handleLocationChange}
                  defaultLocation={location || undefined}
                  initialBoundary={boundary}
                />
              </Suspense>
            </div>
          </CardContent>
          
          <div className="p-3 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <Target className="h-4 w-4 mr-1" />
                {isGettingLocation ? "Getting location..." : "Use my location"}
              </Button>
              
              {searchedLocation && (
                <p className="text-xs text-muted-foreground px-2 truncate max-w-[180px]">
                  {searchedLocation}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {recentLocations.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium mb-2">Recent locations:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentLocations.map((location, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleUseRecentLocation(location)}
              >
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {location.name.split(',')[0]}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="space-y-2 flex-1">
          <Button 
            onClick={handleNextStep}
            className="w-full"
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full text-xs font-normal"
          >
            Skip this step
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
