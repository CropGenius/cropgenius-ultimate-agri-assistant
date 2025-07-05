import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Leaf, 
  Cloud, 
  ShoppingCart, 
  MessageCircle,
  Settings,
  User,
  Plus,
  ChevronUp
} from 'lucide-react';

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
  const [dragY, setDragY] = useState(0);

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home', 
      path: '/',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'scan', 
      icon: Leaf, 
      label: 'Scan', 
      path: '/scan',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'weather', 
      icon: Cloud, 
      label: 'Weather', 
      path: '/weather',
      color: 'from-sky-500 to-sky-600'
    },
    { 
      id: 'market', 
      icon: ShoppingCart, 
      label: 'Market', 
      path: '/market',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'chat', 
      icon: MessageCircle, 
      label: 'Chat', 
      path: '/chat',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.(path);
    setIsExpanded(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsExpanded(true);
    } else if (info.offset.y > 50) {
      setIsExpanded(false);
    }
    setDragY(0);
  };

  const isActive = (path: string) => currentRoute === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Navigation Container */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          y: isExpanded ? -200 : 0,
          scale: isExpanded ? 1.02 : 1
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative"
      >
        {/* Expanded Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/30"
            >
              <div className="grid grid-cols-3 gap-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                        active 
                          ? 'bg-green-50 border-2 border-green-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} mb-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {showLabels && (
                        <span className={`text-sm font-medium ${
                          active ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {item.label}
                        </span>
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1 h-1 bg-green-500 rounded-full mt-1"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-2">
          {/* Drag Handle */}
          <div className="flex justify-center mb-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="w-8 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Navigation Items */}
          <div className="flex justify-around items-center">
            {navItems.slice(0, compactMode ? 3 : 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    active 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <div className="relative">
                    <Icon size={24} />
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
                      />
                    )}
                  </div>
                  {showLabels && !compactMode && (
                    <span className="text-xs font-medium mt-1">
                      {item.label}
                    </span>
                  )}
                </motion.button>
              );
            })}

            {/* Expand Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex flex-col items-center p-3 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={24} />
              </motion.div>
              {showLabels && !compactMode && (
                <span className="text-xs font-medium mt-1">More</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleNavigation('/scan')}
        className="absolute bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center"
        style={{
          boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
        }}
      >
        <Plus className="h-6 w-6 text-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-20" />
      </motion.button>
    </div>
  );
};

export default OneFingerNavigation;