
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Droplet,
  CheckCircle,
  Tractor,
  Wheat,
  MoreHorizontal,
  ArrowRight,
  ShieldAlert,
  CircleDollarSign,
  XCircle,
} from "lucide-react";

interface FarmActionsListProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  crops: string[];
}

export default function FarmActionsList({ location, crops }: FarmActionsListProps) {
  const [actions, setActions] = useState<any[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  useEffect(() => {
    // In a real app, we would fetch real farm actions based on weather and crops
    // This is a simulation with sample actions
    generateActions();
  }, [location, crops]);

  const generateActions = () => {
    const allPossibleActions = [
      {
        id: "irrigation",
        title: "Delay Irrigation",
        description: "Rain expected in 36 hours. Skip today's irrigation to save water and resources.",
        urgency: "medium",
        icon: "droplet",
        expiresIn: "36 hours",
      },
      {
        id: "heatwave",
        title: "Protect Crops",
        description: "Heatwave coming this weekend. Increase soil cover and prepare shade cloth for sensitive crops.",
        urgency: "high",
        icon: "shield-alert",
        expiresIn: "2 days",
      },
      {
        id: "harvest",
        title: "Harvest Soon",
        description: "Rain may spoil stored maize if not harvested before Friday. Schedule harvest team now.",
        urgency: "high",
        icon: "tractor",
        expiresIn: "3 days",
      },
      {
        id: "market",
        title: "Optimal Selling Time",
        description: "Market expects maize shortage due to regional flooding. Consider selling stored crop next week.",
        urgency: "low",
        icon: "circle-dollar-sign",
        expiresIn: "7 days",
      },
      {
        id: "pests",
        title: "Pest Monitoring Needed",
        description: "Current humidity levels create high risk for fungal diseases. Inspect crops this week.",
        urgency: "medium",
        icon: "x-circle",
        expiresIn: "5 days",
      },
    ];
    
    // Select a subset of actions based on random selection but weighted by urgency
    const selectedActions = [];
    const highUrgencyActions = allPossibleActions.filter(a => a.urgency === "high");
    const mediumUrgencyActions = allPossibleActions.filter(a => a.urgency === "medium");
    const lowUrgencyActions = allPossibleActions.filter(a => a.urgency === "low");
    
    // Always include at least one high urgency action if available
    if (highUrgencyActions.length > 0) {
      selectedActions.push(highUrgencyActions[Math.floor(Math.random() * highUrgencyActions.length)]);
    }
    
    // Add some medium urgency actions
    mediumUrgencyActions.forEach(action => {
      if (Math.random() > 0.4 && !selectedActions.some(a => a.id === action.id)) {
        selectedActions.push(action);
      }
    });
    
    // Add some low urgency actions
    lowUrgencyActions.forEach(action => {
      if (Math.random() > 0.7 && !selectedActions.some(a => a.id === action.id)) {
        selectedActions.push(action);
      }
    });
    
    // Sort by urgency
    selectedActions.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
    });
    
    setActions(selectedActions);
  };

  const getActionIcon = (icon: string) => {
    switch(icon) {
      case "droplet": return <Droplet className="h-5 w-5" />;
      case "shield-alert": return <ShieldAlert className="h-5 w-5" />;
      case "tractor": return <Tractor className="h-5 w-5" />;
      case "circle-dollar-sign": return <CircleDollarSign className="h-5 w-5" />;
      case "x-circle": return <XCircle className="h-5 w-5" />;
      default: return <Wheat className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case "high": return "bg-red-500 hover:bg-red-600";
      case "medium": return "bg-amber-500 hover:bg-amber-600";
      default: return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case "high": return (
        <Badge className="bg-red-500">Urgent</Badge>
      );
      case "medium": return (
        <Badge className="bg-amber-500">Important</Badge>
      );
      default: return (
        <Badge className="bg-blue-500">Plan Ahead</Badge>
      );
    }
  };

  const toggleActionComplete = (id: string) => {
    if (completedActions.includes(id)) {
      setCompletedActions(completedActions.filter(actionId => actionId !== id));
    } else {
      setCompletedActions([...completedActions, id]);
    }
  };

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
        <p className="font-medium">No actions needed</p>
        <p className="text-sm mt-1">Weather conditions are optimal for your crops</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div 
          key={action.id} 
          className={`flex items-start space-x-3 p-3 rounded-lg border ${
            completedActions.includes(action.id) 
              ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-75' 
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className={`p-2 rounded-full ${getUrgencyColor(action.urgency)} text-white`}>
            {getActionIcon(action.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className={`font-semibold ${completedActions.includes(action.id) ? 'line-through text-muted-foreground' : ''}`}>
                {action.title}
              </h4>
              {!completedActions.includes(action.id) && getUrgencyBadge(action.urgency)}
            </div>
            <p className={`text-sm mt-1 ${completedActions.includes(action.id) ? 'text-muted-foreground' : ''}`}>
              {action.description}
            </p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Expires in: {action.expiresIn}</span>
              </div>
              <Button 
                variant={completedActions.includes(action.id) ? "outline" : "ghost"} 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => toggleActionComplete(action.id)}
              >
                {completedActions.includes(action.id) ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Mark Complete
                    <CheckCircle className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <Button variant="ghost" className="w-full text-sm" size="sm">
        <span className="flex items-center gap-1">
          <MoreHorizontal className="h-4 w-4" />
          View All Farm Tasks
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </span>
      </Button>
    </div>
  );
}
