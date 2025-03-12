
import { useState } from "react";
import { Alert, AlertCircle, AlertTriangle, CloudLightning, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock disaster alerts data
const mockAlerts = [
  {
    id: 1,
    type: "warning",
    title: "Heavy Rainfall Alert",
    description: "Heavy rainfall expected in your region over the next 48 hours. Potential for localized flooding in low-lying areas.",
    timeframe: "Next 48 hours",
    probability: 85,
    impact: "Moderate",
    recommendations: [
      "Ensure proper drainage around crops",
      "Delay fertilizer application",
      "Secure loose farm equipment"
    ],
    icon: Droplets
  },
  {
    id: 2,
    type: "critical",
    title: "Heatwave Warning",
    description: "Extreme temperatures forecasted for the coming week. Heat stress risk for crops and livestock.",
    timeframe: "5-day period",
    probability: 95, 
    impact: "Severe",
    recommendations: [
      "Increase irrigation frequency",
      "Provide shade for sensitive crops",
      "Ensure livestock have access to shade and water"
    ],
    icon: Thermometer
  },
  {
    id: 3,
    type: "advisory",
    title: "Potential Thunderstorms",
    description: "Isolated thunderstorms may develop in your area beginning tomorrow afternoon.",
    timeframe: "Tomorrow afternoon",
    probability: 60,
    impact: "Low to Moderate",
    recommendations: [
      "Secure any loose equipment",
      "Be cautious with field operations"
    ],
    icon: CloudLightning
  }
];

export default function DisasterAlerts() {
  const [alerts] = useState(mockAlerts);
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);
  
  const toggleAlert = (id: number) => {
    if (expandedAlerts.includes(id)) {
      setExpandedAlerts(expandedAlerts.filter(alertId => alertId !== id));
    } else {
      setExpandedAlerts([...expandedAlerts, id]);
    }
  };
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 border-red-500 text-red-800";
      case "warning":
        return "bg-amber-100 border-amber-500 text-amber-800";
      case "advisory":
        return "bg-blue-100 border-blue-500 text-blue-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <Alert className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "advisory":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "advisory":
        return "secondary";
      default:
        return "outline";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Weather Alerts & Advisories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active weather alerts for your location.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`border-l-4 rounded-md overflow-hidden ${getAlertColor(alert.type)}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {getAlertIcon(alert.type)}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="font-medium">{alert.title}</h3>
                          <Badge variant={getBadgeVariant(alert.type)} className="ml-2">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{alert.description}</p>
                        <div className="flex items-center mt-2 text-sm">
                          <span className="mr-3">
                            <strong>When:</strong> {alert.timeframe}
                          </span>
                          <span className="mr-3">
                            <strong>Probability:</strong> {alert.probability}%
                          </span>
                          <span>
                            <strong>Impact:</strong> {alert.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleAlert(alert.id)}
                      className="ml-2"
                    >
                      {expandedAlerts.includes(alert.id) ? "Hide" : "View Actions"}
                    </Button>
                  </div>
                  
                  {expandedAlerts.includes(alert.id) && (
                    <div className="mt-3 pl-8">
                      <h4 className="font-medium text-sm mb-1">Recommended Actions:</h4>
                      <ul className="list-disc pl-5 text-sm">
                        {alert.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex">
                        <Button size="sm" variant="outline" className="mr-2">
                          <Alert className="mr-1 h-4 w-4" />
                          Set SMS Alert
                        </Button>
                        <Button size="sm" variant="outline">
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
