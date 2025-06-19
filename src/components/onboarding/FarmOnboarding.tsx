
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { Database } from "@/types/supabase";

const farmSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  total_size: z.coerce.number().positive("Size must be a positive number"),
  size_unit: z.string().default("hectares"),
});

type FarmFormValues = z.infer<typeof farmSchema>;

export default function FarmOnboarding() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      location: "",
      total_size: 1,
      size_unit: "hectares",
    },
  });

  const onSubmit = async (values: FarmFormValues) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to create a farm",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Type-safe farm data for Supabase insert
      const farmData: Database['public']['Tables']['farms']['Insert'] = {
        name: values.name,
        location: values.location,
        total_size: values.total_size,
        size_unit: values.size_unit,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("farms")
        .insert(farmData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data && data.id) {
        // Store farm ID in localStorage
        localStorage.setItem("farmId", data.id);
        window.location.reload(); // Reload to update auth context

        toast.success("Farm created successfully", {
          description: `${values.name} has been set up and is ready to use`,
        });
      }
    } catch (error: any) {
      toast.error("Failed to create farm", {
        description: error.message || "An unexpected error occurred",
      });
      console.error("Farm creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Farm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Village, District, Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Size</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Farm..." : "Create Farm"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
