import React from 'react';
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  CloudRain, 
  Droplets, 
  Leaf, 
  RotateCw, 
  ShoppingCart, 
  Sun, 
  Zap,
  Check,
  Plus,
  Bell,
  AlertTriangle,
  CloudSun,
  Calendar as CalendarIcon
} from "lucide-react";

interface Task {
  id: number;
  text: string;
  category: string;
  priority: string;
  icon: any; // Using any for simplicity, but ideally should be more specific
  due: string;
  completed: boolean;
  reminderSet: boolean;
  aiRecommended: boolean;
  conditions: string[];
  isNew?: boolean; // Add the isNew property as optional
}

interface WeatherAlert {
  id: number;
  title: string;
  description: string;
  impact: string;
  icon: any;
  isNew: boolean;
}

const FarmPlan = () => {
  const [farmer, setFarmer] = useState({
    name: "Brian",
    location: "Central Region",
    mainCrops: ["Maize", "Tomatoes", "Cassava"],
    farmSize: 4.5, // acres
    soilType: "Clay Loam",
    premiumStatus: true
  });

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      text: "Delay watering - rain expected in 36 hours",
      category: "water", 
      priority: "high",
      icon: CloudRain,
      due: "Tomorrow",
      completed: false,
      reminderSet: false,
      aiRecommended: true,
      conditions: ["Weather Forecast: Rain in 36hrs", "Soil Moisture: 68%"]
    },
    { 
      id: 2, 
      text: "Apply organic pest control - aphids detected", 
      category: "pest", 
      priority: "urgent",
      icon: Leaf,
      due: "Today",
      completed: false,
      reminderSet: false,
      aiRecommended: true,
      conditions: ["Pest Detection: Aphids", "Affected Area: Northeast Field", "Damage Level: Moderate"]
    },
    { 
      id: 3, 
      text: "Harvest maize in eastern field by Friday for optimal pricing", 
      category: "harvest", 
      priority: "medium",
      icon: ShoppingCart,
      due: "Friday",
      completed: false,
      reminderSet: false,
      aiRecommended: true,
      conditions: ["Crop Maturity: 95%", "Market Price Trend: Rising", "Weather: Clear until Saturday"]
    },
    { 
      id: 4, 
      text: "Test soil pH in southern field", 
      category: "soil", 
      priority: "low",
      icon: Droplets,
      due: "Next week",
      completed: false,
      reminderSet: false,
      aiRecommended: true,
      conditions: ["Last Test: 3 months ago", "Recent Rain: pH may have changed"]
    }
  ]);

  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([
    {
      id: 1,
      title: "Heavy Rain Warning",
      description: "90% chance of heavy rainfall in your area in the next 48 hours. Consider delaying any fertilizer application.",
      impact: "high",
      icon: CloudRain,
      isNew: true
    },
    {
      id: 2,
      title: "Heat Wave Expected",
      description: "Temperatures expected to reach 38°C by next week. Prepare additional irrigation for tomato crops.",
      impact: "medium",
      icon: Sun,
      isNew: false
    }
  ]);

  const [planOverview, setPlanOverview] = useState({
    completion: 68,
    weeklyTasks: 12,
    completedTasks: 8,
    pendingTasks: 4,
    highPriorityTasks: 2
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPlan = () => {
    setIsRefreshing(true);
    
    // Simulate AI analysis and plan update
    setTimeout(() => {
      toast.success("Farm plan updated with latest AI analysis", {
        description: "Analyzing soil conditions, weather patterns, and crop health",
      });
      
      // Add a new AI-suggested task with animation effect
      const newTask: Task = { 
        id: tasks.length + 1, 
        text: "Apply calcium nitrate to tomato plants to prevent blossom end rot", 
        category: "fertilizer", 
        priority: "medium",
        icon: Leaf,
        due: "Wednesday",
        completed: false,
        reminderSet: false,
        aiRecommended: true,
        conditions: ["Calcium Deficiency Detected", "Weather: Suitable for application"],
        isNew: true
      };
      
      setTasks([newTask, ...tasks]);
      
      // Update plan overview
      setPlanOverview({
        ...planOverview,
        completion: 64, // Decreased because we added a new task
        weeklyTasks: 13,
        pendingTasks: 5,
        highPriorityTasks: 2
      });
      
      setIsRefreshing(false);
    }, 2000);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    
    if (!task.completed) {
      toast.success(`Task marked as completed!`, {
        description: "Your farm plan has been updated",
      });
      
      // Update plan overview
      setPlanOverview({
        ...planOverview,
        completion: planOverview.completion + 8, // Increase completion percentage
        completedTasks: planOverview.completedTasks + 1,
        pendingTasks: planOverview.pendingTasks - 1
      });
    } else {
      toast.info(`Task marked as incomplete`, {
        description: "Your farm plan has been updated",
      });
      
      // Update plan overview
      setPlanOverview({
        ...planOverview,
        completion: planOverview.completion - 8, // Decrease completion percentage
        completedTasks: planOverview.completedTasks - 1,
        pendingTasks: planOverview.pendingTasks + 1
      });
    }
  };

  const setReminder = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, reminderSet: !task.reminderSet } 
        : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    
    if (!task.reminderSet) {
      toast.success(`Reminder set for ${task.due}`, {
        description: `We'll notify you about: ${task.text}`,
      });
    } else {
      toast.info(`Reminder canceled`, {
        description: `We won't remind you about this task anymore`,
      });
    }
  };

  const handleDismissAlert = (alertId) => {
    setWeatherAlerts(weatherAlerts.filter(alert => alert.id !== alertId));
    toast.info("Alert dismissed", {
      description: "You won't see this alert again",
    });
  };

  const handleActionAlert = (alertId) => {
    const alert = weatherAlerts.find(a => a.id === alertId);
    
    if (alertId === 1) { // Heavy Rain Warning
      // Add a suggested task based on the alert
      const newTask = { 
        id: tasks.length + 1, 
        text: "Cover sensitive crops before heavy rainfall", 
        category: "protection", 
        priority: "high",
        icon: CloudRain,
        due: "Today",
        completed: false,
        reminderSet: true,
        aiRecommended: true,
        conditions: ["Weather Alert: Heavy Rain", "Sensitive Crops: Tomatoes"],
        isNew: true
      };
      
      setTasks([newTask, ...tasks]);
      
      toast.success("Added new high-priority task", {
        description: "Cover sensitive crops before rainfall",
      });
      
      // Mark the alert as seen
      setWeatherAlerts(weatherAlerts.map(a => 
        a.id === alertId ? { ...a, isNew: false } : a
      ));
    } else if (alertId === 2) { // Heat Wave
      // Add a suggested task based on the alert
      const newTask = { 
        id: tasks.length + 1, 
        text: "Prepare additional irrigation for heat wave", 
        category: "water", 
        priority: "medium",
        icon: Sun,
        due: "Monday",
        completed: false,
        reminderSet: true,
        aiRecommended: true,
        conditions: ["Weather Alert: Heat Wave", "Affected Crops: Tomatoes, Maize"],
        isNew: true
      };
      
      setTasks([newTask, ...tasks]);
      
      toast.success("Added new task for heat wave preparation", {
        description: "Prepare additional irrigation by Monday",
      });
      
      // Mark the alert as seen
      setWeatherAlerts(weatherAlerts.map(a => 
        a.id === alertId ? { ...a, isNew: false } : a
      ));
    }
  };

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        {/* Header with AI Refresh Button */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-crop-green-700">AI Farm Plan</h1>
            <p className="text-gray-600">Personalized for {farmer.name}'s {farmer.farmSize} acre farm</p>
          </div>
          <Button 
            onClick={refreshPlan} 
            className="bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Update AI Plan
              </>
            )}
          </Button>
        </div>

        {/* Plan Overview Card */}
        <Card className="mb-5 border-crop-green-200 bg-crop-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-crop-green-700 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-crop-green-600" />
              This Week's Farm Plan
            </CardTitle>
            <CardDescription>AI-optimized for your specific crops and conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Plan Completion</span>
                <span className="text-sm font-medium">{planOverview.completion}%</span>
              </div>
              <Progress value={planOverview.completion} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500">Weekly Tasks</p>
                <p className="text-xl font-bold text-crop-green-700">{planOverview.weeklyTasks}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-crop-green-700">{planOverview.completedTasks}/{planOverview.weeklyTasks}</p>
              </div>
            </div>
            
            <div className="flex items-center bg-amber-50 p-2 rounded-md border border-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              <span className="text-sm text-amber-700">
                {planOverview.highPriorityTasks} high-priority tasks need your attention
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weather Alerts Section */}
        {weatherAlerts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <CloudSun className="h-5 w-5 mr-2 text-sky-blue-500" />
              AI Weather Alerts
            </h2>
            
            <div className="space-y-3">
              {weatherAlerts.map(alert => (
                <Card 
                  key={alert.id} 
                  className={`border-l-4 ${
                    alert.impact === 'high' 
                      ? 'border-l-red-500 bg-red-50' 
                      : alert.impact === 'medium' 
                        ? 'border-l-amber-500 bg-amber-50' 
                        : 'border-l-sky-blue-500 bg-sky-blue-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 ${
                          alert.impact === 'high' 
                            ? 'bg-red-100' 
                            : alert.impact === 'medium' 
                              ? 'bg-amber-100' 
                              : 'bg-sky-blue-100'
                        }`}>
                          <alert.icon className={`h-5 w-5 ${
                            alert.impact === 'high' 
                              ? 'text-red-500' 
                              : alert.impact === 'medium' 
                                ? 'text-amber-500' 
                                : 'text-sky-blue-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                            {alert.isNew && (
                              <Badge className="ml-2 bg-red-100 text-red-700 border-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDismissAlert(alert.id)}
                        className="text-gray-600"
                      >
                        Dismiss
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleActionAlert(alert.id)}
                        className={`${
                          alert.impact === 'high' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : alert.impact === 'medium' 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'bg-sky-blue-600 hover:bg-sky-blue-700'
                        } text-white`}
                      >
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Task List */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-crop-green-600" />
          AI-Recommended Tasks
        </h2>
        
        <div className="space-y-3 mb-6">
          {tasks.map(task => (
            <Card 
              key={task.id} 
              className={`relative overflow-hidden ${
                task.isNew ? 'animate-slide-down border-crop-green-400' : ''
              } ${
                task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div 
                    className={`flex-shrink-0 mr-3 h-10 w-10 rounded-full flex items-center justify-center ${
                      task.completed 
                        ? 'bg-gray-200' 
                        : task.priority === 'urgent' 
                          ? 'bg-red-100' 
                          : task.priority === 'high' 
                            ? 'bg-amber-100' 
                            : task.priority === 'medium' 
                              ? 'bg-sky-blue-100' 
                              : 'bg-gray-100'
                    }`}
                  >
                    <task.icon className={`h-5 w-5 ${
                      task.completed 
                        ? 'text-gray-400' 
                        : task.priority === 'urgent' 
                          ? 'text-red-500' 
                          : task.priority === 'high' 
                            ? 'text-amber-500' 
                            : task.priority === 'medium' 
                              ? 'text-sky-blue-500' 
                              : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center">
                      {task.priority === 'urgent' && (
                        <Badge className="mr-2 bg-red-100 text-red-700 border-0">
                          Urgent
                        </Badge>
                      )}
                      {task.priority === 'high' && (
                        <Badge className="mr-2 bg-amber-100 text-amber-700 border-0">
                          High Priority
                        </Badge>
                      )}
                      {task.isNew && (
                        <Badge className="mr-2 bg-crop-green-100 text-crop-green-700 border-0">
                          New Suggestion
                        </Badge>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 ml-auto">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {task.due}</span>
                      </div>
                    </div>
                    
                    <h3 className={`font-medium mt-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {task.text}
                    </h3>
                    
                    {!task.completed && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 font-medium mb-1">AI Analysis:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.conditions.map((condition, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-3 space-x-2">
                  {!task.completed && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReminder(task.id)}
                      className={`${task.reminderSet ? 'bg-amber-50 border-amber-200 text-amber-700' : 'text-gray-600'}`}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      {task.reminderSet ? 'Reminder Set' : 'Set Reminder'}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={task.completed 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-crop-green-600 hover:bg-crop-green-700 text-white'}
                  >
                    {task.completed ? (
                      <>
                        <RotateCw className="h-3 w-3 mr-1" />
                        Undo
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Custom Task Button */}
        <Button 
          variant="outline" 
          className="w-full border-dashed border-crop-green-300 text-crop-green-700 hover:bg-crop-green-50"
          onClick={() => {
            toast.info("This would open a form to add your own custom task");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Task
        </Button>
      </div>
    </Layout>
  );
};

export default FarmPlan;
