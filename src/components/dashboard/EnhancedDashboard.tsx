import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Cloud, 
  TrendingUp, 
  MessageCircle, 
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Zap,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { supabase } from '@/services/supabaseClient';
import { Tables } from '@/types/supabase';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  value?: string | number;
  status?: 'good' | 'warning' | 'critical';
  progress?: number;
  onClick?: () => void;
  loading?: boolean;
  badge?: string;
}

type Task = Tables<'tasks'>;

const DashboardCard: React.FC<DashboardCardProps> = React.memo(({
  title,
  description,
  icon,
  value,
  status = 'good',
  progress,
  onClick,
  loading = false,
  badge
}) => {
  const statusColors = useMemo(() => ({
    good: 'border-green-200 bg-green-50/50 text-green-800',
    warning: 'border-amber-200 bg-amber-50/50 text-amber-800',
    critical: 'border-red-200 bg-red-50/50 text-red-800'
  }), []);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <ErrorBoundary fallback={
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load {title}</p>
        </div>
      </Card>
    }>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
            onClick ? 'hover:border-primary/50' : ''
          }`}
          onClick={handleClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                {icon}
                {title}
              </div>
            </CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  {value && (
                    <div className="text-2xl font-bold">{value}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                  {progress !== undefined && (
                    <Progress value={progress} className="w-full h-2" />
                  )}
                  {status !== 'good' && (
                    <div className={`text-xs px-2 py-1 rounded-md ${statusColors[status]}`}>
                      {status === 'warning' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                      {status === 'critical' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                      {status === 'warning' ? 'Needs Attention' : 'Critical Issue'}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ErrorBoundary>
  );
});

DashboardCard.displayName = 'DashboardCard';

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, isLoading: creditsLoading } = useCredits();
  const [farmHealth, setFarmHealth] = useState(85);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Memoized navigation handlers
  const navigationHandlers = useMemo(() => ({
    scan: () => navigate('/scan'),
    weather: () => navigate('/weather'),
    market: () => navigate('/market'),
    chat: () => navigate('/chat'),
  }), [navigate]);

  // Simulate data loading with error handling
  const loadData = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    setDataLoadError(null);
    
    try {
      const {
        data: tasksData,
        error: tasksError
      } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Placeholder data for other sections, to be replaced later
      setWeatherData({
        temperature: 26,
        condition: 'Partly Cloudy',
        forecast: 'Good for farming',
      });
      setMarketData({
        maizePrice: 45,
        beansPrice: 120,
        trend: 'up',
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setDataLoadError(`Failed to load tasks: ${errorMessage}`);
      setTasks([]); // Clear tasks on error
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    // Initial data load
    loadData();

    // Set up real-time subscription
    if (!user) return;

    const channel = supabase
      .channel('tasks-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setTasks((prevTasks) => [payload.new as Task, ...prevTasks]);
          toast.info('A new task has been added to your list!');
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, user]);

  // Memoized dashboard cards to prevent unnecessary rerenders
  const dashboardCards: DashboardCardProps[] = useMemo(() => [
    {
      title: 'AI Crop Scanner',
      description: 'Scan crops for diseases and get AI recommendations',
      icon: <Leaf className="h-4 w-4 text-green-600" />,
      value: 'AI Ready',
      onClick: navigationHandlers.scan,
      badge: 'Popular'
    },
    {
      title: 'Weather Intelligence',
      description: weatherData ? 
        `${weatherData.temperature}°C • ${weatherData.condition}` : 
        'Get hyperlocal weather insights',
      icon: <Cloud className="h-4 w-4 text-blue-600" />,
      value: weatherData?.forecast || (isRefreshing ? 'Loading...' : 'Tap to load'),
      onClick: navigationHandlers.weather,
      loading: !weatherData && isRefreshing
    },
    {
      title: 'Market Insights',
      description: marketData ?
        `Maize: KES ${marketData.maizePrice}/kg • Beans: KES ${marketData.beansPrice}/kg` :
        'Get current market prices and trends',
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      value: marketData?.trend === 'up' ? '↗ Trending Up' : (isRefreshing ? 'Loading...' : 'Tap to load'),
      onClick: navigationHandlers.market,
      loading: !marketData && isRefreshing,
      status: marketData?.trend === 'up' ? 'good' : 'warning'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with CropGenius AI for farming advice and guidance',
      icon: <MessageCircle className="h-4 w-4 text-purple-600" />,
      value: '24/7 Available',
      onClick: navigationHandlers.chat,
      badge: 'New'
    },
    {
      title: 'Farm Health Score',
      description: 'Overall health rating of your farm operations',
      icon: <Activity className="h-4 w-4 text-orange-600" />,
      value: `${farmHealth}%`,
      progress: farmHealth,
      status: farmHealth >= 90 ? 'good' : farmHealth >= 70 ? 'warning' : 'critical'
    },
    {
      title: 'Your Credits',
      description: 'Available credits for AI-powered features',
      icon: <Zap className="h-4 w-4 text-yellow-600" />,
      value: creditsLoading ? 'Loading...' : `${balance} Credits`,
      loading: creditsLoading,
      status: balance < 20 ? 'warning' : 'good'
    },
  ], [weatherData, marketData, farmHealth, balance, creditsLoading, isRefreshing, navigationHandlers]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 space-y-6">
        {dataLoadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800 font-medium">Data Loading Error</p>
            </div>
            <p className="text-amber-700 text-sm mt-1">{dataLoadError}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your farm today
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fields</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">7 Scans</p>
              </div>
              <Leaf className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DashboardCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task: Task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No active tasks</p>
                <Button 
                  onClick={() => navigate('/scan')} 
                  className="mt-2" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Crop Scan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedDashboard;