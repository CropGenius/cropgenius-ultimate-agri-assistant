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
import { deleteField, getFieldById } from '@/features/field-management/services/fieldService';
import { getFieldCrops, getFieldHistory } from '@/features/field-management/services/fieldDetailService';
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
          <AlertTitle>Pending Changes</AlertTitle>
          <AlertDescription>
            You have pending changes that will be synced when you're back online.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2" 
              onClick={() => syncFieldData()}
            >
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Field Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldDetailsSection field={field} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Map</CardTitle>
              </CardHeader>
              <CardContent>
                {field.boundary?.coordinates ? (
                  <FieldMap 
                    boundary={field.boundary} 
                    style={{ height: '300px', width: '100%' }} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-muted rounded-md">
                    <p className="text-muted-foreground">No map data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops" className="mt-6">
          <CropsSection crops={crops} isLoading={isLoadingCrops} error={cropsError} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistorySection history={history} isLoading={isLoadingHistory} error={historyError} />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsSection field={field} />
        </TabsContent>
      </Tabs>
      
      {/* AI Agents section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <p>AI agents are not yet implemented.</p>
          {/* Example of how to use the hook */}
          {/* <pre>{JSON.stringify(aiAgents.agents, null, 2)}</pre> */}
        </CardContent>
      </Card>
    </div>
  );
};


const FieldDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Invalid field ID provided.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FieldErrorBoundary
        fallback={(error, reset) => (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                <p>There was an error loading the field details.</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{error.message}</pre>
                <Button onClick={reset} className="mt-4">Try Again</Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <FieldDetailContent fieldId={id} />
        </div>
      </FieldErrorBoundary>
    </Layout>
  );
};

export default FieldDetailPage;
