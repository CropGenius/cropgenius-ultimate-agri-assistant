
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, MapPin, PlusCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Field } from "@/types/field";
import { supabase } from "@/integrations/supabase/client";
import { getAllFields } from "@/services/fieldService";

interface YourFarmButtonProps {
  buttonText?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export default function YourFarmButton({ 
  buttonText = "View Your Farm", 
  variant = "outline",
  size = "default"
}: YourFarmButtonProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!userId || !dialogOpen) return;
    
    const loadFields = async () => {
      setLoading(true);
      try {
        const { data, error } = await getAllFields(userId);
        
        if (error) throw new Error(error);
        setFields(data || []);
      } catch (err) {
        console.error("Error loading fields:", err);
        toast.error("Could not load your fields");
      } finally {
        setLoading(false);
      }
    };
    
    loadFields();
  }, [userId, dialogOpen]);

  const handleClick = () => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    
    setDialogOpen(true);
  };

  const handleAddField = () => {
    setDialogOpen(false);
    navigate("/manage-fields", { state: { showAddDialog: true } });
  };

  const viewFieldDetails = (fieldId: string) => {
    setDialogOpen(false);
    navigate(`/fields/${fieldId}`);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick}>
        <MapPin className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Your Farm Weather</DialogTitle>
            <DialogDescription>
              View personalized weather insights for your specific fields
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : fields.length === 0 ? (
            <div className="space-y-6 py-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium mb-1">No fields found</h3>
                <p className="text-sm">To deliver precise weather intelligence, we need your field location data.</p>
              </div>
              
              <Button 
                onClick={handleAddField}
                className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 animate-pulse"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Field Now</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
              {fields.map((field) => (
                <Card
                  key={field.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => viewFieldDetails(field.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{field.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {field.location_description || "No location details"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2 border-dashed" 
                onClick={handleAddField}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Field
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
