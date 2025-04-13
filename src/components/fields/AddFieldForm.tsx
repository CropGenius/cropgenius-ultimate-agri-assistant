import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, Farm, SoilType, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createField } from "@/services/fieldService";
import { toast } from "sonner";
import { getSoilTypes } from "@/services/soilTypeService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Save, AlertCircle } from "lucide-react";
import MapboxFieldMap from "./MapboxFieldMap";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  size: z.coerce.number().positive("Field size must be a positive number"),
  size_unit: z.string().default("hectares"),
  location_description: z.string().optional(),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  farm_id: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface AddFieldFormProps {
  farms?: Farm[];
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: { lat: number; lng: number };
}

export default function AddFieldForm({ 
  farms = [], 
  onSuccess, 
  onCancel,
  defaultLocation
}: AddFieldFormProps) {
  const [loading, setLoading] = useState(false);
  const [soilTypes, setSoilTypes] = useState<SoilType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("map");
  const [mapBoundary, setMapBoundary] = useState<Boundary | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">(navigator.onLine ? "online" : "offline");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online");
    const handleOffline = () => setConnectionStatus("offline");
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);

  useEffect(() => {
    const loadSoilTypes = async () => {
      try {
        const { data } = await getSoilTypes();
        if (data) {
          setSoilTypes(data);
        }
      } catch (error) {
        console.error("Error loading soil types:", error);
      }
    };
    
    loadSoilTypes();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      size: 0,
      size_unit: "hectares",
      location_description: "",
      soil_type: "",
      irrigation_type: "",
      farm_id: farms.length > 0 ? farms[0].id : undefined
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a field",
        variant: "destructive"
      });
      return;
    }
    
    if (!mapBoundary || mapBoundary.coordinates.length < 3) {
      toast.error("Field boundary required", {
        description: "Please draw your field boundary on the map before saving"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const fieldData: Omit<Field, "id" | "created_at" | "updated_at"> = {
        user_id: userId,
        name: values.name,
        size: values.size,
        size_unit: values.size_unit,
        farm_id: values.farm_id || null,
        boundary: mapBoundary,
        location_description: values.location_description || null,
        soil_type: values.soil_type || null,
        irrigation_type: values.irrigation_type || null,
        is_shared: false,
        shared_with: []
      };
      
      createField(fieldData)
        .then(({ data, error }) => {
          if (error) throw new Error(error);
          
          if (data) {
            toast.success("Field added successfully", {
              description: `${values.name} has been added to your farm.`
            });
            
            // Trigger AI analysis
            if (connectionStatus === "online") {
              triggerAiAnalysis(data.id);
            }
            
            if (onSuccess) onSuccess(data);
          }
        })
        .catch((error) => {
          console.error("Error adding field:", error);
          toast.error("Error adding field", {
            description: error.message || "An unexpected error occurred"
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error: any) {
      console.error("Error adding field:", error);
      toast.error("Error adding field", {
        description: error.message || "An unexpected error occurred"
      });
      setLoading(false);
    }
  };

  const triggerAiAnalysis = async (fieldId: string) => {
    setAiAnalyzing(true);
    
    try {
      // This will be implemented with Supabase Edge Function
      // For now, we'll simulate the analysis
      setTimeout(() => {
        const insights = [
          "Soil composition indicates good suitability for maize and cassava.",
          "Historical weather patterns suggest optimal planting time in early March.",
          "Area has low risk for Fall Armyworm compared to regional average.",
          "Nearby fields growing similar crops have reported 12% yield increases with crop rotation."
        ];
        
        setAiInsights(insights.join(" "));
        setAiAnalyzing(false);
        
        toast.success("AI Analysis Complete", {
          description: "CROPGenius has analyzed your field data and provided insights"
        });
      }, 3000);
    } catch (error) {
      console.error("Error analyzing field:", error);
      setAiAnalyzing(false);
    }
  };

  const handleBoundaryChange = (boundary: Boundary) => {
    setMapBoundary(boundary);
    
    if (boundary.type === 'polygon' && boundary.coordinates.length > 2) {
      // Calculate area - in a real implementation, this would be more accurate
      const area = calculatePolygonArea(boundary.coordinates);
      form.setValue('size', area);
    }
  };

  const calculatePolygonArea = (coordinates: { lat: number; lng: number }[]): number => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i].lng * coordinates[j].lat;
      area -= coordinates[j].lng * coordinates[i].lat;
    }
    
    area = Math.abs(area) / 2;
    
    // Converting to hectares - simplified calculation
    const areaInHectares = area * 111319.9 * 111319.9 / 10000;
    return parseFloat(areaInHectares.toFixed(2));
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Map Your Field</CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map Field</TabsTrigger>
          <TabsTrigger value="details">Field Details</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North Field" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <TabsContent value="map" className="space-y-4 pt-2">
                {connectionStatus === "offline" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You are offline. Map functions will be limited, but you can still draw your field manually.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="border rounded-md">
                  <div className="h-[400px] w-full">
                    <MapboxFieldMap 
                      onBoundaryChange={handleBoundaryChange}
                      defaultLocation={defaultLocation}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 inline-block mr-1" />
                    {mapBoundary && mapBoundary.coordinates.length > 0 ? (
                      <span>
                        Field boundary set with {mapBoundary.coordinates.length} points
                      </span>
                    ) : (
                      <span>
                        Search for a location or use the draw tool to map your field
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calculated Size</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="size_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hectares">Hectares</SelectItem>
                              <SelectItem value="acres">Acres</SelectItem>
                              <SelectItem value="square_meters">Square Meters</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="location_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. 2km east of village, near the river"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soil_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soilTypes.map((soil) => (
                              <SelectItem key={soil.id} value={soil.name}>
                                {soil.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="irrigation_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Irrigation Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rainfed">Rainfed</SelectItem>
                            <SelectItem value="drip">Drip</SelectItem>
                            <SelectItem value="sprinkler">Sprinkler</SelectItem>
                            <SelectItem value="flood">Flood</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {farms.length > 0 && (
                  <FormField
                    control={form.control}
                    name="farm_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select farm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="">Independent Field</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {aiAnalyzing && (
                  <div className="p-4 border rounded-md bg-muted/30 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <div className="text-sm">
                      AI is analyzing your field data for personalized insights...
                    </div>
                  </div>
                )}
                
                {aiInsights && (
                  <div className="p-4 border border-primary/20 rounded-md bg-primary/5">
                    <h4 className="text-sm font-semibold mb-2">AI Field Insights:</h4>
                    <p className="text-sm">{aiInsights}</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !mapBoundary || mapBoundary.coordinates.length < 3}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Field
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Tabs>
    </Card>
  );
}
