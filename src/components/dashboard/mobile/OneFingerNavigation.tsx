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
    
    // Haptic feedback simulation
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
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className=\"fixed inset-0 bg-black/20 backdrop-blur-sm z-40\"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>\n\n      {/* Main Navigation Container */}\n      <motion.div\n        className=\"fixed bottom-0 left-0 right-0 z-50\"\n        animate={{ y: dragOffset }}\n      >\n        {/* Expanded Menu */}\n        <AnimatePresence>\n          {isExpanded && (\n            <motion.div\n              initial={{ opacity: 0, y: 100 }}\n              animate={{ opacity: 1, y: 0 }}\n              exit={{ opacity: 0, y: 100 }}\n              transition={{ type: \"spring\", damping: 25 }}\n              className=\"bg-white/95 backdrop-blur-xl rounded-t-3xl border-t border-white/30 shadow-2xl mb-20\"\n            >\n              {/* Drag Handle */}\n              <div className=\"flex justify-center pt-3 pb-2\">\n                <div className=\"w-12 h-1 bg-gray-300 rounded-full\" />\n              </div>\n\n              <div className=\"px-6 pb-6\">\n                {/* Quick Actions Header */}\n                <div className=\"flex items-center justify-between mb-6\">\n                  <h3 className=\"text-lg font-bold text-gray-900\">Quick Actions</h3>\n                  <motion.button\n                    whileTap={{ scale: 0.95 }}\n                    onClick={() => setIsExpanded(false)}\n                    className=\"p-2 bg-gray-100 rounded-xl\"\n                  >\n                    <X className=\"h-4 w-4 text-gray-600\" />\n                  </motion.button>\n                </div>\n\n                {/* Secondary Actions Grid */}\n                <div className=\"grid grid-cols-4 gap-4 mb-6\">\n                  {secondaryNavItems.map((item, index) => (\n                    <motion.button\n                      key={item.id}\n                      initial={{ opacity: 0, scale: 0.8 }}\n                      animate={{ opacity: 1, scale: 1 }}\n                      transition={{ delay: index * 0.1 }}\n                      whileHover={{ scale: 1.05 }}\n                      whileTap={{ scale: 0.95 }}\n                      onClick={() => handleNavigation(item)}\n                      className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg ${\n                        isActive(item.route) ? 'ring-2 ring-white ring-offset-2' : ''\n                      }`}\n                    >\n                      <div className=\"flex flex-col items-center space-y-2\">\n                        {item.icon}\n                        <span className=\"text-xs font-medium\">{item.label}</span>\n                      </div>\n                      {item.badge && (\n                        <motion.div\n                          initial={{ scale: 0 }}\n                          animate={{ scale: 1 }}\n                          className=\"absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold\"\n                        >\n                          {item.badge}\n                        </motion.div>\n                      )}\n                    </motion.button>\n                  ))}\n                </div>\n\n                {/* Tertiary Actions */}\n                <div className=\"space-y-2\">\n                  <h4 className=\"text-sm font-semibold text-gray-700 mb-3\">More Options</h4>\n                  {tertiaryNavItems.map((item, index) => (\n                    <motion.button\n                      key={item.id}\n                      initial={{ opacity: 0, x: -20 }}\n                      animate={{ opacity: 1, x: 0 }}\n                      transition={{ delay: 0.4 + index * 0.1 }}\n                      whileTap={{ scale: 0.98 }}\n                      onClick={() => handleNavigation(item)}\n                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${\n                        isActive(item.route) \n                          ? 'bg-emerald-50 border border-emerald-200' \n                          : 'bg-gray-50 hover:bg-gray-100'\n                      }`}\n                    >\n                      <div className=\"flex items-center space-x-3\">\n                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>\n                          {item.icon}\n                        </div>\n                        <span className=\"font-medium text-gray-900\">{item.label}</span>\n                      </div>\n                      {item.badge && (\n                        <div className=\"w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold\">\n                          {item.badge}\n                        </div>\n                      )}\n                    </motion.button>\n                  ))}\n                </div>\n              </div>\n            </motion.div>\n          )}\n        </AnimatePresence>\n\n        {/* Bottom Navigation Bar */}\n        <motion.div\n          drag=\"y\"\n          dragConstraints={{ top: 0, bottom: 0 }}\n          onPan={handlePan}\n          onPanEnd={handlePanEnd}\n          className=\"bg-white/95 backdrop-blur-xl border-t border-white/30 shadow-2xl\"\n        >\n          {/* Drag Indicator */}\n          <div className=\"flex justify-center pt-2\">\n            <motion.div \n              className=\"w-8 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing\"\n              whileHover={{ scale: 1.1 }}\n            />\n          </div>\n\n          <div className=\"flex items-center justify-around px-4 py-3\">\n            {primaryNavItems.map((item, index) => {\n              const active = isActive(item.route);\n              return (\n                <motion.button\n                  key={item.id}\n                  whileHover={{ scale: 1.1 }}\n                  whileTap={{ scale: 0.9 }}\n                  onClick={() => handleNavigation(item)}\n                  className=\"relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all\"\n                  animate={{\n                    scale: active ? 1.1 : 1,\n                  }}\n                >\n                  {/* Icon Container */}\n                  <div className={`relative p-3 rounded-2xl transition-all ${\n                    active \n                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg` \n                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'\n                  }`}>\n                    {item.icon}\n                    \n                    {/* Badge */}\n                    {item.badge && (\n                      <motion.div\n                        initial={{ scale: 0 }}\n                        animate={{ scale: 1 }}\n                        className=\"absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold\"\n                      >\n                        {item.badge}\n                      </motion.div>\n                    )}\n                    \n                    {/* Active Indicator */}\n                    {active && (\n                      <motion.div\n                        layoutId=\"activeIndicator\"\n                        className=\"absolute inset-0 rounded-2xl border-2 border-white/50\"\n                        transition={{ type: \"spring\", stiffness: 300, damping: 30 }}\n                      />\n                    )}\n                  </div>\n\n                  {/* Label */}\n                  {showLabels && !compactMode && (\n                    <motion.span \n                      className={`text-xs font-medium transition-colors ${\n                        active ? 'text-gray-900' : 'text-gray-600'\n                      }`}\n                      animate={{ opacity: active ? 1 : 0.7 }}\n                    >\n                      {item.label}\n                    </motion.span>\n                  )}\n\n                  {/* Description Tooltip */}\n                  {item.description && active && (\n                    <motion.div\n                      initial={{ opacity: 0, y: 10 }}\n                      animate={{ opacity: 1, y: 0 }}\n                      className=\"absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap\"\n                    >\n                      {item.description}\n                      <div className=\"absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80\" />\n                    </motion.div>\n                  )}\n                </motion.button>\n              );\n            })}\n\n            {/* Expand Button */}\n            <motion.button\n              whileHover={{ scale: 1.1 }}\n              whileTap={{ scale: 0.9 }}\n              onClick={() => setIsExpanded(!isExpanded)}\n              className={`relative p-3 rounded-2xl transition-all ${\n                isExpanded\n                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'\n                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'\n              }`}\n            >\n              <motion.div\n                animate={{ rotate: isExpanded ? 45 : 0 }}\n                transition={{ duration: 0.2 }}\n              >\n                <Plus className=\"h-5 w-5\" />\n              </motion.div>\n              \n              {/* Notification Dot */}\n              {tertiaryNavItems.some(item => item.badge) && (\n                <div className=\"absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full\" />\n              )}\n            </motion.button>\n          </div>\n        </motion.div>\n      </motion.div>\n    </>\n  );\n};\n\nexport default OneFingerNavigation;