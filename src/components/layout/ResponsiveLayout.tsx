import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart2, 
  Calendar, 
  Settings, 
  MessageCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveLayoutProps {
  children: ReactNode;
  isMobile: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Navigation items for mobile bottom tab bar
  const navItems = [
    { 
      path: '/home', 
      icon: <Home className="h-5 w-5" />, 
      label: 'Home',
      mobileOnly: true
    },
    { 
      path: '/dashboard', 
      icon: <BarChart2 className="h-5 w-5" />, 
      label: 'Dashboard',
      mobileOnly: false
    },
    { 
      path: '/farm-plan', 
      icon: <Calendar className="h-5 w-5" />, 
      label: 'Plan',
      mobileOnly: false
    },
    { 
      path: '/market', 
      icon: <BarChart2 className="h-5 w-5" />, 
      label: 'Market',
      mobileOnly: false
    },
  ];

  // Auto-hide mobile nav when route changes
  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  // Simulate new message for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewMessage(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Mobile layout with bottom navigation
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Main content area */}
        <main className="flex-1 pb-16 overflow-y-auto">
          {children}
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-4 z-40">
          <Button 
            onClick={() => navigate('/scan')}
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all"
            aria-label="New Scan"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-30">
          {navItems
            .filter(item => item.mobileOnly || !isMobile) // Show mobile-only items on mobile
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    isActive ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  <div className="relative">
                    {item.path === '/home' && hasNewMessage && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
        </nav>
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-600">CropGenius</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-green-500" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default ResponsiveLayout;
