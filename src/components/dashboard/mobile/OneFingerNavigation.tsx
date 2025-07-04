import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Camera, 
  BarChart3, 
  CloudRain, 
  MessageCircle,
  Plus,
  X,
  Zap,
  Target,
  Award,
  Settings,
  User,
  Bell,
  Search,
  Map,
  Calendar,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  badge?: number;
  description?: string;
}

interface OneFingerNavigationProps {
  currentRoute: string;
  onNavigate?: (route: string) => void;
  showLabels?: boolean;
  compactMode?: boolean;
}

export const OneFingerNavigation: React.FC<OneFingerNavigationProps> = ({
  currentRoute,
  onNavigate,
  showLabels = true,
  compactMode = false
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const primaryNavItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      route: '/home',
      color: 'from-emerald-500 to-green-600',
      priority: 'primary'
    },
    {
      id: 'scan',
      label: 'AI Scan',
      icon: <Camera className="h-5 w-5" />,
      route: '/scan',
      color: 'from-blue-500 to-cyan-600',
      priority: 'primary',
      description: 'Instant crop analysis'
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: <CloudRain className="h-5 w-5" />,
      route: '/weather',
      color: 'from-orange-500 to-yellow-500',
      priority: 'primary'
    },
    {
      id: 'market',
      label: 'Market',
      icon: <BarChart3 className="h-5 w-5" />,
      route: '/market',
      color: 'from-purple-500 to-pink-500',
      priority: 'primary',
      badge: 3
    }
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'fields',
      label: 'Fields',
      icon: <Map className="h-4 w-4" />,
      route: '/fields',
      color: 'from-green-500 to-emerald-500',
      priority: 'secondary'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <Target className="h-4 w-4" />,
      route: '/tasks',
      color: 'from-red-500 to-orange-500',
      priority: 'secondary',
      badge: 2
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <TrendingUp className="h-4 w-4" />,
      route: '/insights',
      color: 'from-indigo-500 to-purple-500',
      priority: 'secondary'
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Award className="h-4 w-4" />,
      route: '/community',
      color: 'from-pink-500 to-rose-500',
      priority: 'secondary'
    }
  ];

  const tertiaryNavItems: NavItem[] = [
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <Bell className="h-4 w-4" />,
      route: '/notifications',
      color: 'from-gray-500 to-gray-600',
      priority: 'tertiary',
      badge: 5
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      route: '/profile',
      color: 'from-gray-500 to-gray-600',
      priority: 'tertiary'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      route: '/settings',
      color: 'from-gray-500 to-gray-600',
      priority: 'tertiary'
    }
  ];

  const handleNavigation = (item: NavItem) => {
    navigate(item.route);
    onNavigate?.(item.route);
    setIsExpanded(false);
    setActiveItem(item.id);
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handlePan = (event: any, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsExpanded(true);
    } else if (info.offset.y > 50) {
      setIsExpanded(false);
    }
    setDragOffset(0);
  };

  const isActive = (route: string) => currentRoute === route;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        animate={{ y: dragOffset }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white/95 backdrop-blur-xl rounded-t-3xl border-t border-white/30 shadow-2xl mb-20"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(false)}
                    className="p-2 bg-gray-100 rounded-xl"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {secondaryNavItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(item)}
                      className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg ${
                        isActive(item.route) ? 'ring-2 ring-white ring-offset-2' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {item.icon}
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                        >
                          {item.badge}
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">More Options</h4>
                  {tertiaryNavItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isActive(item.route) 
                          ? 'bg-emerald-50 border border-emerald-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      {item.badge && (
                        <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.badge}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className="bg-white/95 backdrop-blur-xl border-t border-white/30 shadow-2xl"
        >
          <div className="flex justify-center pt-2">
            <motion.div 
              className="w-8 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
              whileHover={{ scale: 1.1 }}
            />
          </div>

          <div className="flex items-center justify-around px-4 py-3">
            {primaryNavItems.map((item, index) => {
              const active = isActive(item.route);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavigation(item)}
                  className="relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all"
                  animate={{
                    scale: active ? 1.1 : 1,
                  }}
                >
                  <div className={`relative p-3 rounded-2xl transition-all ${
                    active 
                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    {item.icon}
                    
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {item.badge}
                      </motion.div>
                    )}
                    
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-2xl border-2 border-white/50"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>

                  {showLabels && !compactMode && (
                    <motion.span 
                      className={`text-xs font-medium transition-colors ${
                        active ? 'text-gray-900' : 'text-gray-600'
                      }`}
                      animate={{ opacity: active ? 1 : 0.7 }}
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {item.description && active && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                    >
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`relative p-3 rounded-2xl transition-all ${
                isExpanded
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-5 w-5" />
              </motion.div>
              
              {tertiaryNavItems.some(item => item.badge) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default OneFingerNavigation;