
import React, { useState, useEffect } from 'react';
import { 
  Droplet, AlertTriangle, TrendingUp, Check, 
  ArrowRight, Bot, Loader2, Sparkles, Mic, MessageCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'water' | 'harvest' | 'market' | 'other';
  urgency: 'critical' | 'recommended' | 'optional';
  potential_gain: number;
  deadline: string;
  completed?: boolean;
}

interface MissionControlProps {
  actions?: ActionItem[];
  loading?: boolean;
}

export default function MissionControl({ actions = [], loading = false }: MissionControlProps) {
  const navigate = useNavigate();
  const [localActions, setLocalActions] = useState<ActionItem[]>(actions);
  const [completedCount, setCompletedCount] = useState(0);
  const [potentialValue, setPotentialValue] = useState(0);
  const [streak, setStreak] = useState(3);
  
  useEffect(() => {
    if (actions.length > 0) {
      setLocalActions(actions);
      
      // Calculate completed count and potential value
      const completed = actions.filter(a => a.completed).length;
      setCompletedCount(completed);
      
      const value = actions.reduce((sum, action) => {
        return action.completed ? sum : sum + action.potential_gain;
      }, 0);
      setPotentialValue(value);
    } else {
      // Demo data
      setLocalActions([
        {
          id: '1',
          title: 'Rain in 36h — Harvest now!',
          description: 'Heavy rain forecast. Complete harvest to prevent grain damage.',
          icon: null,
          type: 'harvest',
          urgency: 'critical',
          potential_gain: 12500,
          deadline: '36h remaining',
          completed: false
        },
        {
          id: '2',
          title: 'Irrigate Field B — Moisture 21%',
          description: 'Low soil moisture detected in Eastern section. Irrigation recommended.',
          icon: null,
          type: 'water',
          urgency: 'recommended',
          potential_gain: 8400,
          deadline: '3d remaining',
          completed: false
        },
        {
          id: '3', 
          title: 'Beans up +11% this week',
          description: 'Market prices rising. Consider selling your harvest this week.',
          icon: null,
          type: 'market',
          urgency: 'optional',
          potential_gain: 5200,
          deadline: '5d remaining',
          completed: true
        }
      ]);
      
      // Calculate default values
      setCompletedCount(1);
      setPotentialValue(20900);
    }
  }, [actions]);
  
  const handleComplete = (id: string) => {
    // Mark action as completed
    setLocalActions(prev => 
      prev.map(action => {
        if (action.id === id) {
          // If this action was not previously completed
          if (!action.completed) {
            setCompletedCount(c => c + 1);
          }
          return { ...action, completed: true };
        }
        return action;
      })
    );
    
    // Show success toast with animation
    toast.success("Action completed!", {
      description: "Your farm score has been updated",
      icon: <Check className="h-4 w-4 text-green-500" />,
      position: "top-center",
      duration: 3000,
      className: cn(
        "border-green-500/20 bg-green-500/10",
        "animate-in slide-in-from-top-full"
      )
    });
    
    // In a real app, you would update this in the database
  };
  
  // Function to get icon based on action type and urgency
  const getActionIcon = (action: ActionItem) => {
    if (action.icon) return action.icon;
    
    switch(action.type) {
      case 'water':
        return <Droplet className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-blue-500" : 
          action.urgency === 'recommended' ? "text-blue-400" : 
          "text-blue-300"
        )} />;
      case 'harvest':
        return <AlertTriangle className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-red-500" : 
          action.urgency === 'recommended' ? "text-amber-500" : 
          "text-amber-400"
        )} />;
      case 'market':
        return <TrendingUp className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-green-500" : 
          action.urgency === 'recommended' ? "text-green-400" : 
          "text-green-300"
        )} />;
      default:
        return <Zap className="h-5 w-5 text-purple-400" />;
    }
  };
  
  // Function to get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'critical':
        return "border-l-red-500";
      case 'recommended':
        return "border-l-amber-500";
      case 'optional':
        return "border-l-blue-500";
      default:
        return "border-l-primary/50";
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Today's Genius Actions</h2>
        {localActions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{localActions.length} complete
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
        </div>
      ) : localActions.length === 0 ? (
        <Card className="bg-muted/30 border-dashed mb-4">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p>No actions for today. Great work!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {localActions
              .sort((a, b) => {
                // Sort by urgency first, then by completion status
                const urgencyOrder = { critical: 0, recommended: 1, optional: 2 };
                const urgencyA = urgencyOrder[a.urgency as keyof typeof urgencyOrder];
                const urgencyB = urgencyOrder[b.urgency as keyof typeof urgencyOrder];
                
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return urgencyA - urgencyB;
              })
              .map((action, index) => (
                <Card 
                  key={action.id}
                  className={cn(
                    "border-l-4 transition-all duration-300 overflow-hidden animate-fade-in",
                    action.completed ? "opacity-60 border-l-green-500 bg-muted/30" : 
                    getUrgencyColor(action.urgency),
                    {"animate-in zoom-in-95": index < 3},
                  )}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="p-3 flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full", 
                      action.completed ? "bg-green-100 dark:bg-green-900/30" : 
                      action.urgency === 'critical' ? "bg-red-100 dark:bg-red-900/30" :
                      action.urgency === 'recommended' ? "bg-amber-100 dark:bg-amber-900/30" :
                      "bg-blue-100 dark:bg-blue-900/30"
                    )}>
                      {action.completed ? 
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                        getActionIcon(action)
                      }
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium leading-none mb-1">
                        {action.title}
                      </h3>
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                        <div className="text-xs font-medium text-green-600 dark:text-green-400 ml-2 whitespace-nowrap">
                          ₦{action.potential_gain.toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {action.deadline}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-8 w-8 p-0 rounded-full",
                        !action.completed && "hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30"
                      )}
                      disabled={action.completed}
                      onClick={() => handleComplete(action.id)}
                    >
                      {action.completed ? 
                        <Check className="h-4 w-4 text-green-600" /> : 
                        <ArrowRight className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
          
          {/* Progress and streak section */}
          <div className="mt-4 space-y-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{completedCount} of {localActions.length} Genius Actions complete</span>
                <span className="text-green-600 font-medium">₦{potentialValue.toLocaleString()} value</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${(completedCount / localActions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-lg p-2 flex items-center gap-2 flex-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">{streak}-Day Action Streak</span>
                <span className="text-xs text-primary ml-auto">+Pro Bonus</span>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="gap-1 bg-background border-primary/20 hover:border-primary/40"
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <Mic className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
