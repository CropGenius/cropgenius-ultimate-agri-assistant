
import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, MessageCircle as WhatsAppIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AIInsightAlertProps {
  className?: string;
  onAction?: () => void;
  insight?: {
    message: string;
    type: 'warning' | 'info' | 'success';
    priority: 'high' | 'medium' | 'low';
    action?: string;
  };
}

export default function AIInsightAlert({ 
  className, 
  onAction,
  insight 
}: AIInsightAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneOptIn, setPhoneOptIn] = useState(false);
  const { user } = useAuth();
  
  // If no insight is provided, generate a default one based on time of day
  const defaultInsight = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 10) {
      return {
        message: "Good morning! Today is a good day to check your fields for moisture levels after the night.",
        type: 'info' as const,
        priority: 'medium' as const,
        action: "View moisture map"
      };
    } else if (hour < 16) {
      return {
        message: "Based on current weather patterns, your maize fields would benefit from irrigation in the next 48 hours.",
        type: 'warning' as const,
        priority: 'high' as const,
        action: "See irrigation plan"
      };
    } else {
      return {
        message: "Weather forecast shows rain tomorrow. Consider delaying any planned fertilizer application.",
        type: 'warning' as const,
        priority: 'medium' as const,
        action: "Adjust farm plan"
      };
    }
  }, []);
  
  const currentInsight = insight || defaultInsight;
  
  useEffect(() => {
    // Check if user has opted in for WhatsApp notifications
    const checkOptIn = async () => {
      if (!user) return;
      
      try {
        // We would fetch this from Supabase in a real implementation
        const hasOptedIn = localStorage.getItem(`whatsapp-optin-${user.id}`) === 'true';
        setPhoneOptIn(hasOptedIn);
      } catch (e) {
        console.error("Error checking WhatsApp opt-in status:", e);
      }
    };
    
    checkOptIn();
  }, [user]);
  
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      toast.info("Taking action based on AI insight", {
        description: `Processing your request for: ${currentInsight.action || 'this insight'}`
      });
    }
    setIsExpanded(false);
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
    toast.info("Insight dismissed", {
      description: "You can view all insights in your farm history"
    });
  };
  
  const handleOptIn = () => {
    if (!user) return;
    
    // In a real implementation, we would save this to Supabase
    localStorage.setItem(`whatsapp-optin-${user.id}`, 'true');
    setPhoneOptIn(true);
    
    toast.success("WhatsApp alerts enabled", {
      description: "You'll now receive important farm insights via WhatsApp"
    });
  };
  
  if (!isVisible) return null;

  return (
    <Card className={cn(
      "border-l-4 shadow-md overflow-hidden transition-all", 
      currentInsight.type === 'warning' ? "border-l-amber-500" : 
      currentInsight.type === 'success' ? "border-l-green-500" : 
      "border-l-blue-500",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            {currentInsight.type === 'warning' ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : currentInsight.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">AI Farm Insight</div>
              <Badge variant={
                currentInsight.priority === 'high' ? "destructive" : 
                currentInsight.priority === 'medium' ? "default" : 
                "outline"
              }>
                {currentInsight.priority === 'high' ? 'Urgent' : 
                 currentInsight.priority === 'medium' ? 'Important' : 
                 'FYI'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {currentInsight.message}
            </p>
            
            {isExpanded && (
              <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                <p>GeniusGrow AI analyzes your field data, local weather patterns, and crop conditions to provide personalized insights.</p>
                {!phoneOptIn && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-8 gap-1.5" 
                    onClick={handleOptIn}
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    Get alerts on WhatsApp
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <Button 
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Learn more"}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
          
          {currentInsight.action && (
            <Button 
              variant="default"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={handleAction}
            >
              {currentInsight.action}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
