import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, Loader2, AlertCircle, WifiOff, RefreshCw, MapPin } from 'lucide-react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FieldMap } from '@/components/fields/FieldMap';
import { useOfflineMutation } from '@/hooks';
import { deleteField, getFieldById, getFieldCrops, getFieldHistory } from '@/services/fieldService';
import { Field, FieldCrop, FieldHistory } from '@/types/field';
import { useFieldData } from '@/hooks/useFieldData';
import { useFieldAIAgents } from '@/hooks/agents/useFieldAIAgents';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { useFieldSync } from '@/hooks/useFieldSync';
import { toast } from 'sonner';
import { FieldErrorBoundary } from '@/components/error/FieldErrorBoundary';
import { FieldDetailsSection } from './components/FieldDetailsSection';
import { CropsSection } from './components/CropsSection';
import { HistorySection } from './components/HistorySection';
import { AnalyticsSection } from './components/AnalyticsSection';

const FieldDetailContent = ({ fieldId }: { fieldId: string }) => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  
  // Use the field data hook
  const {
    // Field data
    field,
    crops,
    history,
    
    // Loading states
    isLoading,
    isLoadingField,
    isLoadingCrops,
    isLoadingHistory,
    
    // Errors
    error,
    fieldError,
    cropsError,
    historyError,
    
    // Actions
    refreshFieldData,
    deleteField: handleDeleteField,
    isDeleting,
  } = useFieldData();
  
  // Sync status
  const { syncFieldData, getSyncStatus, hasPendingChanges } = useFieldSync(fieldId);
  const syncStatus = getSyncStatus();
  
  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFieldData();
      toast.success('Field data refreshed');
    } catch (error) {
      console.error('Error refreshing field data:', error);
      toast.error('Failed to refresh field data');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFieldData]);
  
  // Initialize AI agents
  const aiAgents = useFieldAIAgents(fieldId);
  
  // Combine loading states
  const isProcessing = isLoading || isRefreshing || isDeleting;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <LoadingSpinner text="Loading field data..." />
        <p className="text-muted-foreground">This may take a moment</p>
      </div>
    );
  }

  // Show error state
  if (error || !field) {
    return (
      <div className="p-4 space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fields
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading field data</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{error?.message || 'The requested field could not be found.'}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show offline mode
  if (!isOnline) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fields
        </Button>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">You're offline</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Field data is available in read-only mode. Some features may be limited until you're back online.
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{field.name}</h1>
            {field.location && (
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {field.location}
              </p>
            )}
          </div>
          {field.status && (
            <Badge variant="outline" className="capitalize hidden sm:inline-flex">
              {field.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/fields/${fieldId}/edit`)}
            className="shrink-0"
          >
            Edit Field
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
                handleDeleteField();
              }
            }}
            disabled={isDeleting}
            className="shrink-0"
          >
            {isDeleting ? (
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
          </Button>
        </div>
      </div>
      
      {/* Sync status */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <p>You're currently offline. Changes will be synced when you're back online.</p>
        </Alert>
      )}
      
      {hasPendingChanges() && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Changes pending sync</AlertTitle>
          <p>Your changes will be synced when you're back online.</p>
        </Alert>
      )}

      {/* Field Map */}
      {field.boundaries && (
        <Card>
          <CardHeader>
            <CardTitle>Field Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-md overflow-hidden border">
              <FieldMap boundaries={field.boundaries} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for additional information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldDetailsSection field={field} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Crop</CardTitle>
            </CardHeader>
            <CardContent>
              <CropsSection 
                crops={crops} 
                isLoading={isLoadingCrops} 
                error={cropsError} 
                fieldId={fieldId}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <HistorySection 
                history={history.slice(0, 5)} 
                isLoading={isLoadingHistory} 
                error={historyError} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crops">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Crop History</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/fields/${fieldId}/crops/new`)}
                  disabled={!isOnline}
                >
                  Add Crop
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CropsSection 
                crops={crops} 
                isLoading={isLoadingCrops} 
                error={cropsError} 
                fieldId={fieldId}
                showAll
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Field History</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/fields/${fieldId}/history/new`)}
                  disabled={!isOnline}
                >
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <HistorySection 
                history={history} 
                isLoading={isLoadingHistory} 
                error={historyError} 
                showAll
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsSection 
            fieldId={fieldId} 
            fieldName={field.name}
            isOnline={isOnline}
          />
        </TabsContent>
          <AnalyticsSection 
            cropScan={cropScan}
            fieldInsights={fieldInsights}
            fieldRisks={fieldRisks}
            yieldPrediction={yieldPrediction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FieldDetailPage = () => {
  const { id: fieldId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!fieldId) {
    return (
      <Layout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Field ID is missing from the URL.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/fields')}
              >
                Back to Fields
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <FieldErrorBoundary fieldId={fieldId}>
        <Layout>
          <FieldDetailContent fieldId={fieldId} />
        </Layout>
      </FieldErrorBoundary>
    </ErrorBoundary>
  );
};

export default FieldDetailPage;
