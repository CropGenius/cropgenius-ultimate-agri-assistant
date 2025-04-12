
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
import { useToast } from "@/components/ui/use-toast";
import { getSoilTypes } from "@/services/soilTypeService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Save } from "lucide-react";
import FieldMap from "./FieldMap";

// Define form schema
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
}

export default function AddFieldForm({ farms = [], onSuccess, onCancel }: AddFieldFormProps) {
  const [loading, setLoading] = useState(false);
  const [soilTypes, setSoilTypes] = useState<SoilType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [mapBoundary, setMapBoundary] = useState<Boundary | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);

  // Load soil types
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

  // Initialize form with default values
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

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a field",
        variant: "destructive"
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
      
      const { data, error } = await createField(fieldData);
      
      if (error) throw new Error(error);
      
      if (data) {
        toast({
          title: "Field added successfully",
          description: `${values.name} has been added to your farm.`
        });
        
        if (onSuccess) onSuccess(data);
      }
    } catch (error: any) {
      console.error("Error adding field:", error);
      toast({
        title: "Error adding field",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle map boundary update
  const handleBoundaryChange = (boundary: Boundary) => {
    setMapBoundary(boundary);
    
    // If boundary is a polygon, calculate approximate area in hectares
    if (boundary.type === 'polygon' && boundary.coordinates.length > 2) {
      const area = calculatePolygonArea(boundary.coordinates);
      form.setValue('size', area);
    }
  };

  // Basic polygon area calculation (approximate for small areas)
  const calculatePolygonArea = (coordinates: Coordinates[]): number => {
    // Simple implementation of shoelace formula
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i].lat * coordinates[j].lng;
      area -= coordinates[j].lat * coordinates[i].lng;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to hectares (very approximate, would need projection)
    // This is a simplification and would need to be improved for production
    const areaInHectares = area * 10000;
    return parseFloat(areaInHectares.toFixed(2));
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Add New Field</CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="map">Draw on Map</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <TabsContent value="manual" className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
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
              </TabsContent>
              
              <TabsContent value="map" className="space-y-4">
                <div className="mb-4">
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
                </div>
                
                <div className="border rounded-md p-1">
                  <div className="h-[300px] w-full">
                    <FieldMap onBoundaryChange={handleBoundaryChange} />
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 inline-block mr-1" />
                  {mapBoundary ? (
                    <span>
                      Field boundaries set ({mapBoundary.coordinates.length} points)
                    </span>
                  ) : (
                    <span>
                      Draw your field boundaries on the map
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
              <Button type="submit" disabled={loading}>
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
