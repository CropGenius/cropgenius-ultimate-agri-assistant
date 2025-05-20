import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, 
  Home, 
  Scan, 
  CalendarDays, 
  TrendingUp,
  ShoppingCart,
  Cloud,
  MessageSquare,
  Layers,
  Tractor,
  Bell,
  Users,
  Award,
  Settings,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", icon: <Home className="w-5 h-5" />, path: "/" },
    { name: "Crop Scanner", icon: <Scan className="w-5 h-5" />, path: "/scan" },
    { name: "Farm Plan", icon: <CalendarDays className="w-5 h-5" />, path: "/farm-plan" },
    { name: "Yield Predictions", icon: <TrendingUp className="w-5 h-5" />, path: "/predictions" },
    { 
      name: "Manage Fields", 
      icon: <Layers className="w-5 h-5" />, 
      path: "/manage-fields",
      highlight: true
    },
    { name: "Market Prices", icon: <ShoppingCart className="w-5 h-5" />, path: "/market" },
    { name: "Weather Intelligence", icon: <Cloud className="w-5 h-5" />, path: "/weather" },
    { name: "AI Assistant", icon: <MessageSquare className="w-5 h-5" />, path: "/chat" },
    { name: "Farm Clans", icon: <Users className="w-5 h-5" />, path: "/farm-clans" },
    { name: "Challenges", icon: <Award className="w-5 h-5" />, path: "/challenges" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Tractor className="h-5 w-5 text-primary" />
            <span>CROPGenius</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-70px)]">
          <div className="p-2">
            {menuItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start mb-1 ${
                  item.highlight 
                    ? "bg-primary/10 font-medium text-primary hover:bg-primary/20 hover:text-primary" 
                    : ""
                }`}
                onClick={() => handleNavigate(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto bg-primary text-white text-xs py-0.5 px-1.5 rounded-full">
                    New
                  </span>
                )}
              </Button>
            ))}
            
            <div className="border-t my-2 pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start mb-1"
                onClick={() => handleNavigate("/settings")}
              >
                <Settings className="w-5 h-5" />
                <span className="ml-2">Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
