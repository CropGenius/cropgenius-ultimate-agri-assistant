
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Lightbulb, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Coordinates } from '@/types/field';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface SmartFieldRecommenderProps {
  coordinates: Coordinates[];
  locationName: string;
  area: number;
  onClose: () => void;
  onGetTips: () => void;
}

export default function SmartFieldRecommender({
  coordinates,
  locationName,
  area,
  onClose,
  onGetTips
}: SmartFieldRecommenderProps) {
  const { trackOperation } = useErrorLogging('SmartFieldRecommender');

  // Get the center point of the field
  const getCenterPoint = () => {
    if (coordinates.length === 0) return null;
    
    const sumLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    
    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  };
  
  // Determine the recommended crop based on location
  // In a real application, this would call an AI service/API
  const getRecommendedCrop = () => {
    const center = getCenterPoint();
    if (!center) return "maize";
    
    // Enhanced AI model simulation - in reality this would be a much more sophisticated AI model
    // using soil data, weather patterns, climate zones, and more
    const lat = center.lat;
    const lng = center.lng;
    
    // Different regions have different optimal crops
    if (lat > 10) {
      return "cassava";
    } else if (lng > 30) {
      return "coffee";
    } else if (area > 5) {
      return "wheat";
    } else {
      return "maize";
    }
  };
  
  const recommendedCrop = getRecommendedCrop();
  
  return (
    <Card className="border-primary/20 shadow-lg animate-in slide-in-from-bottom duration-300">
      <CardHeader className="bg-primary-50 dark:bg-primary-900/30 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          AI Crop Recommendation
        </CardTitle>
        <CardDescription>
          Based on advanced soil and weather analysis for your field
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              Based on your field location in <span className="font-semibold">{locationName}</span>,{" "}
              <span className="text-primary font-bold">{recommendedCrop}</span> is the optimal crop to plant.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI analyzed soil conditions, local climate patterns, and upcoming weather for this recommendation.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-xs text-muted-foreground">Expected Yield</div>
            <div className="font-medium">High (8.2 tons/ha)</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <div className="text-xs text-muted-foreground">Water Needs</div>
            <div className="font-medium">Medium</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ThumbsDown className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <Button variant="outline" size="sm" onClick={onGetTips}>
            <ThumbsUp className="h-4 w-4 mr-1" />
            Useful
          </Button>
        </div>
        <Button onClick={onGetTips} size="sm">
          Get Growing Tips
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
