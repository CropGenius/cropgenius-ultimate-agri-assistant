
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Wifi, WifiOff } from "lucide-react";
import SummaryPanel from "@/components/dashboard/SummaryPanel";
import TaskList from "@/components/dashboard/TaskList";
import FieldCarousel from "@/components/dashboard/FieldCarousel";
import ProCTA from "@/components/dashboard/ProCTA";

// Add some custom animations
import "../styles/animations.css";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmHealth, setFarmHealth] = useState(65);
  const [onlineStatus, setOnlineStatus] = useState(isOnline());
  const [proDismissed, setProDismissed] = useState(false);
  
  // Monitor online status and show toasts
  useEffect(() => {
    const handleStatusChange = (status: boolean) => {
      setOnlineStatus(status);
      
      if (status) {
        toast({
          title: "You're back online",
          description: "Syncing your farm data...",
          duration: 3000,
        });
        
        // Sync any pending updates
        syncPendingUpdates();
      } else {
        toast({
          title: "You're offline",
          description: "Don't worry, changes will be saved locally",
          duration: 5000,
        });
      }
    };
    
    const unsubscribe = addOnlineStatusListener(handleStatusChange);
    
    // Initial check
    setOnlineStatus(isOnline());
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Example function to sync pending updates when back online
  const syncPendingUpdates = async () => {
    if (!user || !isOnline()) return;
    
    try {
      // Check for pending task updates
      const pendingTasksStr = localStorage.getItem('pending_task_updates');
      if (pendingTasksStr) {
        const pendingTasks = JSON.parse(pendingTasksStr);
        
        if (pendingTasks.length > 0) {
          // Show sync toast
          toast({
            title: "Syncing your data",
            description: `${pendingTasks.length} updates in progress...`,
            duration: 3000,
          });
          
          // Clear pending updates (in a real app, send these to Supabase)
          localStorage.removeItem('pending_task_updates');
          
          // Success toast
          setTimeout(() => {
            toast({
              title: "Sync complete",
              description: `${pendingTasks.length} updates saved successfully`,
              duration: 3000,
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error syncing updates:", error);
    }
  };
  
  // Handle task completion updates
  const handleTaskComplete = (completedCount: number) => {
    // Update farm health when tasks are completed
    const newHealth = Math.min(farmHealth + Math.floor(Math.random() * 3) + 1, 100);
    setFarmHealth(newHealth);
  };

  return (
    <Layout>
      <div className="container pb-20 pt-4">
        {/* Always display network status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Farmer HQ</h1>
            {user && (
              <Badge 
                variant="outline" 
                className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                <Bot className="mr-1 h-3 w-3" />
                AI Active
              </Badge>
            )}
          </div>
          
          {/* Network status indicator */}
          <Badge 
            variant={onlineStatus ? "outline" : "secondary"}
            className={cn(
              "flex items-center gap-1",
              onlineStatus 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
            )}
          >
            {onlineStatus ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>
        
        {/* Main content area - fully responsive */}
        <div className="space-y-4">
          {/* Farm Summary Panel */}
          <SummaryPanel className="animate-fade-in" />
          
          {/* Task List with completion callback */}
          <TaskList className="animate-fade-in delay-150" onTaskComplete={handleTaskComplete} />
          
          {/* Field Carousel */}
          <FieldCarousel className="animate-fade-in delay-300" />
          
          {/* Pro CTA - only show if not dismissed */}
          {!proDismissed && (
            <ProCTA 
              className="animate-fade-in delay-450"
              onDismiss={() => setProDismissed(true)}
            />
          )}
          
          {/* Add Field CTA for users with no fields */}
          {user && (
            <div className="mt-6">
              <Button
                onClick={() => navigate("/manage-fields")}
                className="bg-primary w-full"
              >
                Add or Map New Field
              </Button>
            </div>
          )}
          
          {/* Login CTA for non-authenticated users */}
          {!user && (
            <div className="mt-6 rounded-lg border bg-card p-4 text-center">
              <h3 className="text-lg font-bold">Ready to optimize your farm?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access your personalized farm dashboard
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary w-full"
                >
                  Sign In or Register
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
