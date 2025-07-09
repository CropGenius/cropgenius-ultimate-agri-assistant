/**
 * 📱 BOTTOM NAVIGATION - Trillion-Dollar Glassmorphism
 * iPhone 20 Pro level navigation with green glow magic
 */

import React from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const navItems: NavItem[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'scan', icon: '📸', label: 'Scan' },
    { id: 'weather', icon: '🌦️', label: 'Weather' },
    { id: 'market', icon: '💰', label: 'Market', badge: 2 },
    { id: 'growth', icon: '🚀', label: 'Growth', badge: 3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Glassmorphism Background */}
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/10 px-4 py-2 shadow-glow-green">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-green-primary/20 backdrop-blur-sm border border-green-primary/30'
                  : 'hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: activeTab === item.id ? -2 : 0,
              }}
            >
              {/* Badge */}
              {item.badge && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs font-bold text-white">{item.badge}</span>
                </motion.div>
              )}
              
              {/* Icon */}
              <span className={`text-xl mb-1 drop-shadow-lg transition-all duration-300 ${
                activeTab === item.id ? 'scale-110' : ''
              }`}>
                {item.icon}
              </span>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-all duration-300 ${
                activeTab === item.id 
                  ? 'text-green-primary drop-shadow-sm' 
                  : 'text-gray-600'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {activeTab === item.id && (
                <motion.div
                  className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-green-primary to-emerald-500 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.6)]"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Safe Area Bottom Padding */}
      <div className="h-safe-area-inset-bottom bg-white/5 backdrop-blur-xl"></div>
    </div>
  );
};