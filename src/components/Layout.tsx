import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Leaf, Cloud, ShoppingCart, MessageCircle, HelpCircle, Bot, User, Menu, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import LayoutMenu from "@/components/LayoutMenu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

// NavButton component for the bottom navigation
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, active, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center ${active ? 'text-green-600' : 'text-gray-500'}`}
  >
    <div className={`${active ? 'text-green-600' : 'text-gray-400'}`}>
      {icon}
    </div>
    <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>{label}</span>
  </button>
);

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, farmId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleOpenMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleOpenMenu} className="mr-1">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <img src="/icons/logo.svg" alt="CropGenius Logo" className="h-7 w-7" />
              <span className="font-bold text-lg ml-1">CROPGenius</span>
            </div>
          </div>
          <div>
            <Button variant="green-outline" size="sm" className="rounded-full px-4">
              <span>Manage Fields</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Add LayoutMenu at the top of the layout */}
      <LayoutMenu />
      
      {/* Bottom Navigation Bar - Optimized for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4 shadow-sm">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavButton icon={<Home size={22} />} label="Home" active={true} onClick={() => navigate('/')} />
          <NavButton icon={<Leaf size={22} />} label="Scan" active={false} onClick={() => navigate('/scan')} />
          <NavButton icon={<Cloud size={22} />} label="Weather" active={false} onClick={() => navigate('/weather')} />
          <NavButton icon={<ShoppingCart size={22} />} label="Market" active={false} onClick={() => navigate('/market')} />
          <NavButton icon={<MessageCircle size={22} />} label="Chat" active={false} onClick={() => navigate('/chat')} />
        </div>
      </div>
      
      {/* Main Content Area with proper padding for mobile */}
      <main className="pb-20 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
