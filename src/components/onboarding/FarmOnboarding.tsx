
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Tractor, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  size: z.coerce.number().positive("Size must be a positive number").optional(),
  size_unit: z.string().default("hectares"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FarmOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [farmCreated, setFarmCreated] = useState(false);
  const [createdFarmId, setCreatedFarmId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      size: undefined,
      size_unit: "hectares",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      const { data: farm, error } = await supabase.from("farms").insert({
        name: values.name,
        location: values.location,
        total_size: values.size || null,
        size_unit: values.size_unit,
        user_id: userData.user.id,
      }).select().single();
      
      if (error) throw error;
      
      toast.success("Farm registered successfully");
      setFarmCreated(true);
      setCreatedFarmId(farm.id);
      
      // Save onboarding state
      localStorage.setItem("farm_onboarding_completed", "true");
      
    } catch (error: any) {
      console.error("Error creating farm:", error);
      toast.error("Error", {
        description: error.message || "Failed to register farm",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFieldNow = () => {
    // Store that user chose to add field immediately
    localStorage.setItem("add_field_after_farm", "true");
    navigate("/fields", { state: { farmId: createdFarmId } });
  };

  const handleSkipAddField = () => {
    // Store that user skipped adding field
    localStorage.setItem("add_field_after_farm", "skipped");
    localStorage.setItem("should_remind_add_field", "true");
    navigate("/");
    
    // Show reminder toast
    setTimeout(() => {
      toast("Remember to add your fields", {
        description: "Adding field data helps CROPGenius provide personalized AI insights",
        duration: 6000,
        action: {
          label: "Add Fields",
          onClick: () => navigate("/manage-fields"),
        },
      });
    }, 3000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tractor className="h-5 w-5 text-primary" />
          {farmCreated ? "Farm Registered" : "Register Your Farm"}
        </CardTitle>
      </CardHeader>
      
      {!farmCreated ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your farm name" {...field} />
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
                    <FormLabel>Location/Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nairobi County" {...field} />
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
                      <FormLabel>Farm Size (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Size" 
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
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register Farm"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <div className="animate-fade-in">
          <CardContent className="space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium mb-1">Farm registered successfully!</h3>
              <p className="text-sm">Add your fields now to unlock AI support for weather, disease, and planning.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddFieldNow}
                className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <span>Yes, Add Field Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={handleSkipAddField}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <span>Skip (I'll add later)</span>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="p-3 max-w-xs">
                    <p>AI requires field data to activate personalized insights for weather, disease prevention, and yield optimization.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}
