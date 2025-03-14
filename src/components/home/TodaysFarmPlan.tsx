
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tractor, CheckCircle, AlertTriangle, Calendar, ArrowRight, Clock, Droplet, ThermometerSun, Wind } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueDate: string;
  type: "irrigation" | "harvest" | "pest" | "fertilizer" | "other";
  completionPercentage?: number;
  weather?: {
    affectedBy: string;
    recommendation: string;
  };
}

export default function TodaysFarmPlan() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    // In a production app, this would fetch from Supabase
    // For now, we'll use sample data that simulates AI farm recommendations
    setTimeout(() => {
      setTasks([
        {
          id: "1",
          title: "Water tomato beds - predicted rainfall insufficient",
          priority: "high",
          completed: false,
          dueDate: "Today",
          type: "irrigation",
          completionPercentage: 0,
          weather: {
            affectedBy: "Low rainfall probability (15%)",
            recommendation: "Complete before noon for optimal water absorption"
          }
        },
        {
          id: "2",
          title: "Apply organic fungicide to maize - high humidity risk",
          priority: "medium",
          completed: false,
          dueDate: "Today",
          type: "pest",
          completionPercentage: 0,
          weather: {
            affectedBy: "High humidity (75%)",
            recommendation: "Apply during dry period in late morning"
          }
        },
        {
          id: "3",
          title: "Harvest mature beans before Thursday rain",
          priority: "high",
          completed: false,
          dueDate: "Tomorrow",
          type: "harvest",
          completionPercentage: 0,
          weather: {
            affectedBy: "Heavy rain forecast (Thursday)",
            recommendation: "Complete harvesting within next 36 hours"
          }
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        return { 
          ...task, 
          completed: newCompleted,
          completionPercentage: newCompleted ? 100 : 0
        };
      }
      return task;
    }));
  };

  const updateProgress = (id: string, percentage: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { 
          ...task, 
          completionPercentage: percentage,
          completed: percentage === 100
        };
      }
      return task;
    }));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": 
        return <Badge className="bg-red-500 animate-pulse">Urgent</Badge>;
      case "medium": 
        return <Badge className="bg-amber-500">Important</Badge>;
      default: 
        return <Badge>Plan Ahead</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "irrigation":
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case "harvest":
        return <Tractor className="h-4 w-4 text-green-500" />;
      case "pest":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "fertilizer":
        return <ThermometerSun className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleExpandTask = (id: string) => {
    if (expandedTask === id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(id);
    }
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardTitle className="flex justify-between items-center">
          <span>Today's AI Farm Plan</span>
          <Badge variant="outline" className="text-xs font-normal">AI-Powered</Badge>
        </CardTitle>
        <CardDescription>
          Smart recommendations based on your crops, weather, and soil data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} 
                className={`border rounded-lg flex flex-col transition-all ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' 
                    : 'bg-white border-gray-200 dark:bg-transparent dark:border-gray-700'
                } ${expandedTask === task.id ? 'shadow-md' : ''}`}
              >
                <div className="p-3 flex items-start gap-3">
                  <Button 
                    size="sm" 
                    variant={task.completed ? "default" : "outline"} 
                    className="h-6 w-6 rounded-full p-0 min-h-0 mt-0.5"
                    onClick={() => toggleTask(task.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Complete task</span>
                  </Button>
                  
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpandTask(task.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        {getTypeIcon(task.type)}
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                          {task.title}
                        </p>
                      </div>
                      {!task.completed && getPriorityBadge(task.priority)}
                    </div>
                    
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                        <span>{task.completionPercentage}% complete</span>
                      </div>
                      <Progress value={task.completionPercentage} className="h-1.5" />
                    </div>
                  </div>
                </div>
                
                {expandedTask === task.id && !task.completed && task.weather && (
                  <div className="px-3 pb-3 pt-1 ml-9 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 text-xs">
                      <div className="flex items-start gap-2 mb-2">
                        <Wind className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-300">Weather Impact:</span> 
                          <span className="text-blue-700 dark:text-blue-200 ml-1">{task.weather.affectedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-amber-800 dark:text-amber-300">AI Recommendation:</span>
                          <span className="text-amber-700 dark:text-amber-200 ml-1">{task.weather.recommendation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      {[25, 50, 75, 100].map(percent => (
                        <Button 
                          key={percent}
                          variant={task.completionPercentage >= percent ? "default" : "outline"} 
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateProgress(task.id, percent);
                          }}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Link to="/farm-plan">
              <Button variant="ghost" size="sm" className="w-full mt-2 group">
                <span className="flex items-center gap-1">
                  <Tractor className="h-4 w-4" />
                  View Complete Farm Plan
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium">No AI plan generated yet</p>
            <p className="text-xs text-gray-500 mb-4">Add your crops to get personalized recommendations</p>
            <Link to="/farm-plan">
              <Button size="sm">Set Up Farm Plan</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
