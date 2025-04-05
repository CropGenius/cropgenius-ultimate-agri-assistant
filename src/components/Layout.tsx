
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Leaf, Cloud, ShoppingCart, MessageCircle, HelpCircle, Bot, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isAuthenticated } from "@/utils/authService";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setUserAuthenticated(authenticated);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUserAuthenticated(!!session);
          
          // On sign out, redirect to home
          if (event === 'SIGNED_OUT') {
            navigate('/', { replace: true });
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, [navigate]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleAIAction = () => {
    // Simulate AI generating a personalized insight
    if (!userAuthenticated) {
      toast.info("Sign in to use AI features", {
        description: "Create an account to access AI farming insights",
        action: {
          label: "Sign In",
          onClick: () => navigate('/auth')
        }
      });
      return;
    }
    
    toast.success("AI Farm Insight", {
      description: "AI has detected an optimal time to plant maize in your region.",
      action: {
        label: "View Details",
        onClick: () => console.log("Viewing AI insight details")
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
        <Button 
          size="icon" 
          className="w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
          onClick={handleAIAction}
        >
          <Zap className="h-5 w-5" />
        </Button>
        
        <Link 
          to={userAuthenticated ? "/chat" : "/auth"} 
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-white shadow-lg hover:bg-primary/80 transition-colors"
        >
          <Bot className="h-5 w-5" />
        </Link>
      </div>
      
      {/* Bottom Navigation Bar - Optimized for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 py-2 px-2 flex justify-around items-center z-40 shadow-lg">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center px-1 py-1 rounded-md transition-colors",
            isActive('/') ? 
              'text-primary bg-primary/10' : 
              'text-muted-foreground hover:text-primary hover:bg-primary/5'
          )}
        >
          <Home size={isMobile ? 20 : 24} />
          <span className="text-xs font-medium mt-1">Home</span>
        </Link>
        
        <Link 
          to={userAuthenticated ? "/scan" : "/auth"} 
          className={cn(
            "flex flex-col items-center px-1 py-1 rounded-md transition-colors",
            isActive('/scan') ? 
              'text-primary bg-primary/10' : 
              'text-muted-foreground hover:text-primary hover:bg-primary/5'
          )}
        >
          <Leaf size={isMobile ? 20 : 24} />
          <span className="text-xs font-medium mt-1">Scan</span>
        </Link>
        
        <Link 
          to="/weather" 
          className={cn(
            "flex flex-col items-center px-1 py-1 rounded-md transition-colors",
            isActive('/weather') ? 
              'text-primary bg-primary/10' : 
              'text-muted-foreground hover:text-primary hover:bg-primary/5'
          )}
        >
          <Cloud size={isMobile ? 20 : 24} />
          <span className="text-xs font-medium mt-1">Weather</span>
        </Link>
        
        <Link 
          to={userAuthenticated ? "/market" : "/auth"} 
          className={cn(
            "flex flex-col items-center px-1 py-1 rounded-md transition-colors",
            isActive('/market') ? 
              'text-primary bg-primary/10' : 
              'text-muted-foreground hover:text-primary hover:bg-primary/5'
          )}
        >
          <ShoppingCart size={isMobile ? 20 : 24} />
          <span className="text-xs font-medium mt-1">Market</span>
        </Link>
        
        <Link 
          to={userAuthenticated ? "/chat" : "/auth"} 
          className={cn(
            "flex flex-col items-center px-1 py-1 rounded-md transition-colors",
            isActive('/chat') ? 
              'text-primary bg-primary/10' : 
              'text-muted-foreground hover:text-primary hover:bg-primary/5'
          )}
        >
          <MessageCircle size={isMobile ? 20 : 24} />
          <span className="text-xs font-medium mt-1">Chat</span>
        </Link>
      </nav>
      
      {/* Main Content Area with proper padding for mobile */}
      <main className="pb-20 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
