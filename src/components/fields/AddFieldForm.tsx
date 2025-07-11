import React, { useState, useEffect, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { FieldFormProps } from "./types";


const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapboxFieldMap = lazy(() => import("./MapboxFieldMap"));

const formSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  size: z.coerce.number().positive("Size must be a positive number").optional(),
  size_unit: z.string().default("hectares"),
  location_description: z.string().optional(),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  boundary: z.any().optional(),
  crop_type: z.string().optional(),
  season: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddFieldForm({ 
  onSuccess, 
  onCancel, 
  defaultLocation
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
      crop_type: "",
      season: "",
    },
  });

  useEffect(() => {
    form.setValue("boundary", boundary);
  }, [boundary, form]);

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setFieldLocation(location);
    if (!form.getValues("name")) {
      fetchLocationName(location.lng, location.lat);
    }
  };

  const fetchLocationName = trackOperation('fetchLocationName', async (lng: number, lat: number) => {
    try {
      if (!MAPBOX_ACCESS_TOKEN) {
        logError(new Error("Mapbox token not configured"), { context: 'fetchLocationName' });
        return;
      }
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name?.split(',')[0] || 'Unknown location';
        setSearchedLocation(placeName);
        const suggestedName = `${placeName} Field`;
        if (!form.getValues("name")) {
          form.setValue("name", suggestedName);
        }
      }
    } catch (error) {
      logError(error as Error, { context: 'reverseGeocoding' });
      toast.error("Could not determine location name");
    }
  });

  const onSubmit = trackOperation('submitField', async (values: FormValues) => {
    try {
      if (!user?.id || !farmId) {
        throw new Error("Authentication error. Please log in again.");
      }
      if (!boundary) {
        toast.warning("Please draw your field boundary on the map");
        return;
      }
      
      setIsSubmitting(true);
      
            const boundaryWkt = `POLYGON((${boundary.coordinates.map((c: { lng: any; lat: any; }) => `${c.lng} ${c.lat}`).join(', ')}))`;

      const fieldData = {
        name: values.name,
        size: values.size,
        size_unit: values.size_unit,
        location_description: values.location_description,
        soil_type: values.soil_type,
        irrigation_type: values.irrigation_type,
        boundary: boundaryWkt,
        crop_type: values.crop_type,
        season: values.season,
        user_id: user.id,
        farm_id: farmId
      };
      
      const { data, error } = await supabase.from("fields").upsert(fieldData).select().single();
      
      if (error) throw error;
      
      logSuccess('field_created', { field_id: data.id });
      toast.success("Field added successfully");
      
      if (onSuccess && data) {
        onSuccess(data);
      } else {
        navigate("/fields");
      }
    } catch (error: any) {
      logError(error, { context: 'fieldCreation' });
      toast.error("Failed to add field", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ErrorBoundary>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Field Map</h3>
              <CardDescription>Draw your field boundary on the map.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              <Suspense fallback={<div>Loading map...</div>}>
                <MapboxFieldMap 
                  onBoundaryChange={setBoundary}
                  onLocationChange={handleLocationChange}
                  defaultLocation={defaultLocation}
                />
              </Suspense>
            </CardContent>
            <CardFooter className="pt-4">
              <p className="text-xs text-muted-foreground">
                {searchedLocation ? `Location: ${searchedLocation}` : "Draw a boundary to see location info."}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Field Information</h3>
              <CardDescription>Provide basic details for your new field.</CardDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} value={field.value ?? ''} />
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
                          <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
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
                name="crop_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Maize" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024 Short Rains" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Near the main road" {...field} value={field.value ?? ''} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="loamy">Loamy</SelectItem>
                          <SelectItem value="sandy">Sandy</SelectItem>
                          <SelectItem value="clay">Clay</SelectItem>
                          <SelectItem value="silty">Silty</SelectItem>
                          <SelectItem value="peaty">Peaty</SelectItem>
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
                      <FormLabel>Irrigation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select irrigation" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rainfed">Rainfed</SelectItem>
                          <SelectItem value="drip">Drip</SelectItem>
                          <SelectItem value="sprinkler">Sprinkler</SelectItem>
                          <SelectItem value="flood">Flood</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding Field..." : "Add Field"}
            </Button>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
}
