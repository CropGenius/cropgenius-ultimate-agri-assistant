
import React, { useState } from 'react';
import { 
  Droplet, AlertTriangle, TrendingUp, Check, 
  ArrowRight, Bot, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'water' | 'harvest' | 'market' | 'other';
  urgent?: boolean;
  completed?: boolean;
}

interface MissionControlProps {
  actions?: ActionItem[];
  loading?: boolean;
}

export default function MissionControl({ actions = [], loading = false }: MissionControlProps) {
  const [localActions, setLocalActions] = useState<ActionItem[]>(actions);
  
  const handleComplete = (id: string) => {
    // Mark action as completed
    setLocalActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, completed: true } : action
      )
    );
    
    // Show success toast
    toast.success("Action completed", {
      description: "Your farm score has been updated"
    });
    
    // In a real app, you would update this in the database
  };
  
  // Function to get icon based on action type
  const getActionIcon = (action: ActionItem) => {
    switch(action.type) {
      case 'water':
        return <Droplet className={cn("h-5 w-5", action.urgent ? "text-blue-500" : "text-blue-400")} />;
      case 'harvest':
        return <AlertTriangle className={cn("h-5 w-5", action.urgent ? "text-amber-500" : "text-amber-400")} />;
      case 'market':
        return <TrendingUp className={cn("h-5 w-5", action.urgent ? "text-green-500" : "text-green-400")} />;
      default:
        return action.icon;
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Today's Genius Actions</h2>
        {localActions.length > 0 && <span className="text-xs text-muted-foreground">{localActions.filter(a => !a.completed).length} pending</span>}
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
        <div className="space-y-3">
          {localActions.map(action => (
            <Card 
              key={action.id}
              className={cn(
                "border-l-4 transition-all duration-300",
                action.completed ? "opacity-60 border-l-green-500 bg-muted/30" : 
                action.urgent ? "border-l-amber-500" : "border-l-primary/50"
              )}
            >
              <div className="p-3 flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full", 
                  action.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
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
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
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
      )}
      
      <div className="mt-5 mb-3">
        <Button variant="outline" className="w-full flex items-center gap-2 border-dashed">
          <Bot className="h-4 w-4" />
          Ask CropGenius
        </Button>
      </div>
    </div>
  );
}
