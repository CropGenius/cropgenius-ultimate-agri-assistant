
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import MapboxFieldMap from "./MapboxFieldMap";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Farm } from "@/types/field";
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { FieldFormProps } from "./types";

const formSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  size: z.coerce.number().positive("Size must be a positive number").optional(),
  size_unit: z.string().default("hectares"),
  location_description: z.string().optional(),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  boundary: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddFieldForm({ 
  onSuccess, 
  onCancel, 
  defaultLocation,
  farms 
}: FieldFormProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('AddFieldForm');
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const [boundary, setBoundary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldLocation, setFieldLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      size: undefined,
      size_unit: "hectares",
      location_description: "",
      soil_type: "",
      irrigation_type: "",
      boundary: undefined,
    },
  });

  // Update boundary when the map selection changes
  useEffect(() => {
    form.setValue("boundary", boundary);
  }, [boundary, form]);

  // Handle location update from map
  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setFieldLocation(location);
    // If no name has been set by the user yet, try to reverse geocode the location
    if (!form.getValues("name")) {
      fetchLocationName(location.lng, location.lat);
    }
  };

  // Fetch location name for the coordinates
  const fetchLocationName = trackOperation('fetchLocationName', async (lng: number, lat: number) => {
    try {
      console.log(`🔍 [AddFieldForm] Reverse geocoding location: ${lng}, ${lat}`);
      // This would be a call to a reverse geocoding service
      // For now we'll just use a placeholder
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name?.split(',')[0] || 'Unknown location';
        setSearchedLocation(placeName);
        console.log(`✅ [AddFieldForm] Location name found: ${placeName}`);
        
        // Suggest a field name based on the location
        const suggestedName = `${placeName} Field`;
        if (!form.getValues("name")) {
          form.setValue("name", suggestedName);
        }
      }
    } catch (error) {
      logError(error as Error, { context: 'reverseGeocoding' });
    }
  });

  // Submit form
  const onSubmit = trackOperation('submitField', async (values: FormValues) => {
    try {
      console.log("📝 [AddFieldForm] Creating field with values:", values);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      if (!farmId) {
        throw new Error("No farm selected");
      }
      
      if (!boundary) {
        toast.warning("Please draw your field boundary on the map");
        return;
      }
      
      setIsSubmitting(true);
      
      const fieldData = {
        name: values.name,
        size: values.size,
        size_unit: values.size_unit,
        location_description: values.location_description,
        soil_type: values.soil_type,
        irrigation_type: values.irrigation_type,
        boundary: boundary,
        user_id: user.id,
        farm_id: farmId
      };
      
      console.log("💾 [AddFieldForm] Inserting field data:", fieldData);
      
      const { data: field, error } = await supabase
        .from("fields")
        .insert(fieldData)
        .select()
        .single();
      
      if (error) {
        console.error("❌ [AddFieldForm] Error creating field:", error);
        throw error;
      }
      
      console.log("✅ [AddFieldForm] Field created successfully:", field);
      logSuccess('field_created', { field_id: field.id });
      
      toast.success("Field added successfully", {
        description: `${values.name} has been added to your farm`
      });
      
      // Call onSuccess callback or navigate away
      if (onSuccess) {
        onSuccess(field);
      } else {
        navigate("/fields");
      }
    } catch (error: any) {
      console.error("❌ [AddFieldForm] Error creating field:", error);
      logError(error, { context: 'fieldCreation' });
      toast.error("Failed to add field", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  });
  
  return (
    <ErrorBoundary>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:gap-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary-50 dark:bg-primary-900/20 border-b">
                <h3 className="text-lg font-medium">Field Map</h3>
                <CardDescription>Search for your location and draw your field boundary</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] md:h-[450px] w-full">
                  <MapboxFieldMap 
                    onBoundaryChange={setBoundary}
                    onLocationChange={handleLocationChange}
                    defaultLocation={defaultLocation}
                  />
                </div>
              </CardContent>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">
                  {searchedLocation ? (
                    <span>Location: <strong>{searchedLocation}</strong></span>
                  ) : (
                    "Search for your village or location above, then draw your field boundaries"
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Field Information</h3>
                <CardDescription>Basic details about your field</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Field size" 
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                          />
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
                      <FormLabel>Location Description (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Near the river" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soil_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="loamy">Loamy</SelectItem>
                            <SelectItem value="silty">Silty</SelectItem>
                            <SelectItem value="peaty">Peaty</SelectItem>
                            <SelectItem value="chalky">Chalky</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel>Irrigation Type (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select irrigation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="drip">Drip Irrigation</SelectItem>
                            <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                            <SelectItem value="flood">Flood Irrigation</SelectItem>
                            <SelectItem value="center_pivot">Center Pivot</SelectItem>
                            <SelectItem value="rainfed">Rainfed (No Irrigation)</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <CardFooter className="px-0 pb-0 flex gap-3">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Adding Field..." : "Add Field"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </CardFooter>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
}
