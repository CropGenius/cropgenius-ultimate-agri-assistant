import { useEffect, useState } from 'react';
import { systemMonitor } from '../services/systemMonitoringService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Gauge, GaugeProps } from '../components/ui/gauge';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

interface Metric {
  name: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  status: 'healthy' | 'warning' | 'critical';
}

const metrics: Metric[] = [
  {
    name: 'Response Time',
    value: 0,
    max: 1500,
    unit: 'ms',
    color: 'success',
    status: 'healthy'
  },
  {
    name: 'Memory Usage',
    value: 0,
    max: 50 * 1024 * 1024,
    unit: 'bytes',
    color: 'success',
    status: 'healthy'
  },
  {
    name: 'Active Users',
    value: 0,
    max: 50000,
    unit: '',
    color: 'success',
    status: 'healthy'
  },
  {
    name: 'Database Connections',
    value: 0,
    max: 100,
    unit: '',
    color: 'success',
    status: 'healthy'
  },
  {
    name: 'Error Rate',
    value: 0,
    max: 100,
    unit: '%',
    color: 'success',
    status: 'healthy'
  }
];

export function MonitoringDashboard() {
  const [metricsState, setMetricsState] = useState(metrics);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const health = await systemMonitor.getSystemHealth();
        
        const updatedMetrics = metrics.map(metric => {
          const value = health.metrics[metric.name.toLowerCase().replace(' ', '_')];
          const status = getStatus(value, metric.max);
          
          return {
            ...metric,
            value,
            status,
            color: getColorForStatus(status)
          };
        });

        setMetricsState(updatedMetrics);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = (value: number, max: number): Metric['status'] => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'critical';
    if (percentage >= 60) return 'warning';
    return 'healthy';
  };

  const getColorForStatus = (status: Metric['status']): string => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'destructive';
      default: return 'success';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {metricsState.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            <Badge variant={metric.color}>{metric.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
            <Progress
              className={`mt-2 ${metric.color === 'success' ? 'bg-green-100' : 
                          metric.color === 'warning' ? 'bg-yellow-100' : 'bg-red-100'}`}
              value={(metric.value / metric.max) * 100}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
