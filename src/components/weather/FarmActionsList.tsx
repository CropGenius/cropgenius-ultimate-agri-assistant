
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
  BarChart4,
  Zap,
  LineChart,
  Sprout,
  BadgeCheck,
  LucideProps,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
  const [farmScore, setFarmScore] = useState(68);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [scoreChange, setScoreChange] = useState(0);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    total: 0,
    efficiencyGain: 0,
    yieldBoost: 0
  });

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
        efficiencyGain: 12,
        yieldImpact: 3,
        actionButton: {
          text: "Adjust Water Schedule",
          onClick: () => handleAutomatedAction("irrigation", "Adjusted irrigation schedule automatically based on weather forecast. Water resources saved.")
        },
        chartData: {
          type: "rainfall",
          values: [10, 8, 6, 5, 28, 32, 15],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        }
      },
      {
        id: "heatwave",
        title: "Protect Crops",
        description: "Heatwave coming this weekend. Increase soil cover and prepare shade cloth for sensitive crops.",
        urgency: "high",
        icon: "shield-alert",
        expiresIn: "2 days",
        efficiencyGain: 19,
        yieldImpact: 8,
        actionButton: {
          text: "Deploy AI Heat Protection",
          onClick: () => handleAutomatedAction("heatwave", "AI has generated a heat protection plan for your crops. Instructions sent to your mobile device.")
        },
        chartData: {
          type: "temperature",
          values: [30, 32, 34, 37, 39, 38, 35],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        }
      },
      {
        id: "harvest",
        title: "Harvest Soon",
        description: "Rain may spoil stored maize if not harvested before Friday. Schedule harvest team now.",
        urgency: "high",
        icon: "tractor",
        expiresIn: "3 days",
        efficiencyGain: 22,
        yieldImpact: 12,
        actionButton: {
          text: "Schedule Harvest Team",
          onClick: () => handleAutomatedAction("harvest", "AI has scheduled your harvest team for Thursday. Text messages sent to all workers.")
        },
        chartData: {
          type: "harvest",
          values: [92, 94, 97, 99, 85, 70, 68],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        }
      },
      {
        id: "market",
        title: "Optimal Selling Time",
        description: "Market expects maize shortage due to regional flooding. Consider selling stored crop next week.",
        urgency: "low",
        icon: "circle-dollar-sign",
        expiresIn: "7 days",
        efficiencyGain: 15,
        yieldImpact: 0,
        actionButton: {
          text: "Find Best Buyers Now",
          onClick: () => handleAutomatedAction("market", "AI is connecting you with the top 3 buyers in your region. Expected price: 12% above market average.")
        },
        chartData: {
          type: "price",
          values: [105, 107, 110, 114, 120, 125, 128],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        }
      },
      {
        id: "pests",
        title: "Pest Monitoring Needed",
        description: "Current humidity levels create high risk for fungal diseases. Inspect crops this week.",
        urgency: "medium",
        icon: "x-circle",
        expiresIn: "5 days",
        efficiencyGain: 17,
        yieldImpact: 7,
        actionButton: {
          text: "Generate Treatment Plan",
          onClick: () => handleAutomatedAction("pests", "AI has analyzed your crops and generated a precise organic treatment plan to prevent fungal diseases.")
        },
        chartData: {
          type: "humidity",
          values: [65, 70, 75, 78, 72, 68, 65],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        }
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
    
    // Calculate task stats
    const totalActions = selectedActions.length;
    const completedCount = 0; // Initial completed count is 0
    const avgEfficiency = selectedActions.reduce((sum, action) => sum + action.efficiencyGain, 0) / totalActions;
    const totalYieldImpact = selectedActions.reduce((sum, action) => sum + action.yieldImpact, 0);
    
    setTaskStats({
      completed: completedCount,
      total: totalActions,
      efficiencyGain: avgEfficiency,
      yieldBoost: totalYieldImpact
    });
  };

  const handleAutomatedAction = (actionId: string, message: string) => {
    toast.success("AI Action Initiated", { 
      description: message,
      icon: <Zap className="h-5 w-5 text-amber-500" />
    });
    
    // Simulate AI working
    setTimeout(() => {
      toast.success("AI Action Completed", { 
        description: "Farm plan updated with new intelligence",
        icon: <BadgeCheck className="h-5 w-5 text-green-500" />
      });
      
      // Mark the action as completed
      if (!completedActions.includes(actionId)) {
        toggleActionComplete(actionId);
      }
    }, 2000);
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
    const action = actions.find(a => a.id === id);
    if (!action) return;
    
    let newCompletedActions;
    let scoreChangeValue = 0;
    let newStats = { ...taskStats };
    
    if (completedActions.includes(id)) {
      newCompletedActions = completedActions.filter(actionId => actionId !== id);
      scoreChangeValue = -5;
      newStats.completed--;
    } else {
      newCompletedActions = [...completedActions, id];
      scoreChangeValue = +5;
      newStats.completed++;
    }
    
    setCompletedActions(newCompletedActions);
    
    // Update farm score with animation
    setScoreChange(scoreChangeValue);
    setShowScoreAnimation(true);
    setFarmScore(prev => Math.min(100, Math.max(0, prev + scoreChangeValue)));
    
    // Update task stats
    setTaskStats(newStats);
    
    setTimeout(() => {
      setShowScoreAnimation(false);
    }, 2000);
  };

  // Simplified mini chart component
  const MiniChart = ({ type, data, labels }: { type: string, data: number[], labels: string[] }) => {
    const maxValue = Math.max(...data);
    const heights = data.map(val => (val / maxValue) * 100);
    
    const getChartColor = () => {
      switch(type) {
        case "rainfall": return "bg-blue-500";
        case "temperature": return "bg-red-500";
        case "humidity": return "bg-cyan-500";
        case "price": return "bg-green-500";
        case "harvest": return "bg-amber-500";
        default: return "bg-gray-500";
      }
    };
    
    return (
      <div className="flex items-end h-16 gap-1 pt-2">
        {heights.map((height, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-t ${getChartColor()}`} 
              style={{ height: `${height}%` }}
            ></div>
            <span className="text-[8px] mt-1 text-gray-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    );
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
      {/* Farm Efficiency Score */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border p-3 mb-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-sm flex items-center">
            <BarChart4 className="h-4 w-4 mr-1 text-purple-500" />
            AI Farm Efficiency Score
          </h3>
          <div className="flex items-center">
            <span className="font-bold text-xl">{farmScore}%</span>
            {showScoreAnimation && (
              <span className={`ml-1 text-xs ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'} animate-fade-in`}>
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </span>
            )}
          </div>
        </div>
        
        <Progress 
          value={farmScore} 
          className="h-2 mb-3"
        />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded flex flex-col">
            <span className="text-muted-foreground">Task Completion</span>
            <span className="font-medium">{taskStats.completed}/{taskStats.total} Tasks</span>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded flex flex-col">
            <span className="text-muted-foreground">Yield Impact</span>
            <span className="font-medium text-green-600 dark:text-green-400">+{taskStats.yieldBoost}% Boost</span>
          </div>
        </div>
      </div>
      
      {/* Actions List */}
      {actions.map((action) => (
        <div 
          key={action.id} 
          className={`flex flex-col space-y-3 p-3 rounded-lg border ${
            completedActions.includes(action.id) 
              ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-75' 
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          <div className="flex items-start space-x-3">
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
          
          {/* Data Visualization & Action Button */}
          {!completedActions.includes(action.id) && (
            <div className="pt-1 border-t">
              {/* Mini Chart Visualization */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="flex items-center">
                    <LineChart className="h-3 w-3 mr-1" />
                    {action.chartData.type === 'rainfall' && 'Rainfall Forecast (mm)'}
                    {action.chartData.type === 'temperature' && 'Temperature Trend (°C)'}
                    {action.chartData.type === 'humidity' && 'Humidity Levels (%)'}
                    {action.chartData.type === 'price' && 'Market Price Trend (%)'}
                    {action.chartData.type === 'harvest' && 'Crop Maturity Index (%)'}
                  </span>
                  <span className="flex items-center">
                    <Sprout className="h-3 w-3 mr-1 text-green-500" />
                    Impact: +{action.yieldImpact}% Yield
                  </span>
                </div>
                
                <MiniChart 
                  type={action.chartData.type} 
                  data={action.chartData.values}
                  labels={action.chartData.labels}
                />
              </div>
              
              {/* Instant Action Button */}
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
                size="sm"
                onClick={action.actionButton.onClick}
              >
                <Zap className="h-4 w-4 mr-2" />
                {action.actionButton.text}
              </Button>
            </div>
          )}
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
