// 🚀 CROPGENIUS INFINITY IQ AUTH DEBUG DASHBOARD
// Production-ready debugging dashboard for 100M farmers - UNLEASH THE SUN! 🔥

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  RefreshCw, 
  Trash2, 
  User, 
  Wifi, 
  WifiOff,
  Database,
  Shield,
  Zap,
  Bug,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  authDebugger, 
  AuthEventType, 
  DebugLevel, 
  AuthSystemHealth,
  AuthDebugEvent 
} from '@/utils/authDebugger';
import { useAuth } from '@/hooks/useAuth';

interface AuthDebugDashboardProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const AuthDebugDashboard: React.FC<AuthDebugDashboardProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  // 🔥 STATE MANAGEMENT
  const [events, setEvents] = useState<AuthDebugEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<AuthSystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuthDebugEvent | null>(null);
  const [filterLevel, setFilterLevel] = useState<DebugLevel>(DebugLevel.INFO);
  const [filterType, setFilterType] = useState<AuthEventType | 'ALL'>('ALL');
  
  // 🚀 AUTH CONTEXT
  const auth = useAuth();

  // 🔄 REFRESH DATA
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get filtered events
      const allEvents = authDebugger.getEvents({
        level: filterLevel,
        limit: 100
      });
      
      if (filterType !== 'ALL') {
        setEvents(allEvents.filter(e => e.type === filterType));
      } else {
        setEvents(allEvents);
      }
      
      // Get system health
      const health = await authDebugger.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to refresh debug data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterLevel, filterType]);

  // 🔄 AUTO REFRESH EFFECT
  useEffect(() => {
    if (!isVisible || !autoRefresh) return;
    
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [isVisible, autoRefresh, refreshData]);

  // 🚀 INITIAL LOAD
  useEffect(() => {
    if (isVisible) {
      refreshData();
    }
  }, [isVisible, refreshData]);

  // 🧹 CLEAR DEBUG DATA
  const handleClearData = useCallback(() => {
    authDebugger.clear();
    setEvents([]);
    setSelectedEvent(null);
    refreshData();
  }, [refreshData]);

  // 📊 EXPORT DEBUG DATA
  const handleExportData = useCallback(() => {
    const debugData = authDebugger.exportDebugData();
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropgenius-auth-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 🎨 GET STATUS COLOR
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 🎨 GET EVENT LEVEL COLOR
  const getEventLevelColor = (level: DebugLevel) => {
    switch (level) {
      case DebugLevel.ERROR: return 'text-red-600 bg-red-100';
      case DebugLevel.WARN: return 'text-yellow-600 bg-yellow-100';
      case DebugLevel.INFO: return 'text-blue-600 bg-blue-100';
      case DebugLevel.DEBUG: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 🎨 GET EVENT TYPE ICON
  const getEventTypeIcon = (type: AuthEventType) => {
    switch (type) {
      case AuthEventType.SIGN_IN_SUCCESS: return <CheckCircle className="h-4 w-4 text-green-600" />;
      case AuthEventType.SIGN_IN_ERROR: return <AlertCircle className="h-4 w-4 text-red-600" />;
      case AuthEventType.HEALTH_CHECK: return <Activity className="h-4 w-4 text-blue-600" />;
      case AuthEventType.NETWORK_ERROR: return <WifiOff className="h-4 w-4 text-red-600" />;
      case AuthEventType.CONFIG_ERROR: return <Settings className="h-4 w-4 text-red-600" />;
      default: return <Bug className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* 🎯 HEADER */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              CropGenius Auth Debug Dashboard
            </h2>
            {systemHealth && (
              <Badge className={getStatusColor(systemHealth.status)}>
                {systemHealth.status.toUpperCase()}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
              className={autoRefresh ? 'bg-green-100 text-green-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            
            <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={handleExportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={handleClearData} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <Button onClick={onToggle} variant="outline" size="sm">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 🎯 CONTENT */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="auth-state">Auth State</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* 📊 OVERVIEW TAB */}
            <TabsContent value="overview" className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemHealth && (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          System Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          <Badge className={getStatusColor(systemHealth.status)}>
                            {systemHealth.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Error Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {systemHealth.metrics.errorRate.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Avg Response
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {systemHealth.metrics.averageResponseTime.toFixed(0)}ms
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {systemHealth.metrics.successfulSignIns}/
                          {systemHealth.metrics.successfulSignIns + systemHealth.metrics.failedSignIns}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* 🚨 RECENT ERRORS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Recent Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {events.filter(e => e.level === DebugLevel.ERROR).slice(-5).map(event => (
                      <div key={event.id} className="mb-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-700">{event.message}</span>
                          <span className="text-xs text-red-600">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {event.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {event.error.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 📝 EVENTS TAB */}
            <TabsContent value="events" className="flex-1 p-4">
              <div className="space-y-4">
                {/* 🔍 FILTERS */}
                <div className="flex gap-4">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(Number(e.target.value) as DebugLevel)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value={DebugLevel.ERROR}>Errors Only</option>
                    <option value={DebugLevel.WARN}>Warnings+</option>
                    <option value={DebugLevel.INFO}>Info+</option>
                    <option value={DebugLevel.DEBUG}>Debug+</option>
                    <option value={DebugLevel.VERBOSE}>All</option>
                  </select>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as AuthEventType | 'ALL')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="ALL">All Types</option>
                    {Object.values(AuthEventType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 📋 EVENTS LIST */}
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium">{event.message}</span>
                            <Badge className={getEventLevelColor(event.level)}>
                              {DebugLevel[event.level]}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {event.performance?.duration && (
                          <div className="text-xs text-gray-600 mt-1">
                            ⚡ {event.performance.duration.toFixed(2)}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* 👤 AUTH STATE TAB */}
            <TabsContent value="auth-state" className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Current User
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Authenticated:</span>
                      <Badge className={auth.isAuthenticated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {auth.isAuthenticated ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="text-sm">{auth.userEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loading:</span>
                      <Badge className={auth.isLoading ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                        {auth.isLoading ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <Badge className={auth.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {auth.connectionHealth}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Session Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Has Session:</span>
                      <Badge className={auth.session ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {auth.session ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {auth.session && (
                      <>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="text-sm">
                            {new Date(auth.session.expires_at! * 1000).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span className="text-sm">{auth.session.user.app_metadata.provider}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 🖥️ SYSTEM TAB */}
            <TabsContent value="system" className="flex-1 p-4">
              {systemHealth && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Supabase URL:</span>
                        <Badge className={systemHealth.environment.hasValidConfig ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {systemHealth.environment.hasValidConfig ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>API Key:</span>
                        <Badge className={systemHealth.environment.hasApiKey ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {systemHealth.environment.hasApiKey ? 'Present' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Online:</span>
                        <Badge className={systemHealth.environment.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {systemHealth.environment.isOnline ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Instance ID:</span>
                        <span className="text-sm font-mono">{systemHealth.environment.instanceId}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Events:</span>
                        <span>{systemHealth.metrics.totalEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session Refreshes:</span>
                        <span>{systemHealth.metrics.sessionRefreshes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Errors:</span>
                        <span className="text-red-600">{systemHealth.metrics.networkErrors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Config Errors:</span>
                        <span className="text-red-600">{systemHealth.metrics.configErrors}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 🔍 EVENT DETAIL MODAL */}
        {selectedEvent && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Event Details</span>
                  <Button onClick={() => setSelectedEvent(null)} variant="outline" size="sm">
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};