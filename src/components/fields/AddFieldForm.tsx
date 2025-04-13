
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import MapboxFieldMap from "./MapboxFieldMap";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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

// The original component has title hardcoded here, but we're fixing the error by using the proper pattern
export default function AddFieldForm({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const [boundary, setBoundary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldLocation, setFieldLocation] = useState<{ lat: number; lng: number } | null>(null);
  
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

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Creating field with values:", values);
      
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
      
      console.log("Inserting field data:", fieldData);
      
      const { data: field, error } = await supabase
        .from("fields")
        .insert(fieldData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating field:", error);
        throw error;
      }
      
      console.log("Field created successfully:", field);
      
      toast.success("Field added successfully", {
        description: `${values.name} has been added to your farm`
      });
      
      // Call onSuccess callback or navigate away
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/fields");
      }
    } catch (error: any) {
      console.error("Error creating field:", error);
      toast.error("Failed to add field", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:gap-8">
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
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Field Location</h3>
              <CardDescription>Draw your field boundaries on the map</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 md:h-96 w-full rounded-md overflow-hidden border">
                <MapboxFieldMap 
                  onBoundaryChange={setBoundary}
                  onLocationChange={setFieldLocation}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use the drawing tools to outline your field, or click "Use My Location" to mark your current position
              </p>
            </CardContent>
          </Card>
          
          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding Field..." : "Add Field"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </Form>
  );
}
