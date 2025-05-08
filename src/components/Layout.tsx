
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Leaf, Cloud, ShoppingCart, MessageCircle, HelpCircle, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LayoutMenu from "@/components/LayoutMenu";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, farmId } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Add LayoutMenu at the top of the layout */}
      <LayoutMenu />
      
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
          to={user ? "/scan" : "/auth"} 
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
          to={user ? "/market" : "/auth"} 
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
          to={user ? "/chat" : "/auth"} 
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
