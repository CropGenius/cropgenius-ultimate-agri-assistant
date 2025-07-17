/**
 * MarketOverview Component
 * Comprehensive market dashboard with real-time data and actionable insights
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Activity,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketPriceChart } from './MarketPriceChart';
import { DemandIndicator } from './DemandIndicator';

interface MarketOverviewProps {
  farmerLocation?: { lat: number; lng: number };
  defaultCrops?: string[];
  showCharts?: boolean;
  showDemandIndicators?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

interface CropOverviewData {
  crop_name: string;
  current_price: number;
  price_change_percent: number;
  trend: 'rising' | 'falling' | 'stable';
  demand_level: 'low' | 'medium' | 'high' | 'critical';
  market_activity: number;
  recent_listings: number;
}

const CROP_ICONS: Record<string, string> = {
  maize: '🌽',
  beans: '🫘',
  tomato: '🍅',
  rice: '🌾',
  cassava: '🍠',
  potato: '🥔',
  cabbage: '🥬',
  onion: '🧅'
};

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  farmerLocation,
  defaultCrops = ['maize', 'beans', 'tomato', 'rice', 'cassava'],
  showCharts = true,
  showDemandIndicators = true,
  autoRefresh = true,
  className
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'activity'>('change');
  const [filterDemand, setFilterDemand] = useState<string>('all');

  const {
    marketOverview,
    marketPrices,
    priceTrend,
    demandIndicator,
    isLoadingOverview,
    isLoadingPrices,
    isLoadingDemand,
    hasError,
    errorMessage,
    filters,
    handleCropChange,
    refreshAllData
  } = useMarketData({
    crop_name: selectedCrop,
    location_filter: farmerLocation ? { coordinates: farmerLocation, radius_km: 100 } : undefined,
    auto_refresh: autoRefresh,
    refresh_interval: 300000 // 5 minutes
  });

  // Filter and sort overview data
  const filteredOverviewData = React.useMemo(() => {
    if (!marketOverview || !Array.isArray(marketOverview)) return [];

    let filtered = marketOverview as CropOverviewData[];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(crop =>
        crop.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply demand filter
    if (filterDemand !== 'all') {
      filtered = filtered.filter(crop => crop.demand_level === filterDemand);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.current_price - a.current_price;
        case 'change':
          return Math.abs(b.price_change_percent) - Math.abs(a.price_change_percent);
        case 'activity':
          return b.market_activity - a.market_activity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [marketOverview, searchQuery, filterDemand, sortBy]);

  // Render trend icon
  const renderTrendIcon = (trend: string, changePercent: number) => {
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;

    if (isPositive) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (isNegative) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Render demand level badge
  const renderDemandBadge = (level: string) => {
    const config = {
      low: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Low' },
      medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium' },
      high: { color: 'bg-green-50 text-green-700 border-green-200', label: 'High' },
      critical: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' }
    };

    const levelConfig = config[level as keyof typeof config] || config.medium;

    return (
      <Badge variant="outline" className={levelConfig.color}>
        {levelConfig.label}
      </Badge>
    );
  };

  // Render overview table
  const renderOverviewTable = () => {
    if (isLoadingOverview) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Failed to load market data</p>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
          <Button onClick={refreshAllData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (filteredOverviewData.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No market data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || filterDemand !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Check back later for updates'
            }
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Crop</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Demand</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOverviewData.map((crop) => (
            <TableRow 
              key={crop.crop_name}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedCrop(crop.crop_name)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {CROP_ICONS[crop.crop_name.toLowerCase()] || '🌱'}
                  </span>
                  <div>
                    <div className="font-medium capitalize">{crop.crop_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {crop.recent_listings} listings
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-medium">
                  ${crop.current_price.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">per kg</div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {renderTrendIcon(crop.trend, crop.price_change_percent)}
                  <span className={cn(
                    'text-sm font-medium',
                    crop.price_change_percent > 0 && 'text-green-600',
                    crop.price_change_percent < 0 && 'text-red-600',
                    crop.price_change_percent === 0 && 'text-gray-600'
                  )}>
                    {crop.price_change_percent > 0 && '+'}
                    {crop.price_change_percent.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {renderDemandBadge(crop.demand_level)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crop.market_activity}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCrop(crop.crop_name);
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Render market summary cards
  const renderSummaryCards = () => {
    if (isLoadingOverview || !filteredOverviewData.length) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const totalCrops = filteredOverviewData.length;
    const avgPrice = filteredOverviewData.reduce((sum, crop) => sum + crop.current_price, 0) / totalCrops;
    const risingCrops = filteredOverviewData.filter(crop => crop.price_change_percent > 0).length;
    const highDemandCrops = filteredOverviewData.filter(crop => 
      crop.demand_level === 'high' || crop.demand_level === 'critical'
    ).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalCrops}</div>
                <div className="text-xs text-muted-foreground">Tracked Crops</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Avg Price/kg</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{risingCrops}</div>
                <div className="text-xs text-muted-foreground">Rising Prices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{highDemandCrops}</div>
                <div className="text-xs text-muted-foreground">High Demand</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Overview</h2>
          <p className="text-muted-foreground">
            Real-time market intelligence and price analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {farmerLocation && (
            <Badge variant="outline" className="gap-2">
              <MapPin className="h-3 w-3" />
              Location-based
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoadingOverview}
          >
            <RefreshCw className={cn('h-4 w-4', isLoadingOverview && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          {showCharts && <TabsTrigger value="charts">Price Charts</TabsTrigger>}
          {showDemandIndicators && <TabsTrigger value="demand">Demand Analysis</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="change">Price Change</SelectItem>
                <SelectItem value="price">Current Price</SelectItem>
                <SelectItem value="activity">Market Activity</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDemand} onValueChange={setFilterDemand}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Demand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Demand</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Market Data</CardTitle>
              <CardDescription>
                Current prices, trends, and market activity for tracked crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOverviewTable()}
            </CardContent>
          </Card>
        </TabsContent>

        {showCharts && (
          <TabsContent value="charts" className="space-y-4">
            {selectedCrop ? (
              <MarketPriceChart
                data={marketPrices}
                priceTrend={priceTrend}
                title={`${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price Trends`}
                onRefresh={refreshAllData}
                isLoading={isLoadingPrices}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a crop to view price charts</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {showDemandIndicators && (
          <TabsContent value="demand" className="space-y-4">
            {selectedCrop && demandIndicator ? (
              <DemandIndicator
                data={demandIndicator}
                onRefresh={refreshAllData}
                isLoading={isLoadingDemand}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a crop to view demand analysis</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};