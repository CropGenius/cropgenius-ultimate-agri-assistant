import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  WifiOff,
  RefreshCw,
  BarChart3,
  ScanLine,
  Upload,
  Loader2,
  Info,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Leaf,
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { useFieldAIAgents } from '@/hooks/agents/useFieldAIAgents';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AnalyticsSectionProps {
  fieldId: string;
  className?: string;
}

export function AnalyticsSection({
  fieldId,
  className,
}: AnalyticsSectionProps) {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('scan'); // Default to crop scan

  const {
    // Crop Scan
    cropScanImage,
    setCropScanImage,
    cropScanResult,
    isScanning: isCropScanning,
    scanError: cropScanError,
    performCropScan,
    recentScans = [],

    // Yield Prediction
    predictYield,
    yieldPrediction,
    isPredicting: isPredictingYield,
    predictionError: yieldError,

    // Field Insights
    refreshInsights,
    insights: fieldInsights = [],
    isFetchingInsights: isLoadingInsights,
    insightsError,

    // Field Risks
    refreshRisks,
    risks: fieldRisks = { hasRisks: false, risks: [] },
    isFetchingRisks: isLoadingRisks,
    risksError,
  } = useFieldAIAgents(fieldId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCropScanImage(file);
      toast({
        title: 'Image Selected',
        description: file.name,
      });
    } else {
      setCropScanImage(null);
    }
  };

  const handlePerformCropScan = async () => {
    if (!cropScanImage) {
      toast({
        title: 'No Image',
        description: 'Please select an image first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await performCropScan();
      toast({
        title: 'Scan Complete',
        description: 'Crop scan analysis finished.',
      });
    } catch (error) {
      // Error is already handled by the hook
      console.error('Crop scan failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            <span>Crop Scan</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Risks</span>
          </TabsTrigger>
          <TabsTrigger value="yield" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            <span>Yield</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Crop Scan Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crop-scan">
                      Upload crop image for analysis
                    </Label>
                    {!isOnline && (
                      <Badge variant="outline" className="text-xs">
                        <WifiOff className="h-3 w-3 mr-1" /> Offline
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      id="crop-scan"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCropScanImage(e.target.files[0]);
                        }
                      }}
                      disabled={!isOnline || cropScan.isLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isOnline || isCropScanning}
                    >
                      {cropScanImage ? 'Change Image' : 'Select Image'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handlePerformCropScan}
                      disabled={!cropScanImage || isCropScanning || !isOnline}
                    >
                      {isCropScanning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Image'
                      )}
                    </Button>
                  </div>
                  {cropScanImage && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Selected: {cropScanImage?.name}
                      </p>
                    </div>
                  )}
                </div>

                {cropScanError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {cropScanError?.message}
                    </AlertDescription>
                  </Alert>
                )}

                {recentScans && recentScans.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Recent Scans</h4>
                    <div className="space-y-2">
                      {recentScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="p-3 border rounded-md text-sm"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {new Date(scan.scanDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {scan.status}
                            </Badge>
                          </div>
                          {scan.notes && (
                            <p className="mt-1 text-muted-foreground">
                              {scan.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Field Insights</CardTitle>
                <CardDescription>
                  AI-powered analysis of your field's condition and performance
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshInsights}
                disabled={isLoadingInsights || !isOnline}
                className="ml-auto"
              >
                {isLoadingInsights ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {!isOnline ? (
                <Alert>
                  <WifiOff className="h-4 w-4" />
                  <AlertTitle>Offline Mode</AlertTitle>
                  <AlertDescription>
                    Field insights are not available while offline. Please
                    connect to the internet to view the latest analysis.
                  </AlertDescription>
                </Alert>
              ) : isLoadingInsights ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : insightsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading insights</AlertTitle>
                  <AlertDescription className="mt-1">
                    {insightsError?.message ||
                      'Failed to load field insights. Please try again.'}
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={refreshInsights}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Retry
                  </Button>
                </Alert>
              ) : fieldInsights.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    {fieldInsights.length} insights found
                  </div>
                  <div className="space-y-4">
                    {fieldInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Info className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {insight.split('. ')[0].trim()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {insight.includes('. ')
                                ? insight.split('. ').slice(1).join('. ').trim()
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No insights available</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    We couldn't find any insights for this field. Try refreshing
                    or check back later.
                  </p>
                  <Button variant="outline" size="sm" onClick={refreshInsights}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRisks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : risksError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading risks</AlertTitle>
                  <AlertDescription>{risksError?.message}</AlertDescription>
                </Alert>
              ) : fieldRisks.hasRisks ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Potential Risks Detected</AlertTitle>
                    <AlertDescription className="mt-1">
                      The following potential risks have been identified for
                      this field:
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    {fieldRisks.risks.map((risk: any, index: number) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{risk.type}</h4>
                          <Badge variant="destructive">High Risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {risk.description}
                        </p>
                        {risk.recommendations && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Recommendations:
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                              {risk.recommendations.map(
                                (rec: string, i: number) => (
                                  <li key={i}>{rec}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Critical Risks</AlertTitle>
                  <AlertDescription>
                    No significant risks have been identified for this field at
                    this time.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield">
          <Card>
            <CardHeader>
              <CardTitle>Yield Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={predictYield}
                  disabled={isPredictingYield || !isOnline}
                >
                  {isPredictingYield ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    'Predict Yield'
                  )}
                </Button>

                {yieldError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{yieldError?.message}</AlertDescription>
                  </Alert>
                )}

                {yieldPrediction && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-2">Yield Prediction</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estimated Yield
                        </p>
                        <p className="text-lg font-medium">
                          {yieldPrediction?.estimatedYield}{' '}
                          {yieldPrediction?.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-lg font-medium">
                          {yieldPrediction?.confidence}%
                        </p>
                      </div>
                    </div>
                    {yieldPrediction?.notes && (
                      <div className="mt-4 p-3 bg-background rounded border">
                        <p className="text-sm">{yieldPrediction.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
