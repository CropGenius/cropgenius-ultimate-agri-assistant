import React from 'react';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  MoreHorizontal,
  ArrowRight,
  Zap,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import FarmScoreCard from "./FarmScoreCard";
import ActionItem from "./ActionItem";

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
      <FarmScoreCard 
        farmScore={farmScore}
        scoreChange={scoreChange}
        showScoreAnimation={showScoreAnimation}
        taskStats={taskStats}
      />
      
      {/* Actions List */}
      {actions.map((action) => (
        <ActionItem 
          key={action.id}
          action={action}
          isCompleted={completedActions.includes(action.id)}
          onToggleComplete={toggleActionComplete}
        />
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
