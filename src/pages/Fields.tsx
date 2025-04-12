
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, Farm } from "@/types/field";
import { Badge } from "@/components/ui/badge";
import { getAllFields, initOfflineSync, syncOfflineData } from "@/services/fieldService";
import AddFieldForm from "@/components/fields/AddFieldForm";
import { Loader2, Plus, RefreshCw, MapPin, Farm as FarmIcon, Droplets } from "lucide-react";
import { toast } from "sonner";

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const navigate = useNavigate();

  // Check online status
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

  // Get user and initialize
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUserId(data.user.id);
        initOfflineSync(data.user.id);
      } else {
        // Redirect to login if not authenticated
        navigate("/auth");
      }
    };
    
    getUser();
  }, [navigate]);

  // Load fields when user ID is available
  useEffect(() => {
    if (!userId) return;
    
    const loadFields = async () => {
      try {
        setLoading(true);
        const { data, error } = await getAllFields(userId);
        
        if (error) {
          toast.error("Failed to load fields", {
            description: error,
          });
          return;
        }
        
        setFields(data);
      } catch (err) {
        console.error("Error loading fields:", err);
        toast.error("Error", {
          description: "Failed to load your fields. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    const loadFarms = async () => {
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        setFarms(data || []);
      } catch (err) {
        console.error("Error loading farms:", err);
      }
    };
    
    loadFields();
    loadFarms();
  }, [userId]);

  // Handle sync button click
  const handleSync = async () => {
    if (!userId || !isOnline) return;
    
    try {
      setSyncing(true);
      const { success, error } = await syncOfflineData(userId);
      
      if (error) {
        toast.error("Sync failed", {
          description: error,
        });
        return;
      }
      
      if (success) {
        // Reload fields after sync
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

  // Handle field added
  const handleFieldAdded = (field: Field) => {
    setFields(prev => [field, ...prev]);
    setAddDialogOpen(false);
  };

  // Group fields by farm
  const fieldsByFarm: Record<string, Field[]> = {};
  
  // Initialize with "No Farm" category
  fieldsByFarm["no-farm"] = [];
  
  // Add all farms
  farms.forEach(farm => {
    fieldsByFarm[farm.id] = [];
  });
  
  // Group fields
  fields.forEach(field => {
    if (field.farm_id && fieldsByFarm[field.farm_id]) {
      fieldsByFarm[field.farm_id].push(field);
    } else {
      fieldsByFarm["no-farm"].push(field);
    }
  });

  // Find farm name by ID
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
            <h1 className="text-3xl font-bold">My Fields</h1>
            <p className="text-muted-foreground">Manage your fields and crops</p>
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
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <AddFieldForm 
                  farms={farms}
                  onSuccess={handleFieldAdded} 
                  onCancel={() => setAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div>
            {fields.length === 0 ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-center">No Fields Yet</CardTitle>
                  <CardDescription className="text-center">
                    Add your first field to start tracking your crops
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Field
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Fields</TabsTrigger>
                  <TabsTrigger value="by-farm">By Farm</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fields.map((field) => (
                      <FieldCard key={field.id} field={field} farmName={getFarmName(field.farm_id)} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="by-farm" className="space-y-6">
                  {/* Show fields grouped by farm */}
                  {Object.entries(fieldsByFarm).map(([farmId, farmFields]) => {
                    // Skip empty farms
                    if (farmFields.length === 0) return null;
                    
                    const farmName = farmId === "no-farm" 
                      ? "Independent Fields" 
                      : getFarmName(farmId);
                    
                    return (
                      <div key={farmId} className="space-y-2">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <FarmIcon className="h-5 w-5" />
                          {farmName}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {farmFields.map((field) => (
                            <FieldCard 
                              key={field.id} 
                              field={field} 
                              farmName={getFarmName(field.farm_id)}
                              hideFarmName
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// Field Card Component
interface FieldCardProps {
  field: Field;
  farmName: string;
  hideFarmName?: boolean;
}

function FieldCard({ field, farmName, hideFarmName = false }: FieldCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/fields/${field.id}`);
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{field.name}</CardTitle>
        {!hideFarmName && (
          <CardDescription>{farmName}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            {field.location_description || "No location details"}
          </div>
          
          <div className="flex items-center text-sm">
            <Droplets className="h-4 w-4 mr-2 text-muted-foreground" />
            {field.irrigation_type || "No irrigation info"}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Size:</span> {field.size} {field.size_unit}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {field.is_synced === false && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              Not Synced
            </Badge>
          )}
        </div>
        
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/fields/${field.id}`);
        }}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
