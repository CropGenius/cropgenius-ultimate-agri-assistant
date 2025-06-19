import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/services/supabaseClient";
import { Field, FieldCrop, FieldHistory } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getFieldById, deleteField } from "@/services/fieldService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, MapPin, Trash2, Edit, ArrowLeft, Calendar, Droplets, Tractor, Leaf, History, Check, AlertCircle, RefreshCw, Zap } from "lucide-react";
import FieldMap from "@/components/fields/FieldMap";
import { analyzeField, getFieldRecommendations, checkFieldRisks } from "@/services/fieldAIService";

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [crops, setCrops] = useState<FieldCrop[]>([]);
  const [history, setHistory] = useState<FieldHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [farmName, setFarmName] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [risks, setRisks] = useState<any>({ hasRisks: false, risks: [] });
  const [loadingRisks, setLoadingRisks] = useState(false);

  useEffect(() => {
    if (id) {
      loadField();
    }
  }, [id]);

  const loadAIInsights = async (fieldId: string) => {
    setLoadingInsights(true);
    try {
      const recommendations = await getFieldRecommendations(fieldId);
      setInsights(recommendations);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoadingInsights(false);
    }
    
    setLoadingRisks(true);
    try {
      const fieldRisks = await checkFieldRisks(fieldId);
      setRisks(fieldRisks);
    } catch (error) {
      console.error("Failed to load risks:", error);
    } finally {
      setLoadingRisks(false);
    }
  };

  const loadField = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Get field data
      const { data, error } = await getFieldById(id);
      
      if (error || !data) {
        toast.error("Error", {
          description: error || "Field not found",
        });
        navigate("/fields");
        return;
      }
      
      setField(data);
      
      // Get farm name if field belongs to a farm
      if (data.farm_id) {
        const { data: farmData } = await supabase
          .from('farms')
          .select('name')
          .eq('id', data.farm_id)
          .single();
          
        if (farmData) {
          setFarmName(farmData.name);
        }
      }
      
      // Get crops for this field
      const { data: cropsData } = await supabase
        .from('field_crops')
        .select('*')
        .eq('field_id', id)
        .order('planting_date', { ascending: false });
        
      setCrops(cropsData || []);
      
      // Get field history
      const { data: historyData } = await supabase
        .from('field_history')
        .select('*')
        .eq('field_id', id)
        .order('date', { ascending: false });
        
      setHistory(historyData || []);
      
      if (data) {
        loadAIInsights(data.id);
      }
    } catch (err) {
      console.error("Error loading field:", err);
      toast.error("Error", {
        description: "Failed to load field data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!field) return;
    
    try {
      setDeleting(true);
      const { error } = await deleteField(field.id);
      
      if (error) {
        throw new Error(error);
      }
      
      toast.success("Field deleted", {
        description: "The field has been successfully deleted",
      });
      
      navigate("/fields");
    } catch (err) {
      console.error("Error deleting field:", err);
      toast.error("Error", {
        description: "Failed to delete field",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const renderFieldDetailsSection = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{field?.name}</CardTitle>
            <CardDescription>
              {farmName ? `Part of ${farmName}` : "Independent Field"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/fields/${field?.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </a>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Field Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Size:</div>
                <div>{field?.size} {field?.size_unit}</div>
                
                <div className="text-muted-foreground">Soil Type:</div>
                <div>{field?.soil_type || "Not specified"}</div>
                
                <div className="text-muted-foreground">Irrigation:</div>
                <div>{field?.irrigation_type || "Not specified"}</div>
                
                <div className="text-muted-foreground">Location:</div>
                <div>{field?.location_description || "No description"}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Current Crops</h3>
              {crops.length > 0 ? (
                <div className="space-y-2">
                  {crops.filter(crop => crop.status === 'active').slice(0, 3).map(crop => (
                    <div key={crop.id} className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{crop.crop_name}</span>
                      {crop.variety && (
                        <Badge variant="outline" className="text-xs">
                          {crop.variety}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {crops.filter(crop => crop.status === 'active').length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{crops.filter(crop => crop.status === 'active').length - 3} more crops
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active crops recorded
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Recent Activity</h3>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-start gap-2">
                      <History className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm">{event.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No activity recorded
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden h-[300px]">
            {field?.boundary ? (
              <FieldMap initialBoundary={field.boundary} readOnly />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/30">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>No boundary data available</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/fields")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Fields
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/fields/${field?.id}/crops/add`}>
                <Leaf className="h-4 w-4 mr-1" />
                Add Crop
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/fields/${field?.id}/history/add`}>
                <Calendar className="h-4 w-4 mr-1" />
                Log Activity
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAIInsightsSection = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          AI Field Insights
        </CardTitle>
        <CardDescription>
          CROPGenius AI analysis and recommendations for your field
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingInsights ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {insights.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations:</h3>
                  <ul className="space-y-2">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="h-4 w-4 text-primary mt-1" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {risks.hasRisks && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Risk Assessment:</h3>
                    {loadingRisks ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {risks.risks.map((risk: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 border rounded-md">
                            <AlertCircle className={`h-4 w-4 mt-0.5 ${
                              risk.likelihood === 'high' ? 'text-destructive' : 
                              risk.likelihood === 'medium' ? 'text-orange-500' : 'text-green-500'
                            }`} />
                            <div>
                              <h4 className="text-sm font-medium">{risk.name}</h4>
                              <p className="text-xs text-muted-foreground">{risk.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No insights available yet. AI analysis may still be processing.
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => loadAIInsights(field?.id || '')}
              disabled={!field || loadingInsights}
            >
              {loadingInsights ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Analysis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate("/fields")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Fields
          </Button>
          <h1 className="text-2xl font-bold">{field?.name || "Field Details"}</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {renderFieldDetailsSection()}
            {renderAIInsightsSection()}
            
            <Tabs defaultValue="crops" className="mt-6">
              <TabsList>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="crops" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Field Crops</CardTitle>
                      <Button size="sm" asChild>
                        <a href={`/fields/${field?.id}/crops/add`}>
                          <Leaf className="h-4 w-4 mr-1" />
                          Add Crop
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {crops.length > 0 ? (
                      <div className="space-y-4">
                        {crops.map(crop => (
                          <div key={crop.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-500" />
                                  {crop.crop_name}
                                  {crop.variety && (
                                    <Badge variant="outline" className="ml-2">
                                      {crop.variety}
                                    </Badge>
                                  )}
                                </h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Status: {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                                </div>
                              </div>
                              <Badge 
                                variant={
                                  crop.status === 'active' ? 'default' : 
                                  crop.status === 'harvested' ? 'outline' : 'secondary'
                                }
                              >
                                {crop.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                              <div className="text-muted-foreground">Planted:</div>
                              <div>{crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : "Not recorded"}</div>
                              
                              <div className="text-muted-foreground">Harvest:</div>
                              <div>{crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString() : "Not harvested"}</div>
                              
                              {crop.yield_amount && (
                                <>
                                  <div className="text-muted-foreground">Yield:</div>
                                  <div>{crop.yield_amount} {crop.yield_unit}</div>
                                </>
                              )}
                            </div>
                            
                            {crop.notes && (
                              <div className="mt-3 text-sm">
                                <div className="text-muted-foreground">Notes:</div>
                                <div className="mt-1">{crop.notes}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <h3 className="text-lg font-medium mb-1">No Crops Added Yet</h3>
                        <p className="mb-4">Start tracking your crops to get insights and recommendations</p>
                        <Button asChild>
                          <a href={`/fields/${field?.id}/crops/add`}>
                            Add Your First Crop
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Field History</CardTitle>
                      <Button size="sm" asChild>
                        <a href={`/fields/${field?.id}/history/add`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Log Activity
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {history.length > 0 ? (
                      <div className="space-y-1">
                        {history.map(event => (
                          <div key={event.id} className="flex py-3 border-b last:border-0">
                            <div className="w-24 shrink-0 text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.event_type}
                                </Badge>
                                <h4 className="text-sm font-medium">{event.description}</h4>
                              </div>
                              {event.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <h3 className="text-lg font-medium mb-1">No History Recorded</h3>
                        <p className="mb-4">Track activities like planting, treatments, and inspections</p>
                        <Button asChild>
                          <a href={`/fields/${field?.id}/history/add`}>
                            Log Your First Activity
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this field and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default FieldDetail;
