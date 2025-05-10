
import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Bell, BarChart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProCTAProps {
  className?: string;
  onDismiss?: () => void;
}

export function ProCTA({ className, onDismiss }: ProCTAProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if the user has already dismissed the CTA
  const [isDismissed, setIsDismissed] = React.useState(() => {
    if (!user) return false;
    return localStorage.getItem(`pro_cta_dismissed_${user.id}`) === 'true';
  });

  // For demo purposes, let's check if the user is a pro user
  const isProUser = false; // In a real app, check user's subscription status
  
  // If user is pro or CTA is dismissed, don't show
  if (isProUser || isDismissed) {
    return null;
  }
  
  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`pro_cta_dismissed_${user.id}`, 'true');
    }
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  const handleUpgrade = () => {
    // Navigate to pro upgrade page
    navigate("/referrals");
  };

  return (
    <Card className={cn("relative overflow-hidden border-none shadow-md", className)}>
      <div className="absolute right-2 top-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 rounded-full p-0 text-muted-foreground"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
      
      <CardContent className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Zap className="h-6 w-6 text-yellow-300" />
          </div>
          
          <div>
            <h3 className="font-bold">Want AI tips + rainfall alerts?</h3>
            <p className="mt-1 text-sm text-purple-100">
              Unlock Pro for instant alerts, market predictions, and seasonal advice.
            </p>
            
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              <Button 
                size="sm" 
                className="bg-white text-purple-700 hover:bg-purple-100 hover:text-purple-800" 
                onClick={handleUpgrade}
              >
                <Zap className="mr-1 h-3 w-3" />
                Unlock Pro
              </Button>
              
              <span className="text-xs text-purple-200">🔥 Using AI to boost yields</span>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1 text-xs">
                <Bell className="h-3 w-3 text-yellow-300" />
                <span>Weather alerts</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <BarChart className="h-3 w-3 text-yellow-300" />
                <span>Price predictions</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProCTA;
