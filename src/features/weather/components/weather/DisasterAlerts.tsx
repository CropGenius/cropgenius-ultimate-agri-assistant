import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Bell,
  CloudLightning,
  Droplets,
  Thermometer,
} from 'lucide-react';

interface DisasterAlertsProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function DisasterAlerts({ location }: DisasterAlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would fetch real alerts based on location
    // This is a simulation with sample alerts
    generateAlerts();
  }, [location]);

  const generateAlerts = () => {
    const sampleAlerts = [
      {
        id: 1,
        type: 'flood',
        severity: 'high',
        title: 'Potential Flash Flood Alert',
        description:
          'Heavy rainfall expected in the next 48 hours. Prepare drainage systems and move equipment to higher ground.',
        timeframe: 'Within 48 hours',
        icon: 'droplets',
      },
      {
        id: 2,
        type: 'storm',
        severity: 'medium',
        title: 'Thunderstorm Warning',
        description:
          'Thunderstorms likely with potential for lightning strikes. Ensure livestock is sheltered and electrical equipment protected.',
        timeframe: 'Tomorrow evening',
        icon: 'cloud-lightning',
      },
      {
        id: 3,
        type: 'heatwave',
        severity: 'medium',
        title: 'Heat Advisory',
        description:
          'Temperatures expected to rise above normal levels. Increase irrigation and provide shade for sensitive crops.',
        timeframe: 'Next week',
        icon: 'thermometer',
      },
    ];

    // Randomize which alerts to show
    const selectedAlerts = [];
    if (Math.random() > 0.3) selectedAlerts.push(sampleAlerts[0]);
    if (Math.random() > 0.5) selectedAlerts.push(sampleAlerts[1]);
    if (Math.random() > 0.6) selectedAlerts.push(sampleAlerts[2]);

    setAlerts(selectedAlerts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  const getAlertIcon = (icon: string) => {
    switch (icon) {
      case 'droplets':
        return <Droplets className="h-5 w-5" />;
      case 'cloud-lightning':
        return <CloudLightning className="h-5 w-5" />;
      case 'thermometer':
        return <Thermometer className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-500" />
          <span>Weather Alerts</span>
          {alerts.length > 0 && (
            <Badge
              variant="outline"
              className={`ml-2 ${alerts.some((a) => a.severity === 'high') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}`}
            >
              {alerts.length} Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-detected weather threats specific to your farm location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border-l-4 border-red-500"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-full p-2 ${getSeverityColor(alert.severity)} text-white`}
                  >
                    {getAlertIcon(alert.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {alert.title}
                      <Badge
                        variant="outline"
                        className={
                          alert.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {alert.severity === 'high' ? 'Urgent' : 'Warning'}
                      </Badge>
                    </h3>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Expected: {alert.timeframe}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-medium text-green-600">No active alerts</p>
            <p className="text-sm mt-1">
              Your farm location currently has no weather threats
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" className="w-full">
            Configure Alert Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
