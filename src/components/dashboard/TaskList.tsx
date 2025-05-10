
import React, { useEffect, useState } from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  field_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string | null;
  status: 'pending' | 'completed' | 'overdue';
  ai_recommended: boolean;
  completed_at: string | null;
  field_name?: string; // Added for display
}

interface TaskListProps {
  className?: string;
  onTaskComplete?: (completedCount: number) => void;
}

export function TaskList({ className, onTaskComplete }: TaskListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Try loading from localStorage first
      const localTasksStr = localStorage.getItem(`today_tasks_${user.id}`);
      let localTasks = localTasksStr ? JSON.parse(localTasksStr) : null;
      
      if (localTasks) {
        setTasks(localTasks);
      }
      
      // If online, fetch from Supabase
      if (isOnline()) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch tasks with field name (inner join)
        const { data, error: tasksError } = await supabase
          .from('field_tasks')
          .select(`
            *,
            fields:field_id (name)
          `)
          .eq('status', 'pending')
          .lte('due_date', today)
          .order('priority', { ascending: false })
          .order('due_date', { ascending: true });
          
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          setError("Couldn't load your tasks");
          return;
        }

        // Transform data to include field name
        const processedTasks = data.map(task => ({
          ...task,
          field_name: task.fields?.name || 'Unknown field'
        }));
        
        setTasks(processedTasks);
        localStorage.setItem(`today_tasks_${user.id}`, JSON.stringify(processedTasks));
      }
    } catch (err) {
      console.error("Error in task processing:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [user]);
  
  const completeTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
            : task
        )
      );
      
      // Update localStorage
      const completedCount = tasks.filter(t => t.status === 'completed').length + 1;
      localStorage.setItem(`completed_tasks_${user.id}`, completedCount.toString());
      
      // Notify parent component
      if (onTaskComplete) {
        onTaskComplete(completedCount);
      }
      
      if (isOnline()) {
        // Update in Supabase
        const { error: updateError } = await supabase
          .from('field_tasks')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
          
        if (updateError) {
          throw new Error(updateError.message);
        } else {
          toast({
            title: "Task completed",
            description: "Your farm health score has increased!",
            variant: "default",
          });
        }
      } else {
        // Queue for sync when back online
        const pendingUpdates = JSON.parse(localStorage.getItem('pending_task_updates') || '[]');
        pendingUpdates.push({
          id: taskId,
          status: 'completed',
          completed_at: new Date().toISOString()
        });
        localStorage.setItem('pending_task_updates', JSON.stringify(pendingUpdates));
        
        toast({
          title: "Task saved",
          description: "Will sync when you're back online",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error completing task:", err);
      toast({
        title: "Couldn't complete task",
        description: "Please try again",
        variant: "destructive",
      });
      
      // Revert the optimistic update
      fetchTasks();
    }
  };

  return (
    <Card className={cn("border-none shadow-md", className)}>
      <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 pb-2 pt-3 text-white">
        <CardTitle className="text-lg">Today's Farm Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-3 flex animate-pulse items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-6 text-center">
            <div>
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-orange-500" />
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => fetchTasks()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center">
            <div>
              <Check className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No tasks for today</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map(task => (
              <li 
                key={task.id}
                className={cn(
                  "transition-all duration-300",
                  task.status === 'completed' && "animate-task-complete opacity-50"
                )}
              >
                <div className="flex items-start gap-3 p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "mt-0.5 h-6 w-6 rounded-full p-0 border-gray-300",
                      task.status === 'completed' && "bg-green-500 border-green-500"
                    )}
                    onClick={() => task.status !== 'completed' && completeTask(task.id)}
                  >
                    {task.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-medium",
                        task.status === 'completed' && "line-through"
                      )}>
                        {task.title}
                      </h3>
                      {task.priority === 'high' && (
                        <Badge variant="destructive" className="ml-2">Urgent</Badge>
                      )}
                      {task.ai_recommended && (
                        <Badge variant="outline" className="ml-2 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.field_name}
                      {task.due_date && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </p>
                    
                    {task.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskList;
