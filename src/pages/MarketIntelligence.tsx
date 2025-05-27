import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2,
  Calendar,
  Info,
  TrendingUp,
  TrendingDown,
  TrendingUp as TrendingUpDown
} from "lucide-react";
import { MarketDataCard } from "@/components/market/MarketDataCard";
import { MarketInsights } from "@/components/market/MarketInsights";
import { fetchMarketData, fetchMarketTrends } from "@/services/marketDataService";

type TimeRange = '1d' | '1w' | '1m' | '3m' | '1y';

// Sample data for demonstration
const SAMPLE_CROPS = [
  { id: 'maize', name: 'Maize', unit: 'kg' },
  { id: 'wheat', name: 'Wheat', unit: 'kg' },
  { id: 'rice', name: 'Rice', unit: 'kg' },
  { id: 'coffee', name: 'Coffee', unit: 'kg' },
  { id: 'tea', name: 'Tea', unit: 'kg' },
];

const SAMPLE_LOCATIONS = [
  { id: 'nairobi', name: 'Nairobi' },
  { id: 'mombasa', name: 'Mombasa' },
  { id: 'kisumu', name: 'Kisumu' },
  { id: 'eldoret', name: 'Eldoret' },
];

// Sample market insights
const SAMPLE_INSIGHTS = [
  {
    id: 'insight-1',
    title: 'Maize prices expected to rise',
    description: 'Recent weather patterns and increased demand suggest a potential price increase in the coming weeks.',
    impact: 'high' as const,
    trend: 'up' as const,
    timeframe: 'Next 2-3 weeks',
    confidence: 0.85,
  },
  {
    id: 'insight-2',
    title: 'Coffee export demand increasing',
    description: 'Global demand for premium coffee is on the rise, potentially benefiting local farmers.',
    impact: 'medium' as const,
    trend: 'up' as const,
    timeframe: 'Next 1-2 months',
    confidence: 0.75,
  },
];

const MarketIntelligence = () => {
  const [selectedCrop, setSelectedCrop] = useState('maize');
  const [selectedLocation, setSelectedLocation] = useState('nairobi');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [currency, setCurrency] = useState('KES');
  
  // Fetch market data
  const { 
    data: marketData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['marketData', selectedCrop, selectedLocation, timeRange, currency],
    queryFn: () => fetchMarketData({
      crop: selectedCrop,
      location: selectedLocation,
      currency,
      mode: 'dashboard',
    }),
    enabled: !!selectedCrop && !!selectedLocation,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch market trends
  const { data: marketTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['marketTrends', selectedCrop, selectedLocation, timeRange],
    queryFn: () => fetchMarketTrends(selectedCrop, selectedLocation),
    enabled: !!selectedCrop && !!selectedLocation,
    refetchOnWindowFocus: false,
  });

  // Get current crop and location details
  const currentCrop = SAMPLE_CROPS.find(crop => crop.id === selectedCrop) || SAMPLE_CROPS[0];
  const currentLocation = SAMPLE_LOCATIONS.find(loc => loc.id === selectedLocation) || SAMPLE_LOCATIONS[0];

  // Handle error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Market Data
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              We couldn't load the market data. Please try again later.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (isLoading || !marketData) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Market Intelligence</h1>
            <p className="text-muted-foreground mt-1">
              Real-time market data and insights for {currentCrop?.name} in {currentLocation?.name}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search crops..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="">Select Crop</option>
            {SAMPLE_CROPS.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
          
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {SAMPLE_LOCATIONS.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="1d">Last 24h</option>
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Data Card */}
            <MarketDataCard 
              title={`${currentCrop?.name} Price`}
              currentPrice={marketData.price_today}
              changePct={marketData.change_pct}
              // Map the trend values from the API to the expected values in the MarketDataCard component
              trend={marketData.trend === 'rising' ? 'up' : marketData.trend === 'falling' ? 'down' : 'stable'}
              currency={currency}
              lastUpdated={marketData.updated_at}
              minPrice={marketData.metadata?.min_price}
              maxPrice={marketData.metadata?.max_price}
              confidence={marketData.confidence}
              source={marketData.source}
            />

            {/* Price History Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Price History</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {isLoadingTrends ? (
                    <div className="animate-pulse w-full h-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                  ) : marketTrends ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart2 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">Price History Chart</h3>
                        <p className="text-sm text-muted-foreground">
                          Interactive chart showing {currentCrop?.name} prices over time
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No price history data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Market Insights */}
          <div className="space-y-6">
            <MarketInsights 
              insights={SAMPLE_INSIGHTS} 
              className="h-full"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketIntelligence;
