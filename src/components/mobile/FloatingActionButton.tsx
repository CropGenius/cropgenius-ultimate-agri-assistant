/**
 * 🎯 FLOATING ACTION BUTTON - Trillion-Dollar Glassmorphism
 * iPhone 20 Pro level FAB with green glow magic
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FABProps {
  onScanCrop: () => void;
  onWeatherCheck: () => void;
  onMarketCheck: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onScanCrop,
  onWeatherCheck,
  onMarketCheck
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const actions = [
    { icon: '📸', label: 'Scan Crop', action: onScanCrop, color: 'from-green-400 to-green-600' },
    { icon: '🌦️', label: 'Weather', action: onWeatherCheck, color: 'from-blue-400 to-blue-600' },
    { icon: '💰', label: 'Market', action: onMarketCheck, color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className=\"fixed bottom-6 right-6 z-50\">
      <AnimatePresence>\n        {isExpanded && (\n          <motion.div\n            className=\"absolute bottom-16 right-0 space-y-3\"\n            initial={{ opacity: 0, scale: 0.8 }}\n            animate={{ opacity: 1, scale: 1 }}\n            exit={{ opacity: 0, scale: 0.8 }}\n            transition={{ duration: 0.2 }}\n          >\n            {actions.map((action, index) => (\n              <motion.button\n                key={action.label}\n                onClick={() => {\n                  action.action();\n                  setIsExpanded(false);\n                }}\n                className={`flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-glow-green hover:shadow-glow-green-lg transition-all duration-300`}\n                initial={{ opacity: 0, x: 20 }}\n                animate={{ opacity: 1, x: 0 }}\n                transition={{ delay: index * 0.1 }}\n                whileHover={{ scale: 1.05, x: -5 }}\n                whileTap={{ scale: 0.95 }}\n              >\n                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mr-3 shadow-[0_4px_15px_rgba(16,185,129,0.3)]`}>\n                  <span className=\"text-lg drop-shadow-lg\">{action.icon}</span>\n                </div>\n                <span className=\"text-sm font-medium text-gray-800 pr-2\">{action.label}</span>\n              </motion.button>\n            ))}\n          </motion.div>\n        )}\n      </AnimatePresence>\n\n      {/* Main FAB */}\n      <motion.button\n        onClick={toggleExpanded}\n        className=\"w-16 h-16 bg-gradient-to-r from-green-primary to-emerald-500 rounded-2xl shadow-glow-green-xl flex items-center justify-center backdrop-blur-xl border border-white/20\"\n        whileHover={{ scale: 1.1, rotate: 5 }}\n        whileTap={{ scale: 0.9 }}\n        animate={{ \n          rotate: isExpanded ? 45 : 0,\n          boxShadow: isExpanded \n            ? '0 20px 60px rgba(16, 185, 129, 0.8)' \n            : '0 16px 50px rgba(16, 185, 129, 0.6)'\n        }}\n        transition={{ duration: 0.3 }}\n      >\n        <span className=\"text-2xl text-white drop-shadow-lg\">\n          {isExpanded ? '✕' : '🚀'}\n        </span>\n      </motion.button>\n    </div>\n  );\n};