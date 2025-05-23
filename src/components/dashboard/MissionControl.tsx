
import React, { useState, useEffect } from 'react';
import { 
  Droplet, AlertTriangle, TrendingUp, Check, 
  ArrowRight, Bot, Loader2, Mic, MessageCircle,
  Zap, Star, Scissors
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon?: string | React.ReactNode | null;
  type: 'water' | 'harvest' | 'market' | 'other';
  urgency?: 'critical' | 'recommended' | 'optional';
  potential_gain?: number;
  deadline?: string;
  urgent?: boolean;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  ai_generated?: boolean;
  completed_date?: string;
  estimated_time?: number | string;
  field?: string;
}

interface MissionControlProps {
  actions?: ActionItem[];
  loading?: boolean;
}

export default function MissionControl({ actions = [], loading = false }: MissionControlProps) {
  const navigate = useNavigate();
  const [localActions, setLocalActions] = useState<ActionItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [potentialValue, setPotentialValue] = useState(0);
  const [streak, setStreak] = useState(3);
  
  useEffect(() => {
    if (actions.length > 0) {
      // Enhance received actions with default values
      const enhancedActions = actions.map(action => ({
        ...action,
        urgency: action.urgent ? 'critical' as const : 'recommended' as const,
        deadline: action.deadline || '24h remaining',
        potential_gain: action.potential_gain || 0
      }));
      
      setLocalActions(enhancedActions);
      
      // Calculate completed count and potential value
      const completed = enhancedActions.filter(a => a.completed).length;
      setCompletedCount(completed);
      
      const value = enhancedActions.reduce((sum, action) => {
        return action.completed ? sum : sum + (action.potential_gain || 0);
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
    // If the icon is a string, convert it to the corresponding lucide icon
    if (typeof action.icon === 'string') {
      const iconName = action.icon.toLowerCase();
      switch(iconName) {
        case 'droplet':
          return <Droplet className="h-5 w-5 text-blue-500" />;
        case 'alert-triangle':
        case 'alerttriangle':
          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case 'trending-up':
        case 'trendingup':
          return <TrendingUp className="h-5 w-5 text-green-500" />;
        case 'scissors':
          return <Scissors className="h-5 w-5 text-red-500" />;
        case 'zap':
          return <Zap className="h-5 w-5 text-purple-500" />;
        case 'star':
          return <Star className="h-5 w-5 text-amber-500" />;
        default:
          // For any other string icon, default to Zap
          return <Zap className="h-5 w-5 text-primary" />;
      }
    }
    
    // If it's a React node, return it directly
    if (action.icon) return action.icon;
    
    // Fallback to type-based icon if no icon property exists
    switch(action.type) {
      case 'water':
        return <Droplet className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-blue-500" : 
          action.urgency === 'recommended' ? "text-blue-400" : 
          "text-blue-300"
        )} />;
      case 'harvest':
        return <Scissors className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-red-500" : 
          action.urgency === 'recommended' ? "text-amber-500" : 
          "text-yellow-400"
        )} />;
      case 'market':
        return <TrendingUp className={cn(
          "h-5 w-5", 
          action.urgency === 'critical' ? "text-green-600" : 
          action.urgency === 'recommended' ? "text-green-500" : 
          "text-green-400"
        )} />;
      default:
        return <Zap className="h-5 w-5 text-primary" />;
    }
  };
  
  // Function to get urgency color
  const getUrgencyColor = (urgency: 'critical' | 'recommended' | 'optional' | string) => {
    switch(urgency) {
      case 'critical':
        return "border-l-red-500";
      case 'recommended':
        return "border-l-orange-500";
      case 'optional':
        return "border-l-green-500";
      default:
        return "border-l-slate-500";
    }
  };

  return (
    <div className="px-4 mt-6 pb-2 container-safe block !visible" style={{display: 'block'}}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Today's Genius Actions</h2>
        {completedCount > 0 && (
          <Badge className="bg-primary/20 text-primary text-xs">
            {completedCount}/{localActions.length} complete
          </Badge>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : localActions.length === 0 ? (
        <Card className="bg-muted/30 border-dashed mb-4">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p>No actions for today. Great work!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-4 overflow-visible">
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
                <div key={action.id} className="mb-3 last:mb-0 group">
                  <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow">
                    <CardContent className="p-3 flex items-start">
                      {/* Left - Icon */}
                      <div className="mr-3 mt-0.5">
                        <div className={`p-2 rounded-full ${action.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                          {action.icon === 'droplet' && <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                          {action.icon === 'alert' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                          {action.icon === 'trend' && <TrendingUp className="h-5 w-5 text-emerald-500" />}
                          {action.icon === 'check' && <Check className="h-5 w-5 text-emerald-500" />}
                          {action.icon === 'bot' && <Bot className="h-5 w-5 text-violet-500" />}
                          {action.icon === 'mic' && <Mic className="h-5 w-5 text-blue-500" />}
                          {action.icon === 'message' && <MessageCircle className="h-5 w-5 text-slate-500" />}
                          {action.icon === 'zap' && <Zap className="h-5 w-5 text-amber-500" />}
                          {action.icon === 'star' && <Star className="h-5 w-5 text-amber-500" />}
                          {action.icon === 'scissors' && <Scissors className="h-5 w-5 text-slate-500" />}
                        </div>
                      </div>
                      
                      {/* Center - Action Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200 line-clamp-1">
                            {action.title}
                          </h3>
                          
                          {/* Show badge if high priority */}
                          {action.priority === 'high' && (
                            <Badge variant="warning" className="ml-2 py-0 px-1.5">Priority</Badge>
                          )}
                          
                          {/* Show expert badge if AI generated */}
                          {action.ai_generated && (
                            <Badge variant="secondary" className="ml-2 py-0 px-1.5">AI</Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                        
                        {action.completed ? (
                          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Completed {action.completed_date}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center">
                            <div className="text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                              {action.potential_gain ? `₦${action.potential_gain.toLocaleString()}` : '₦0'}
                            </div>
                            
                            <div className="text-xs text-slate-400 dark:text-slate-500 ml-3">
                              {action.estimated_time ? `~${action.estimated_time} min` : ''}
                            </div>
                            
                            {/* Field link if present */}
                            {action.field && (
                              <span className="text-xs ml-3 text-blue-500 dark:text-blue-400 underline-offset-2 hover:underline">
                                {action.field}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Right - Action Buttons */}
                      <div className="ml-3 flex flex-col items-end">
                        <Button 
                          variant="ghost" 
                          className="p-1.5 h-auto" 
                          onClick={() => handleComplete(action.id)}
                        >
                          {action.completed ? 
                            <Check className="h-4 w-4 text-emerald-500" /> : 
                            <ArrowRight className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                <Star className="h-4 w-4 text-amber-500" />
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
