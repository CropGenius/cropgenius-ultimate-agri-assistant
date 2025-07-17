/**
 * MarketPriceChart Component
 * Advanced price visualization with trend analysis and interactive features
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MarketPrice, PriceTrend } from '@/api/marketDataApi';

interface MarketPriceChartProps {
  data: MarketPrice[];
  priceTrend?: PriceTrend | null;
  title?: string;
  height?: number;
  showVolume?: boolean;
  showTrendLine?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  formattedDate: string;
  trend?: 'up' | 'down' | 'stable';
}

export const MarketPriceChart: React.FC<MarketPriceChartProps> = ({
  data,
  priceTrend,
  title = 'Market Price Trends',
  height = 400,
  showVolume = true,
  showTrendLine = true,
  timeRange = '30d',
  onTimeRangeChange,
  onRefresh,
  isLoading = false,
  className
}) => {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by date and calculate daily averages
    const dailyData: Record<string, { prices: number[]; count: number }> = {};
    
    data.forEach(item => {
      const date = item.date_recorded;
      if (!dailyData[date]) {
        dailyData[date] = { prices: [], count: 0 };
      }
      dailyData[date].prices.push(item.price);
      dailyData[date].count++;
    });

    // Convert to chart format
    const processedData: ChartDataPoint[] = Object.entries(dailyData)
      .map(([date, { prices, count }]) => {
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        return {
          date,
          price: Math.round(avgPrice * 100) / 100,
          volume: count,
          formattedDate: format(parseISO(date), 'MMM dd')
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Add trend indicators
    for (let i = 1; i < processedData.length; i++) {
      const current = processedData[i];
      const previous = processedData[i - 1];
      const change = ((current.price - previous.price) / previous.price) * 100;
      
      current.trend = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';
    }

    return processedData;
  }, [data]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (chartData.length === 0) {
      return {
        currentPrice: 0,
        highPrice: 0,
        lowPrice: 0,
        avgPrice: 0,
        totalVolume: 0,
        priceChange: 0,
        priceChangePercent: 0
      };
    }

    const prices = chartData.map(d => d.price);
    const volumes = chartData.map(d => d.volume);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2] || currentPrice;
    
    return {
      currentPrice,
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      avgPrice: Math.round((prices.reduce((sum, p) => sum + p, 0) / prices.length) * 100) / 100,
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
      priceChange: Math.round((currentPrice - previousPrice) * 100) / 100,
      priceChangePercent: previousPrice > 0 ? Math.round(((currentPrice - previousPrice) / previousPrice) * 100 * 100) / 100 : 0
    };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{format(parseISO(data.date), 'MMM dd, yyyy')}</p>
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="font-medium">${data.price}</span>
            </div>
            {showVolume && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="font-medium">{data.volume}</span>
              </div>
            )}
            {data.trend && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Trend:</span>
                <div className="flex items-center gap-1">
                  {data.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {data.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {data.trend === 'stable' && <Minus className="h-3 w-3 text-gray-500" />}
                  <span className="text-xs capitalize">{data.trend}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!priceTrend) return null;

    const isPositive = priceTrend.price_change_percent > 0;
    const isNegative = priceTrend.price_change_percent < 0;

    return (
      <div className="flex items-center gap-2">
        {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
        {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
        {!isPositive && !isNegative && <Minus className="h-4 w-4 text-gray-500" />}
        
        <span className={cn(
          'text-sm font-medium',
          isPositive && 'text-green-600',
          isNegative && 'text-red-600',
          !isPositive && !isNegative && 'text-gray-600'
        )}>
          {isPositive && '+'}
          {priceTrend.price_change_percent.toFixed(2)}%
        </span>
        
        <span className="text-xs text-muted-foreground">
          ({priceTrend.period_days}d)
        </span>
      </div>
    );
  };

  // Render statistics cards
  const renderStatistics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">
          ${statistics.currentPrice}
        </div>
        <div className="text-xs text-muted-foreground">Current Price</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-semibold text-green-600">
          ${statistics.highPrice}
        </div>
        <div className="text-xs text-muted-foreground">High</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-semibold text-red-600">
          ${statistics.lowPrice}
        </div>
        <div className="text-xs text-muted-foreground">Low</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-semibold">
          ${statistics.avgPrice}
        </div>
        <div className="text-xs text-muted-foreground">Average</div>
      </div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No price data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No market data to display</p>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {renderTrendIndicator()}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {onTimeRangeChange && (
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="90d">90d</SelectItem>
                  <SelectItem value="1y">1y</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStatistics()}
        
        <Tabs defaultValue="price" className="space-y-4">
          <TabsList>
            <TabsTrigger value="price">Price Trend</TabsTrigger>
            {showVolume && <TabsTrigger value="volume">Volume</TabsTrigger>}
            <TabsTrigger value="combined">Combined</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price">
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                
                {showTrendLine && statistics.avgPrice > 0 && (
                  <ReferenceLine 
                    y={statistics.avgPrice} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    label={{ value: "Avg", position: "insideTopRight" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {showVolume && (
            <TabsContent value="volume">
              <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          )}
          
          <TabsContent value="combined">
            <ResponsiveContainer width="100%" height={height}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="price"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="hsl(var(--muted))"
                  opacity={0.6}
                />
                
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};