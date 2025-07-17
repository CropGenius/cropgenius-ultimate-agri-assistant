/**
 * MarketDataPage Component
 * Comprehensive market intelligence dashboard for African farmers
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Target,
  AlertTriangle,
  RefreshCw,
  Settings,
  Bell,
  Download
} from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { MarketOverview } from '@/components/market-data/MarketOverview';
import { MarketPriceChart } from '@/components/market-data/MarketPriceChart';
import { DemandIndicator } from '@/components/market-data/DemandIndicator';
import { useMarketData, usePriceMonitoring } from '@/hooks/useMarketData';
import { toast } from 'sonner';

const MarketDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  // Get user's location from profile (if available)
  React.useEffect(() => {
    // In a real app, you would get this from user's profile
    // For now, we'll use Nairobi, Kenya as default
    setSelectedLocation({ lat: -1.2921, lng: 36.8219 });
  }, [user]);

  const {
    marketOverview,
    marketPrices,
    priceTrend,
    demandIndicator,
    isLoadingAll,
    hasError,
    errorMessage,
    refreshAllData
  } = useMarketData({
    location_filter: selectedLocation ? { coordinates: selectedLocation, radius_km: 100 } : undefined,
    auto_refresh: true,
    refresh_interval: 300000 // 5 minutes
  });

  // Price monitoring for alerts
  const {
    alerts,
    clearAlerts,
    dismissAlert,
    isMonitoring
  } = usePriceMonitoring(
    ['maize', 'beans', 'tomato', 'rice', 'cassava'],
    selectedLocation ? { coordinates: selectedLocation, radius_km: 100 } : undefined,
    monitoringEnabled ? {
      price_change_percent: 10,
      demand_level: 'high'
    } : undefined
  );

  // Handle location change
  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    toast.success('Location updated - refreshing market data');
    refreshAllData();
  };

  // Toggle monitoring
  const handleToggleMonitoring = () => {
    setMonitoringEnabled(!monitoringEnabled);
    if (!monitoringEnabled) {
      toast.success('Price monitoring enabled - you\'ll receive alerts for significant changes');
    } else {
      toast.info('Price monitoring disabled');
      clearAlerts();
    }
  };

  // Export market data
  const handleExportData = () => {
    // In a real app, this would generate and download a CSV/Excel file
    toast.success('Market data export started - check your downloads');
  };

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Real-time market data, price trends, and demand analysis for African agricultural markets.
              Make informed decisions with AI-powered market intelligence.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedLocation && (
              <Badge variant="outline" className="gap-2">
                <MapPin className="h-3 w-3" />
                Location-based data
              </Badge>
            )}
            
            {isMonitoring && (
              <Badge variant="outline" className="gap-2 bg-green-50 text-green-700 border-green-200">
                <Bell className="h-3 w-3" />
                Monitoring active
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMonitoring}
            >
              <Bell className="h-4 w-4 mr-2" />
              {monitoringEnabled ? 'Disable' : 'Enable'} Alerts
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Bell className="h-5 w-5" />
                Market Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-500' : 
                        alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
                {alerts.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{alerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {hasError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Failed to load market data</p>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
              <Button onClick={refreshAllData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="demand">Demand Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MarketOverview
              farmerLocation={selectedLocation}
              defaultCrops={['maize', 'beans', 'tomato', 'rice', 'cassava']}
              showCharts={true}
              showDemandIndicators={true}
              autoRefresh={true}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketPriceChart
                data={marketPrices}
                priceTrend={priceTrend}
                title="Price Trends Analysis"
                height={400}
                showVolume={true}
                showTrendLine={true}
                onRefresh={refreshAllData}
                isLoading={isLoadingAll}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Insights
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of current market conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Price Volatility Alert</h4>
                      <p className="text-sm text-blue-700">
                        Maize prices showing increased volatility due to seasonal factors. 
                        Consider timing your sales carefully.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Opportunity Detected</h4>
                      <p className="text-sm text-green-700">
                        Tomato demand is rising in Nairobi markets. Premium prices available 
                        for quality produce.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-2">Seasonal Forecast</h4>
                      <p className="text-sm text-amber-700">
                        Bean prices expected to rise 15-20% in the next 4 weeks due to 
                        harvest season ending.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demand" className="space-y-6">
            {demandIndicator ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DemandIndicator
                    data={demandIndicator}
                    showRecommendation={true}
                    showDetails={true}
                    onRefresh={refreshAllData}
                    isLoading={isLoadingAll}
                  />
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        Set Price Alert
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="h-4 w-4 mr-2" />
                        Find Nearby Markets
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Compare Crops
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <p>Monitor prices daily during harvest season for optimal selling timing</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <p>Consider transport costs when evaluating distant markets</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                          <p>Build relationships with multiple buyers to ensure consistent sales</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a crop from the overview to view demand analysis</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Market Predictions</CardTitle>
                  <CardDescription>
                    Machine learning insights for the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Maize</p>
                        <p className="text-sm text-green-600">Expected to rise 8-12%</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Tomatoes</p>
                        <p className="text-sm text-red-600">May decline 5-8%</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Beans</p>
                        <p className="text-sm text-blue-600">Stable with slight growth</p>
                      </div>
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Calendar</CardTitle>
                  <CardDescription>
                    Optimal planting and harvesting times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maize (Long rains)</span>
                      <Badge variant="outline">Mar - Jul</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Beans (Short rains)</span>
                      <Badge variant="outline">Oct - Dec</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tomatoes</span>
                      <Badge variant="outline">Year-round</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rice</span>
                      <Badge variant="outline">Apr - Aug</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketDataPage;