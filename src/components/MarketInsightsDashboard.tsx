import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BarChart3, 
  Target,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Bell,
  DollarSign,
  Calendar,
  Users,
  Zap,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface MarketData {
  crop: string;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  volume: number;
  demand_level: 'low' | 'medium' | 'high';
  forecast: 'rising' | 'falling' | 'stable';
  last_updated: string;
}

interface PriceHistory {
  date: string;
  price: number;
  volume: number;
}

interface MarketAlert {
  id: string;
  crop: string;
  type: 'price_spike' | 'price_drop' | 'high_demand' | 'low_supply';
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

const MarketInsightsDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('maize');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMarketData();
  }, [selectedCrop, selectedTimeframe]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      
      // Mock market data - in real app, this would come from external APIs
      const mockMarketData: MarketData[] = [
        {
          crop: 'maize',
          current_price: 45.50,
          price_change: 2.30,
          price_change_percent: 5.3,
          volume: 1250,
          demand_level: 'high',
          forecast: 'rising',
          last_updated: new Date().toISOString()
        },
        {
          crop: 'beans',
          current_price: 78.20,
          price_change: -1.80,
          price_change_percent: -2.2,
          volume: 890,
          demand_level: 'medium',
          forecast: 'stable',
          last_updated: new Date().toISOString()
        },
        {
          crop: 'tomatoes',
          current_price: 32.10,
          price_change: -4.50,
          price_change_percent: -12.3,
          volume: 2100,
          demand_level: 'low',
          forecast: 'falling',
          last_updated: new Date().toISOString()
        },
        {
          crop: 'rice',
          current_price: 65.80,
          price_change: 3.20,
          price_change_percent: 5.1,
          volume: 1680,
          demand_level: 'high',
          forecast: 'rising',
          last_updated: new Date().toISOString()
        },
        {
          crop: 'cassava',
          current_price: 28.40,
          price_change: 0.90,
          price_change_percent: 3.3,
          volume: 750,
          demand_level: 'medium',
          forecast: 'stable',
          last_updated: new Date().toISOString()
        }
      ];

      // Mock price history
      const mockPriceHistory: PriceHistory[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 45 + Math.random() * 10 - 5 + Math.sin(i / 5) * 3,
        volume: 1000 + Math.random() * 500
      }));

      // Mock alerts
      const mockAlerts: MarketAlert[] = [
        {
          id: '1',
          crop: 'maize',
          type: 'price_spike',
          message: 'Maize prices increased by 5.3% in the last 24 hours due to high demand',
          severity: 'medium',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          crop: 'tomatoes',
          type: 'price_drop',
          message: 'Tomato prices dropped significantly (-12.3%) due to oversupply',
          severity: 'high',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          crop: 'rice',
          type: 'high_demand',
          message: 'Rice demand is at seasonal high - consider selling soon',
          severity: 'low',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setMarketData(mockMarketData);
      setPriceHistory(mockPriceHistory);
      setAlerts(mockAlerts);

    } catch (error: any) {
      console.error('Failed to load market data:', error);
      toast.error('Failed to load market data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
    toast.success('Market data refreshed');
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getForecastColor = (forecast: string) => {
    switch (forecast) {
      case 'rising': return 'text-green-600';
      case 'falling': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getForecastIcon = (forecast: string) => {
    switch (forecast) {
      case 'rising': return <TrendingUp className="h-4 w-4" />;
      case 'falling': return <TrendingDown className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const selectedCropData = marketData.find(data => data.crop === selectedCrop);
  const demandDistribution = marketData.map(data => ({
    name: data.crop,
    value: data.volume,
    demand: data.demand_level
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Market Insights</h2>
            <p className="text-gray-600">Real-time market data and intelligent price analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              Kenya Markets
            </Badge>
          </div>
        </div>

        {/* Market Alerts */}
        {alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Bell className="h-5 w-5" />
                Market Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.crop}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.severity === 'high' ? 'border-red-300 text-red-700' :
                              alert.severity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-blue-300 text-blue-700'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {marketData.map((data, index) => (
            <motion.div
              key={data.crop}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedCrop === data.crop ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setSelectedCrop(data.crop)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{data.crop}</h3>
                    <div className={`flex items-center gap-1 ${getForecastColor(data.forecast)}`}>
                      {getForecastIcon(data.forecast)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">${data.current_price}</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        data.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.price_change >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {Math.abs(data.price_change_percent)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getDemandColor(data.demand_level)}>
                        {data.demand_level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Vol: {data.volume}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">
                      {selectedCrop} Price Trends
                    </CardTitle>
                    <CardDescription>
                      Historical price data and volume analysis
                    </CardDescription>
                  </div>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Summary */}
          <div className="space-y-4">
            {/* Selected Crop Details */}
            {selectedCropData && (
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{selectedCrop} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Price</span>
                    <span className="font-bold text-lg">${selectedCropData.current_price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">24h Change</span>
                    <span className={`font-medium ${
                      selectedCropData.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedCropData.price_change >= 0 ? '+' : ''}
                      ${selectedCropData.price_change} ({selectedCropData.price_change_percent}%)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volume</span>
                    <span className="font-medium">{selectedCropData.volume} tons</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Demand Level</span>
                    <Badge className={getDemandColor(selectedCropData.demand_level)}>
                      {selectedCropData.demand_level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Forecast</span>
                    <div className={`flex items-center gap-1 ${getForecastColor(selectedCropData.forecast)}`}>
                      {getForecastIcon(selectedCropData.forecast)}
                      <span className="font-medium capitalize">{selectedCropData.forecast}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Set Price Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Market Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demandDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demandDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value} tons`, 'Volume']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {demandDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs capitalize">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Price Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Market Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Find Buyers
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              AI Market Insights
            </CardTitle>
            <CardDescription>
              Intelligent analysis and recommendations based on current market conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Opportunity Alert</h4>
                </div>
                <p className="text-sm text-green-700">
                  Maize and rice prices are trending upward. Consider selling within the next 7-10 days for optimal returns.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Market Warning</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Tomato market is oversupplied. Prices may continue falling. Consider alternative crops for next season.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Strategic Advice</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Diversify your crop portfolio. Current market conditions favor grain crops over vegetables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default MarketInsightsDashboard;