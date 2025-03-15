
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tractor, CheckCircle, AlertTriangle, Calendar, ArrowRight, Clock, Droplet, ThermometerSun, Wind, Sun, CloudRain, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueDate: string;
  dueTime?: string;
  type: "irrigation" | "harvest" | "pest" | "fertilizer" | "other";
  completionPercentage: number;
  weather?: {
    affectedBy: string;
    recommendation: string;
  };
  aiImportance?: number; // 1-10 scale
  impact?: string;
  isOverdue?: boolean;
}

export default function TodaysFarmPlan() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [farmScore, setFarmScore] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // In a production app, this would fetch from Supabase
    // For now, we'll use sample data that simulates AI farm recommendations
    setTimeout(() => {
      const todaysTasks = [
        {
          id: "1",
          title: "Water tomato beds - predicted rainfall insufficient",
          priority: "high",
          completed: false,
          dueDate: "Today",
          dueTime: "Before noon",
          type: "irrigation",
          completionPercentage: 0,
          weather: {
            affectedBy: "Low rainfall probability (15%)",
            recommendation: "Complete before noon for optimal water absorption"
          },
          aiImportance: 9,
          impact: "Prevents yield loss of up to 30%",
          isOverdue: false
        },
        {
          id: "2",
          title: "Apply organic fungicide to maize - high humidity risk",
          priority: "medium",
          completed: false,
          dueDate: "Today",
          dueTime: "By 3 PM",
          type: "pest",
          completionPercentage: 0,
          weather: {
            affectedBy: "High humidity (75%)",
            recommendation: "Apply during dry period in late morning"
          },
          aiImportance: 7,
          impact: "Prevents spread of fungal infection",
          isOverdue: false
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
          },
          aiImportance: 10,
          impact: "Secures maximum crop value",
          isOverdue: false
        },
        {
          id: "4",
          title: "Thin out crowded seedlings in northwest field",
          priority: "low",
          completed: false,
          dueDate: "This week",
          type: "other",
          completionPercentage: 0,
          weather: {
            affectedBy: "Ideal weather conditions all week",
            recommendation: "Can be done any time this week"
          },
          aiImportance: 5,
          impact: "Improves growth of remaining plants",
          isOverdue: false
        },
      ];
      setTasks(todaysTasks);
      setLoading(false);
      calculateFarmScore(todaysTasks);
    }, 1000);
  }, []);

  const calculateFarmScore = (taskList: Task[]) => {
    // Score starts at 60, completed high priority tasks add more points
    let score = 60;
    taskList.forEach(task => {
      if (task.completed) {
        if (task.priority === 'high') score += 10;
        else if (task.priority === 'medium') score += 6;
        else score += 3;
      } else if (task.isOverdue && task.priority === 'high') {
        score -= 8;
      } else if (task.isOverdue && task.priority === 'medium') {
        score -= 4;
      }
    });
    
    // Cap at 100
    score = Math.min(100, Math.max(0, score));
    
    // Animate the score updating
    let currentScore = 0;
    const interval = setInterval(() => {
      if (currentScore < score) {
        currentScore += 1;
        setFarmScore(currentScore);
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        const updatedTask = { 
          ...task, 
          completed: newCompleted,
          completionPercentage: newCompleted ? 100 : 0
        };
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
    calculateFarmScore(updatedTasks);
    
    // Show animation briefly
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 2000);
  };

  const updateProgress = (id: string, percentage: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { 
          ...task, 
          completionPercentage: percentage,
          completed: percentage === 100
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    calculateFarmScore(updatedTasks);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": 
        return <Badge className="bg-red-500 animate-pulse">Urgent</Badge>;
      case "medium": 
        return <Badge className="bg-amber-500">Important</Badge>;
      default: 
        return <Badge variant="outline">Plan Ahead</Badge>;
    }
  };

  const getTypeIcon = (type: string, size: number = 4) => {
    const className = `h-${size} w-${size}`;
    switch (type) {
      case "irrigation":
        return <Droplet className={className} style={{ height: `${size/4}rem`, width: `${size/4}rem` }} className="text-blue-500" />;
      case "harvest":
        return <Tractor className={className} style={{ height: `${size/4}rem`, width: `${size/4}rem` }} className="text-green-500" />;
      case "pest":
        return <ShieldAlert className={className} style={{ height: `${size/4}rem`, width: `${size/4}rem` }} className="text-amber-500" />;
      case "fertilizer":
        return <ThermometerSun className={className} style={{ height: `${size/4}rem`, width: `${size/4}rem` }} className="text-purple-500" />;
      default:
        return <Calendar className={className} style={{ height: `${size/4}rem`, width: `${size/4}rem` }} className="text-gray-500" />;
    }
  };

  const getWeatherIcon = (recommendation: string) => {
    if (recommendation.includes("rain")) return <CloudRain className="h-4 w-4 text-blue-500" />;
    if (recommendation.includes("dry")) return <Sun className="h-4 w-4 text-amber-500" />;
    if (recommendation.includes("humidity")) return <Droplet className="h-4 w-4 text-blue-500" />;
    return <Wind className="h-4 w-4 text-blue-500" />;
  };

  const toggleExpandTask = (id: string) => {
    if (expandedTask === id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(id);
    }
  };

  const getFarmScoreColor = () => {
    if (farmScore >= 80) return "text-green-500";
    if (farmScore >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className="h-full border-2 hover:border-primary/50 transition-all relative">
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
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm font-medium">Farm Health Score</p>
                <p className="text-xs text-muted-foreground">Based on task completion</p>
              </div>
              <div className={`text-xl font-bold ${getFarmScoreColor()} flex items-center gap-1`}>
                {farmScore}%
                {showAnimation && (
                  <span className="text-green-500 animate-fade-in text-xs font-normal">
                    ↑ +5
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-3">
              <Progress value={farmScore} className="h-2" />
            </div>
            
            {tasks.map((task) => (
              <div key={task.id} 
                className={`border rounded-lg flex flex-col transition-all ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' 
                    : task.priority === 'high' && !task.completed
                    ? 'bg-white border-red-200 dark:bg-transparent dark:border-red-900/50'
                    : 'bg-white border-gray-200 dark:bg-transparent dark:border-gray-700'
                } ${expandedTask === task.id ? 'shadow-md' : ''}`}
              >
                <div className="p-3 flex items-start gap-3">
                  <Button 
                    size="sm" 
                    variant={task.completed ? "default" : "outline"} 
                    className={`h-6 w-6 rounded-full p-0 min-h-0 mt-0.5 ${
                      task.priority === 'high' && !task.completed 
                        ? 'border-red-400 hover:border-red-500 dark:border-red-700'
                        : ''
                    }`}
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
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.dueDate}{task.dueTime ? `, ${task.dueTime}` : ''}
                        </span>
                      </div>
                      
                      {task.aiImportance && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">AI Priority:</span>
                          <div className="flex items-center h-2">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                                  i < Math.ceil(task.aiImportance! / 2)
                                    ? task.priority === 'high'
                                      ? 'bg-red-500'
                                      : task.priority === 'medium'
                                        ? 'bg-amber-500'
                                        : 'bg-blue-400'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{task.completionPercentage}% complete</span>
                      </div>
                      <Progress 
                        value={task.completionPercentage} 
                        className={`h-1.5 ${
                          task.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-950/30'
                            : task.priority === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-950/30'
                              : ''
                        }`} 
                      />
                    </div>
                  </div>
                </div>
                
                {expandedTask === task.id && !task.completed && task.weather && (
                  <div className="px-3 pb-3 pt-1 ml-9 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 text-xs">
                      <div className="flex items-start gap-2 mb-2">
                        {getWeatherIcon(task.weather.recommendation)}
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
                    
                    {task.impact && (
                      <div className="mt-2 px-2 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-md text-xs flex items-start gap-2">
                        <span className="font-medium text-violet-800 dark:text-violet-300">Impact:</span>
                        <span className="text-violet-700 dark:text-violet-200">{task.impact}</span>
                      </div>
                    )}
                    
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
      
      {/* Animated notification for new AI recommendations */}
      {!loading && tasks.some(t => t.priority === 'high' && !t.completed) && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <Badge className="bg-red-500 py-1 px-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span className="text-xs">Urgent Tasks</span>
          </Badge>
        </div>
      )}
    </Card>
  );
}
