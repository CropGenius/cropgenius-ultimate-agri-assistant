
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tractor, CheckCircle, AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueDate: string;
}

export default function TodaysFarmPlan() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
        },
        {
          id: "2",
          title: "Apply organic fungicide to maize - high humidity risk",
          priority: "medium",
          completed: false,
          dueDate: "Today",
        },
        {
          id: "3",
          title: "Harvest mature beans before Thursday rain",
          priority: "high",
          completed: false,
          dueDate: "Tomorrow",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": 
        return <Badge className="bg-red-500">Urgent</Badge>;
      case "medium": 
        return <Badge className="bg-amber-500">Important</Badge>;
      default: 
        return <Badge>Plan Ahead</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
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
                className={`p-3 border rounded-lg flex items-start gap-3 ${
                  task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <Button 
                  size="sm" 
                  variant={task.completed ? "default" : "outline"} 
                  className="h-6 w-6 rounded-full p-0 min-h-0"
                  onClick={() => toggleTask(task.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="sr-only">Complete task</span>
                </Button>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    {!task.completed && getPriorityBadge(task.priority)}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Link to="/farm-plan">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <span className="flex items-center gap-1">
                  <Tractor className="h-4 w-4" />
                  View Complete Farm Plan
                  <ArrowRight className="h-3 w-3 ml-1" />
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
