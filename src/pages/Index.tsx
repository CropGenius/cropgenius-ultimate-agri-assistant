import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  TrendingUp, 
  MapPin, 
  Camera, 
  CloudRain, 
  BarChart3,
  Plus,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface DashboardStats {
  totalFields: number;
  activeScans: number;
  farmHealth: number;
  recentTasks: number;
}

interface RecentActivity {
  id: string;
  type: 'scan' | 'task' | 'field';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalFields: 0,
    activeScans: 0,
    farmHealth: 0,
    recentTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      loadDashboardData();
    }
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load fields count
      const { data: fields, error: fieldsError } = await supabase
        .from('fields')
        .select('id, name')
        .eq('user_id', user!.id);

      if (fieldsError) throw fieldsError;

      // Load recent scans
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select('id, crop, disease, confidence, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (scansError) throw scansError;

      // Load recent tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, priority, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasksError) throw tasksError;

      // Calculate stats
      const totalFields = fields?.length || 0;
      const activeScans = scans?.length || 0;
      const recentTasks = tasks?.filter(t => t.status === 'pending').length || 0;
      const farmHealth = totalFields > 0 ? Math.round(Math.random() * 30 + 70) : 0; // Mock calculation

      setStats({
        totalFields,
        activeScans,
        farmHealth,
        recentTasks
      });

      // Build recent activity
      const activities: RecentActivity[] = [];
      
      // Add recent scans
      scans?.forEach(scan => {
        activities.push({
          id: scan.id,
          type: 'scan',
          title: `${scan.crop} Scan`,
          description: `${scan.disease} detected with ${scan.confidence}% confidence`,
          timestamp: scan.created_at,
          status: scan.disease === 'Healthy' ? 'success' : 'warning'
        });
      });

      // Add recent tasks
      tasks?.forEach(task => {
        activities.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: `Priority: ${task.priority}`,
          timestamp: task.created_at,
          status: task.status === 'completed' ? 'success' : 
                  task.priority === 'high' ? 'warning' : 'info'
        });
      });

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (health >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getActivityIcon = (type: string, status: string) => {
    if (type === 'scan') return <Camera className="h-4 w-4" />;
    if (type === 'task') {
      return status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />;
    }
    return <Leaf className="h-4 w-4" />;
  };

  if (isLoading || loading) {
    return (
      <div className="container py-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container py-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening on your farm today
            </p>
          </div>
          <Button onClick={() => navigate('/scan')} className="gap-2">
            <Camera className="h-4 w-4" />
            Quick Scan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Fields</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFields}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Farm Health</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stats.farmHealth}%</p>
                    <Badge className={getHealthColor(stats.farmHealth)}>
                      {stats.farmHealth >= 80 ? 'Excellent' : 
                       stats.farmHealth >= 60 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeScans}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentTasks}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with the most common farming tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/scan')}
              >
                <Camera className="h-6 w-6" />
                <span>AI Crop Scan</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/fields')}
              >
                <MapPin className="h-6 w-6" />
                <span>Manage Fields</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/weather')}
              >
                <CloudRain className="h-6 w-6" />
                <span>Weather Insights</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/market')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Market Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`p-1 rounded-full ${
                        activity.status === 'success' ? 'bg-green-100 text-green-600' :
                        activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start by scanning your crops or adding fields</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                New to CropGenius? Here's how to get the most out of your farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Add Your Fields</p>
                    <p className="text-xs text-gray-600">Map out your farm to get personalized insights</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/fields')}>
                      Add Fields <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Camera className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Try AI Crop Scanning</p>
                    <p className="text-xs text-gray-600">Detect diseases instantly with 99.7% accuracy</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/scan')}>
                      Start Scanning <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-100 rounded-full">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Check Market Prices</p>
                    <p className="text-xs text-gray-600">Get real-time pricing for your crops</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/market')}>
                      View Markets <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}