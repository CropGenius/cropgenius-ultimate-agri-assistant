import { MonitoringDashboard } from '../components/MonitoringDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { systemMonitor } from '../services/systemMonitoringService';

export default function Monitoring() {
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Start monitoring
    systemMonitor.startMonitoring();

    // Set up alert listener
    systemMonitor.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    // Set up log listener
    systemMonitor.onLog((log) => {
      setLogs(prev => [log, ...prev]);
    });

    return () => {
      systemMonitor.stopMonitoring();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">System Monitoring Dashboard</h1>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-red-500">
                    {alert.severity === 'CRITICAL' ? '🚨' : '⚠️'}
                    {alert.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="space-y-4">
            {logs.map((log, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className={`text-${log.level}-500`}>
                    {log.level.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{log.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button
          variant="destructive"
          onClick={() => systemMonitor.triggerEmergencyShutdown()}
        >
          Emergency Shutdown
        </Button>
      </div>
    </div>
  );
}
