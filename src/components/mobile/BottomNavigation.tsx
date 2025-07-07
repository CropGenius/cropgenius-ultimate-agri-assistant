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
    { id: 'market', icon: '💰', label: 'Market', badge: 2 },
    { id: 'weather', icon: '🌦️', label: 'Weather' },
    { id: 'community', icon: '👥', label: 'Community', badge: 5 },
  ];

  return (
    <div className=\"fixed bottom-0 left-0 right-0 z-40\">\n      {/* Glassmorphism Background */}\n      <div className=\"bg-white/10 backdrop-blur-xl border-t border-white/10 px-4 py-2 shadow-glow-green\">\n        <div className=\"flex items-center justify-around max-w-md mx-auto\">\n          {navItems.map((item) => (\n            <motion.button\n              key={item.id}\n              onClick={() => onTabChange(item.id)}\n              className={`relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 ${\n                activeTab === item.id\n                  ? 'bg-green-primary/20 backdrop-blur-sm border border-green-primary/30'\n                  : 'hover:bg-white/5'\n              }`}\n              whileHover={{ scale: 1.05, y: -2 }}\n              whileTap={{ scale: 0.95 }}\n              animate={{\n                y: activeTab === item.id ? -2 : 0,\n              }}\n            >\n              {/* Badge */}\n              {item.badge && (\n                <motion.div\n                  className=\"absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(239,68,68,0.4)]\"\n                  initial={{ scale: 0 }}\n                  animate={{ scale: 1 }}\n                  transition={{ delay: 0.2 }}\n                >\n                  <span className=\"text-xs font-bold text-white\">{item.badge}</span>\n                </motion.div>\n              )}\n              \n              {/* Icon */}\n              <span className={`text-xl mb-1 drop-shadow-lg transition-all duration-300 ${\n                activeTab === item.id ? 'scale-110' : ''\n              }`}>\n                {item.icon}\n              </span>\n              \n              {/* Label */}\n              <span className={`text-xs font-medium transition-all duration-300 ${\n                activeTab === item.id \n                  ? 'text-green-primary drop-shadow-sm' \n                  : 'text-gray-600'\n              }`}>\n                {item.label}\n              </span>\n              \n              {/* Active Indicator */}\n              {activeTab === item.id && (\n                <motion.div\n                  className=\"absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-green-primary to-emerald-500 rounded-full shadow-[0_2px_10px_rgba(16,185,129,0.6)]\"\n                  layoutId=\"activeIndicator\"\n                  transition={{ duration: 0.3 }}\n                />\n              )}\n            </motion.button>\n          ))}\n        </div>\n      </div>\n      \n      {/* Safe Area Bottom Padding */}\n      <div className=\"h-safe-area-inset-bottom bg-white/5 backdrop-blur-xl\"></div>\n    </div>\n  );\n};