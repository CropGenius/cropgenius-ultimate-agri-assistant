
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { getFieldById, deleteField } from "@/services/fieldService";
import { getFieldInsights, FieldInsight } from "@/services/fieldAIService";
import { Field, FieldCrop, FieldHistory } from "@/types/field";
import { Loader2, Calendar, Trash2, Edit, ArrowLeft, MapPin, Leaf, AlertTriangle, Sprout, BarChart3, Droplets } from "lucide-react";
import FieldMap from "@/components/fields/FieldMap";

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<FieldCrop[]>([]);
  const [history, setHistory] = useState<FieldHistory[]>([]);
  const [insights, setInsights] = useState<FieldInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        navigate("/auth");
      }
    };
    
    getUser();
  }, [navigate]);

  // Load field data
  useEffect(() => {
    if (!id || !userId) return;
    
    const loadField = async () => {
      try {
        setLoading(true);
        const { data, error } = await getFieldById(id);
        
        if (error || !data) {
          toast.error("Could not load field", {
            description: error || "Field not found"
          });
          navigate("/fields");
          return;
        }
        
        setField(data);
        
        // Load crops for this field
        const { data: cropData, error: cropError } = await supabase
          .from('field_crops')
          .select('*')
          .eq('field_id', id)
          .order('planting_date', { ascending: false });
        
        if (cropError) {
          console.error("Error loading crop data:", cropError);
        } else {
          setCrops(cropData || []);
        }
        
        // Load history for this field
        const { data: historyData, error: historyError } = await supabase
          .from('field_history')
          .select('*')
          .eq('field_id', id)
          .order('date', { ascending: false });
        
        if (historyError) {
          console.error("Error loading history data:", historyError);
        } else {
          setHistory(historyData || []);
        }
      } catch (err) {
        console.error("Error loading field details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadField();
  }, [id, userId, navigate]);

  // Load AI insights
  useEffect(() => {
    if (!field || !userId || !isOnline) return;
    
    const loadInsights = async () => {
      try {
        setInsightsLoading(true);
        
        // Prepare crop history data for the AI
        const cropHistory = crops.map(crop => ({
          crop_name: crop.crop_name,
          planting_date: crop.planting_date || new Date().toISOString().split('T')[0],
          harvest_date: crop.harvest_date
        }));
        
        const { data, error } = await getFieldInsights({
          field_id: field.id,
          user_id: userId,
          soil_type: field.soil_type || undefined,
          crop_history: cropHistory.length > 0 ? cropHistory : undefined
        });
        
        if (error) {
          console.error("Error loading field insights:", error);
          return;
        }
        
        if (data) {
          setInsights(data);
        }
      } catch (err) {
        console.error("Error loading AI insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };
    
    loadInsights();
  }, [field, crops, userId, isOnline]);

  // Handle field deletion
  const handleDeleteField = async () => {
    if (!field) return;
    
    try {
      const { error } = await deleteField(field.id);
      
      if (error) {
        toast.error("Failed to delete field", {
          description: error
        });
        return;
      }
      
      toast.success("Field deleted", {
        description: `${field.name} has been deleted`
      });
      
      navigate("/fields");
    } catch (err) {
      console.error("Error deleting field:", err);
      toast.error("Error", {
        description: "An unexpected error occurred while deleting the field"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified";
    
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </Layout>
    );
  }

  if (!field) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <h1>Field not found</h1>
          <Button onClick={() => navigate("/fields")} className="mt-4">
            Back to Fields
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with back button and actions */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/fields")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fields
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/fields/${field.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-lg font-bold mb-4">Delete Field</h2>
                <p>Are you sure you want to delete {field.name}? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteField}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Field summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">{field.name}</CardTitle>
              <CardDescription>
                {field.size} {field.size_unit} • {field.soil_type || "Soil type not specified"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="text-base flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {field.location_description || "No location details provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Irrigation</h3>
                  <p className="text-base flex items-center mt-1">
                    <Droplets className="h-4 w-4 mr-2 text-primary" />
                    {field.irrigation_type || "Not specified"}
                  </p>
                </div>
              </div>
              
              {field.boundary && (
                <div className="mt-4 border rounded-md overflow-hidden h-[200px]">
                  <FieldMap initialBoundary={field.boundary} readOnly />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* AI Insights Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-green-600" />
                AI Farm Insights
              </CardTitle>
              {!isOnline && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Offline - Limited AI</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : insights ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Yield Potential</h3>
                    <div className="flex items-center">
                      <Progress 
                        value={insights.yield_potential.estimate * 100} 
                        className="h-2 flex-1 mr-2"
                      />
                      <span className="text-sm font-medium">
                        {Math.round(insights.yield_potential.estimate * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Disease Risk</h3>
                    {insights.disease_risks.risks.map((risk, index) => (
                      <div key={index} className="flex justify-between items-center mb-1 text-sm">
                        <span>{risk.disease}</span>
                        <Badge 
                          variant={risk.risk > 0.5 ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {risk.risk > 0.7 ? 'High' : risk.risk > 0.3 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Top Task</h3>
                    {insights.tasks.suggestions.length > 0 && (
                      <p className="text-sm">
                        {insights.tasks.suggestions[0]}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? "AI insights are being generated..."
                    : "Connect to the internet to get AI insights"}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={!insights || !isOnline}
                onClick={() => {}}
              >
                View Full AI Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Tabs for field details */}
        <Tabs defaultValue="crops" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="ai-analysis" disabled={!insights || !isOnline}>
              AI Analysis
            </TabsTrigger>
          </TabsList>
          
          {/* Crops Tab */}
          <TabsContent value="crops" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Crops</h2>
              <Button size="sm" onClick={() => navigate(`/fields/${field.id}/add-crop`)}>
                Add Crop
              </Button>
            </div>
            
            {crops.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No crops recorded</CardTitle>
                  <CardDescription>
                    Add crops to this field to track planting, harvest, and yields
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button 
                    onClick={() => navigate(`/fields/${field.id}/add-crop`)}
                    className="mt-2"
                  >
                    Add Your First Crop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map(crop => (
                  <Card key={crop.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{crop.crop_name}</CardTitle>
                          {crop.variety && (
                            <CardDescription>{crop.variety}</CardDescription>
                          )}
                        </div>
                        <Badge
                          className={
                            crop.status === 'active' ? 'bg-green-100 text-green-800' :
                            crop.status === 'harvested' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {crop.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Planted</p>
                          <p>{formatDate(crop.planting_date)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Harvested</p>
                          <p>{formatDate(crop.harvest_date)}</p>
                        </div>
                        {crop.yield_amount && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Yield</p>
                            <p className="font-medium">
                              {crop.yield_amount} {crop.yield_unit}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t flex justify-end py-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/fields/${field.id}/crop/${crop.id}`)}
                      >
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Field History</h2>
              <Button size="sm" onClick={() => navigate(`/fields/${field.id}/add-event`)}>
                Add Event
              </Button>
            </div>
            
            {history.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No history records</CardTitle>
                  <CardDescription>
                    Record planting, harvesting, treatments and other field activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button 
                    onClick={() => navigate(`/fields/${field.id}/add-event`)}
                    className="mt-2"
                  >
                    Record First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {history.map((event, index) => (
                      <div key={event.id} className="relative">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                              {event.event_type === 'planting' ? (
                                <Sprout className="h-4 w-4" />
                              ) : event.event_type === 'harvest' ? (
                                <Calendar className="h-4 w-4" />
                              ) : event.event_type === 'treatment' ? (
                                <Droplets className="h-4 w-4" />
                              ) : event.event_type === 'inspection' ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <BarChart3 className="h-4 w-4" />
                              )}
                            </div>
                            {index < history.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-baseline justify-between">
                              <h3 className="font-medium">{event.description}</h3>
                              <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                            </div>
                            {event.notes && (
                              <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-4 pt-4">
            {!insights ? (
              <div className="flex justify-center items-center py-12">
                {insightsLoading ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Generating AI insights...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p>Connect to the internet to get AI insights</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crop Rotation Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sprout className="h-5 w-5 mr-2 text-green-600" />
                      Crop Rotation Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{insights.crop_rotation.reasoning}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {insights.crop_rotation.suggestions.map((crop, i) => (
                        <Badge key={i} variant="outline" className="py-2 px-3 justify-center">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Disease Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Disease Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      For current crop: <span className="font-medium">{insights.disease_risks.current_crop || 'No crop planted'}</span>
                    </p>
                    <div className="space-y-4">
                      {insights.disease_risks.risks.map((risk, i) => (
                        <div key={i} className="relative">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{risk.disease}</p>
                            <Badge 
                              variant={risk.risk > 0.5 ? "destructive" : "outline"}
                            >
                              {risk.risk > 0.7 ? 'High Risk' : risk.risk > 0.3 ? 'Medium Risk' : 'Low Risk'}
                            </Badge>
                          </div>
                          <Progress 
                            value={risk.risk * 100} 
                            className={`h-2 mt-2 ${
                              risk.risk > 0.7 ? 'bg-red-100' : 
                              risk.risk > 0.3 ? 'bg-amber-100' : 
                              'bg-green-100'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Soil Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      Soil Health Recommendations
                    </CardTitle>
                    <CardDescription>Soil type: {insights.soil_health.soil_type || "Unknown"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {insights.soil_health.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Task Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Recommended Tasks
                    </CardTitle>
                    <CardDescription>
                      Priority: 
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${
                          insights.tasks.priority_level === 'high' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {insights.tasks.priority_level === 'high' ? 'High Priority' : 'Normal'}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.tasks.suggestions.map((task, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">{i + 1}</span>
                          </div>
                          <span className="text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-sm"
                      onClick={() => {}}
                    >
                      Add to Tasks
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Yield Potential */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Yield Potential Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span>Estimated Yield Potential</span>
                        <span className="font-medium">{Math.round(insights.yield_potential.estimate * 100)}%</span>
                      </div>
                      <Progress 
                        value={insights.yield_potential.estimate * 100} 
                        className="h-3"
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Contributing Factors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.yield_potential.factors.map((factor, i) => (
                          <div key={i} className="flex justify-between items-center border rounded-md p-3">
                            <span className="text-sm capitalize">{factor.factor.replace('_', ' ')}</span>
                            <Badge 
                              variant={
                                factor.impact === 'positive' 
                                  ? 'outline' 
                                  : factor.impact === 'negative' 
                                    ? 'destructive' 
                                    : 'secondary'
                              }
                              className={factor.impact === 'positive' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            >
                              {factor.impact}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
