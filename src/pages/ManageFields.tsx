
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Tractor, MapPin, Droplets, Trash2, Edit, Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Field, Farm } from "@/types/field";
import { getAllFields, deleteField, syncOfflineData, initOfflineSync } from "@/services/fieldService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import AddFieldForm from "@/components/fields/AddFieldForm";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ManageFields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUserId(data.user.id);
        initOfflineSync(data.user.id);
      } else {
        navigate("/auth");
      }
    };
    
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const { data: fieldsData, error: fieldsError } = await getAllFields(userId);
        
        if (fieldsError) {
          throw new Error(fieldsError);
        }
        
        setFields(fieldsData || []);
        
        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', userId);
        
        if (farmsError) throw farmsError;
        setFarms(farmsData || []);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Error", {
          description: "Failed to load your fields. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId]);

  const handleFieldAdded = (field: Field) => {
    setFields(prev => [field, ...prev]);
    setAddDialogOpen(false);
    toast.success("Field added successfully", {
      description: `${field.name} has been added to your farm.`
    });
  };

  const handleDelete = async () => {
    if (!fieldToDelete) return;
    
    try {
      const { error } = await deleteField(fieldToDelete.id);
      
      if (error) throw new Error(error);
      
      setFields(prev => prev.filter(f => f.id !== fieldToDelete.id));
      toast.success("Field deleted", {
        description: `${fieldToDelete.name} has been removed.`
      });
    } catch (err) {
      console.error("Error deleting field:", err);
      toast.error("Delete failed", {
        description: "There was a problem deleting this field."
      });
    } finally {
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const handleSync = async () => {
    if (!userId || !isOnline) return;
    
    try {
      setSyncing(true);
      const { success, error } = await syncOfflineData(userId);
      
      if (error) throw new Error(error);
      
      if (success) {
        const { data } = await getAllFields(userId);
        setFields(data);
        
        toast.success("Sync complete", {
          description: "Your field data has been synchronized.",
        });
      }
    } catch (err) {
      console.error("Error during sync:", err);
      toast.error("Sync error", {
        description: "An unexpected error occurred during synchronization.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const confirmDelete = (field: Field) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const viewFieldDetails = (fieldId: string) => {
    navigate(`/fields/${fieldId}`);
  };

  const viewFieldInsights = (fieldId: string) => {
    navigate(`/fields/${fieldId}/insights`);
  };

  const getFarmName = (farmId: string | null) => {
    if (!farmId) return "Independent Field";
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Fields</h1>
            <p className="text-muted-foreground">
              Manage your farm fields and track crop performance
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isOnline && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                Offline Mode
              </Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync} 
              disabled={!isOnline || syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync
            </Button>
            
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : fields.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">No Fields Yet</CardTitle>
              <div className="text-center text-muted-foreground">
                Add your first field to start tracking your crops and receive AI-powered insights
              </div>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button 
                size="lg" 
                onClick={() => setAddDialogOpen(true)}
                className="animate-pulse"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Your First Field
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <Card 
                key={field.id} 
                className="hover:shadow-md transition-all border-2 hover:border-primary/50"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{field.name}</span>
                    {field.is_synced === false && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Not Synced
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Tractor className="h-4 w-4" />
                    {getFarmName(field.farm_id)}
                  </p>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {field.location_description || "No location details"}
                    </div>
                    <div className="flex items-center text-sm">
                      <Droplets className="h-4 w-4 mr-2 text-muted-foreground" />
                      {field.irrigation_type || "No irrigation info"}
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Size:</span> {field.size} {field.size_unit}
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => viewFieldDetails(field.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewFieldInsights(field.id)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Brain className="h-4 w-4 mr-1" /> AI Insights
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => confirmDelete(field)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Field Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>
              Add field details to receive AI-powered insights for better farming decisions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <AddFieldForm 
                farms={farms}
                onSuccess={handleFieldAdded} 
                onCancel={() => setAddDialogOpen(false)} 
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fieldToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
