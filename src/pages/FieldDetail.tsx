import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Field, FieldCrop, FieldHistory } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getFieldById, deleteField } from "@/services/fieldService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, MapPin, Trash2, Edit, ArrowLeft, Calendar, Droplets, Tractor, Leaf, History, Check, AlertCircle, RefreshCw, Zap, Camera, Upload, BarChart, WifiOff, ScanLine, BarChart3 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import FieldMap from "@/components/fields/FieldMap";
import { analyzeField, getFieldRecommendations, checkFieldRisks } from "@/services/fieldAIService";
import { useCropScanAgent } from "@/hooks/agents/useCropScanAgent";
import { useYieldPredictorAgent } from "@/hooks/agents/useYieldPredictorAgent";
import { FieldDetailErrorBoundary, CropScanErrorBoundary, YieldPredictionErrorBoundary } from "@/components/ErrorBoundary";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { Input } from "@/components/ui/input";
import diagnostics from "@/utils/diagnosticService";
import { useFarm } from "@/hooks/useFarm";

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isOffline = useOfflineStatus();
  const { selectedFarm } = useFarm();
  
  // Field data state
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

  // Crop scan state
  const [cropScanImage, setCropScanImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use specialized agent hooks directly
  const {
    performCropScan,
    scanResult,
    isLoading: isCropScanLoading,
    error: cropScanError,
    recentScans
  } = useCropScanAgent();
  
  const {
    predictYield,
    prediction: yieldPrediction,
    isLoading: isYieldPredictionLoading,
    error: yieldPredictionError,
    saveYieldPrediction
  } = useYieldPredictorAgent();

  useEffect(() => {
    if (id) {
      loadField();
    }
  }, [id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCropScanImage(event.target.files[0]);
    }
  };

  const handlePerformCropScan = async () => {
    if (!cropScanImage || !field) {
      toast.error("Please select an image and ensure field data is loaded.");
      return;
    }
    if (isOffline) {
      toast.info("Crop scan requires an internet connection.");
      return;
    }
    try {
      // Get the active crop if available for metadata
      const activeCrop = crops.find(crop => crop.status === 'active');
      
      // CropScanInput only requires imageFile and fieldId; cropType is not an expected property
      const result = await performCropScan({
        imageFile: cropScanImage,
        fieldId: field.id,
        // The hook will automatically add userId and farmId from context
      });
      
      if (result) {
        toast.success("Crop scan successful!");
        // The scanResult state is updated within the hook
      } else {
        toast.error("Crop scan failed. Please check logs.");
      }
    } catch (err) {
      diagnostics.logError(err instanceof Error ? err : new Error('Crop scan UI error'), {
        source: 'FieldDetail.handlePerformCropScan',
        context: { fieldId: field.id }
      });
      toast.error("An error occurred during crop scan.");
    }
  };

  const handlePredictYield = async () => {
    if (!field) {
      toast.error("Field data not loaded.");
      return;
    }
    if (isOffline) {
      toast.info("Yield prediction requires an internet connection.");
      return;
    }
    try {
      // Get the active crop if available for better crop type and planting date information
      const activeCrop = crops.find(crop => crop.status === 'active');
      const cropType = activeCrop?.crop_name || 'unknown';
      // Convert string date to Date object as required by YieldPredictionInput
      const plantingDate = activeCrop?.planting_date 
        ? new Date(activeCrop.planting_date) 
        : new Date();
      
      // YieldPredictionInput requires weatherData property
      const result = await predictYield({
        fieldId: field.id,
        cropType: cropType,
        plantingDate: plantingDate,
        // Add required weatherData (empty but meeting the type requirements)
        weatherData: {
          current: null,
          forecast: null
        },
        // Optional soil data from field.soil_type if available
        soilData: field.soil_type ? { ph: undefined } : null
      });
      
      if (result) {
        toast.success("Yield prediction generated!");
        // The yieldPrediction state is updated within the hook
      } else {
        toast.error("Yield prediction failed. Please check logs.");
      }
    } catch (err) {
      diagnostics.logError(err instanceof Error ? err : new Error('Yield prediction UI error'), {
        source: 'FieldDetail.handlePredictYield',
        context: { fieldId: field.id }
      });
      toast.error("An error occurred during yield prediction.");
    }
  };

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

  if (isOffline) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center h-[calc(100vh-150px)]">
          <Card className="w-full max-w-md border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="h-6 w-6 text-yellow-500" />
                You are Offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>This page requires an internet connection to load field details and perform AI analyses. Please check your connection and try again.</p>
              <p className="text-sm text-muted-foreground mt-2">Some cached data might be displayed if available.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <FieldDetailErrorBoundary>
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

            {/* Crop Scan Analysis Section */}
            <CropScanErrorBoundary>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-primary" />
                    Crop Scan Analysis
                  </CardTitle>
                  <CardDescription>
                    Upload an image of your crops for AI-powered health and issue detection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cropImage">Upload Crop Image</Label>
                      <Input id="cropImage" type="file" accept="image/*" onChange={handleImageChange} className="mt-1" ref={fileInputRef} />
                      {cropScanImage && <p className="text-sm text-muted-foreground mt-1">Selected: {cropScanImage.name}</p>}
                    </div>
                    <Button onClick={handlePerformCropScan} disabled={isCropScanLoading || !cropScanImage || isOffline} className="w-full">
                      {isCropScanLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanLine className="h-4 w-4 mr-2" />}
                      Perform Crop Scan
                    </Button>
                    {cropScanError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Scan Error</AlertTitle>
                        <AlertDescription>{cropScanError.message || "An unknown error occurred during crop scan."}</AlertDescription>
                      </Alert>
                    )}
                    {scanResult && (
                      <div className="mt-4 p-4 border rounded-md bg-muted/30">
                        <h4 className="font-medium mb-2">Scan Result:</h4>
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(scanResult, null, 2)}</pre>
                        {/* TODO: Enhance display of scanResult object */}
                      </div>
                    )}
                    {recentScans && recentScans.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Scans:</h4>
                        <ul className="space-y-2">
                          {recentScans.slice(0,3).map(scan => (
                            <li key={scan.id} className="text-xs p-2 border rounded-md">
                              <div className="font-medium">
                                {new Date(scan.scan_date).toLocaleDateString()} - {scan.health_status}
                              </div>
                              {scan.analysis_summary && (
                                <div className="mt-1 text-muted-foreground truncate">
                                  {scan.analysis_summary}
                                </div>
                              )}
                              {scan.health_score !== undefined && (
                                <div className="mt-1">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Health Score:</span>
                                    <span className="font-medium">{scan.health_score.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={scan.health_score} className="h-1.5" />
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CropScanErrorBoundary>

            {/* Yield Prediction Section */}
            <YieldPredictionErrorBoundary>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Yield Prediction
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered yield estimates based on field data and conditions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={handlePredictYield} disabled={isYieldPredictionLoading || !field || isOffline} className="w-full">
                      {isYieldPredictionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                      Predict Yield
                    </Button>
                    {yieldPredictionError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Prediction Error</AlertTitle>
                        <AlertDescription>{yieldPredictionError.message || "An unknown error occurred during yield prediction."}</AlertDescription>
                      </Alert>
                    )}
                    {yieldPrediction && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Predicted Yield:</span>
                          <span className="font-semibold">{yieldPrediction.predictedYieldKgPerHa.toFixed(2)} kg/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Confidence:</span>
                          <span className="font-semibold">{(yieldPrediction.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium">Key Factors:</span>
                          <div className="text-sm space-y-1">
                            <div>🌦️ Weather: {yieldPrediction.keyFactors.weatherImpact}</div>
                            <div>🌱 Soil: {yieldPrediction.keyFactors.soilImpact}</div>
                            <div>🌿 Health: {yieldPrediction.keyFactors.healthImpact}</div>
                            <div>👨‍🌾 Management: {yieldPrediction.keyFactors.managementImpact}</div>
                          </div>
                        </div>
                        {yieldPrediction.recommendations?.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                            <ul className="text-sm space-y-1 list-disc pl-5">
                              {yieldPrediction.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </YieldPredictionErrorBoundary>
            
            <Tabs defaultValue="history" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
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
              
              <TabsContent value="analytics" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Field performance and analytics will be shown here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <h3 className="text-lg font-medium mb-1">Analytics Coming Soon</h3>
                      <p>Detailed field analytics and performance metrics will be available here.</p>
                    </div>
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
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Field
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  </FieldDetailErrorBoundary>
);

export default FieldDetail;
