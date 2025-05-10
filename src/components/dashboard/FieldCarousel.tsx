
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Leaf, Cloud, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";
import { Field } from "@/types/field";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FieldCarouselProps {
  className?: string;
}

interface FieldWithMeta extends Field {
  lastRain?: string | null;
  activeInsights?: boolean;
  cropName?: string | null;
  activeIssues?: number;
}

export function FieldCarousel({ className }: FieldCarouselProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<FieldWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFields = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Try loading from localStorage first for offline support
        const localFieldsStr = localStorage.getItem(`user_fields_${user.id}`);
        let localFields = localFieldsStr ? JSON.parse(localFieldsStr) : null;
        
        if (localFields) {
          setFields(localFields);
        }
        
        // If online, fetch from Supabase
        if (isOnline()) {
          // First get the user's fields
          const { data: fieldsData, error: fieldsError } = await supabase
            .from('fields')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (fieldsError) {
            console.error("Error fetching fields:", fieldsError);
            setError("Couldn't load your fields");
            return;
          }
          
          if (!fieldsData || fieldsData.length === 0) {
            setFields([]);
            setLoading(false);
            return;
          }
          
          // Then fetch crops for each field
          const fieldIds = fieldsData.map(field => field.id);
          const { data: cropsData, error: cropsError } = await supabase
            .from('field_crops')
            .select('*')
            .in('field_id', fieldIds)
            .eq('status', 'active');
            
          if (cropsError) {
            console.error("Error fetching crops:", cropsError);
          }
          
          // Fetch weather data
          const { data: weatherData, error: weatherError } = await supabase
            .from('weather_data')
            .select('*')
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: false })
            .limit(1);

          // Enhance fields with additional metadata
          const enhancedFields = fieldsData.map(field => {
            const fieldCrops = cropsData?.filter(crop => crop.field_id === field.id) || [];
            
            // Determine the last rain date from weather data
            // This is simplified - in a real app you'd have field-specific weather
            const lastRainDate = weatherData && weatherData[0]?.forecast?.rain_chance > 70 
              ? new Date(weatherData[0].recorded_at).toLocaleDateString()
              : null;
              
            return {
              ...field,
              lastRain: lastRainDate,
              activeInsights: Math.random() > 0.5, // Simulate insights (replace with real logic)
              cropName: fieldCrops.length > 0 ? fieldCrops[0].crop_name : null,
              activeIssues: Math.floor(Math.random() * 3) // Simulate issues (replace with real logic)
            };
          });
          
          setFields(enhancedFields);
          localStorage.setItem(`user_fields_${user.id}`, JSON.stringify(enhancedFields));
        }
      } catch (err) {
        console.error("Error processing field data:", err);
        setError("Couldn't load field data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFields();
  }, [user]);
  
  const handleFieldClick = (fieldId: string) => {
    navigate(`/fields/${fieldId}`);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Your Fields</h2>
        {fields.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/fields")}
            className="text-sm font-medium text-primary"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6 text-center">
            <div>
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-orange-500" />
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate("/fields")}
              >
                Manage Fields
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : fields.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6 text-center">
            <div>
              <Info className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <p className="font-medium">No fields added yet</p>
              <Button 
                variant="default" 
                size="sm" 
                className="mt-2 bg-primary"
                onClick={() => navigate("/manage-fields")}
              >
                Add Your First Field
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div ref={carouselRef}>
          <Carousel
            opts={{
              align: "start",
              loop: fields.length > 2,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {fields.map(field => (
                <CarouselItem key={field.id} className="pl-2 md:pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3">
                  <div onClick={() => handleFieldClick(field.id)}>
                    <Card className="cursor-pointer overflow-hidden border hover:border-primary/50 hover:shadow-md transition-all">
                      <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium line-clamp-1">{field.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {field.size} {field.size_unit}
                            </p>
                          </div>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <Leaf className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.cropName && (
                            <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-xs">
                              {field.cropName}
                            </Badge>
                          )}
                          
                          {field.soil_type && (
                            <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-xs">
                              {field.soil_type}
                            </Badge>
                          )}
                          
                          {field.activeIssues && field.activeIssues > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {field.activeIssues} issue{field.activeIssues !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                        
                      <CardFooter className="flex items-center justify-between p-3 gap-2">
                        {field.lastRain ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Cloud className="mr-1 h-3 w-3 text-blue-500" />
                            Last rain: {field.lastRain}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No recent rain</div>
                        )}
                        
                        {field.activeInsights && (
                          <Badge className="bg-blue-500 text-[10px] px-1">AI Insight</Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
              
              <CarouselItem className="pl-2 md:pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3">
                <Card 
                  className="cursor-pointer h-full flex items-center justify-center border-dashed border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  onClick={() => navigate("/manage-fields")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">Add New Field</h3>
                    <p className="text-xs text-muted-foreground">Map your farm area</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            
            <CarouselPrevious className="left-0 translate-x-0 bg-white dark:bg-gray-900" />
            <CarouselNext className="right-0 translate-x-0 bg-white dark:bg-gray-900" />
          </Carousel>
        </div>
      )}
    </div>
  );
}

export default FieldCarousel;
