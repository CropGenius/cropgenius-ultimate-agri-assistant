import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Leaf, Cloud, ShoppingCart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      requiresAuth: false,
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: Leaf,
      path: '/scan',
      requiresAuth: true,
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: Cloud,
      path: '/weather',
      requiresAuth: false,
    },
    {
      id: 'market',
      label: 'Market',
      icon: ShoppingCart,
      path: '/market',
      requiresAuth: true,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      path: '/chat',
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.requiresAuth && !user) {
      navigate('/auth');
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1",
                active
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-green-600 hover:bg-green-50"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Icon size={20} />
                {item.requiresAuth && !user && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                )}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
                  />
                )}
              </div>
              <span className="text-xs font-medium mt-1 truncate">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;