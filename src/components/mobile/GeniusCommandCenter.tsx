/**
 * 🌟 CROPGENIUS 2.0 - THE GENIUS COMMAND CENTER
 * "10 Trillion Dollar" Clean, Intelligent Glass-Morphed Masterpiece
 * Principle: "Intelligent Simplicity" - 0 Complexity, Full Power
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  MapPin, 
  Cloud, 
  Sun, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Plus,
  Mic,
  Satellite,
  Target,
  Activity
} from 'lucide-react';

// Farm Profit & Sustainability Index Orb Component
const FPSIOrb: React.FC<{ score: number; trend: 'growing' | 'stable' | 'declining' }> = ({ score, trend }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTrendColor = () => {
    switch (trend) {
      case 'growing': return 'from-emerald-400 to-green-500';
      case 'stable': return 'from-blue-400 to-cyan-500';
      case 'declining': return 'from-amber-400 to-orange-500';
      default: return 'from-emerald-400 to-green-500';
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <>
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(true)}
      >
        {/* Glass morphism container */}
        <div className="relative w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
          {/* Animated gradient background */}
          <div className={`absolute inset-2 bg-gradient-to-br ${getTrendColor()} rounded-full opacity-20 animate-pulse`} />
          
          {/* Progress circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#fpsiGradient)"
              strokeWidth="3"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="fpsiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-2xl font-bold text-gray-800"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {score}%
            </motion.div>
            <div className="text-xs text-gray-600 font-medium">FPSI</div>
            <div className="text-xs text-emerald-600 capitalize">{trend}</div>
          </div>
          
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getTrendColor()} rounded-full opacity-20 blur-xl`} />
        </div>
      </motion.div>

      {/* Expanded FPSI Details Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Farm Intelligence</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Yield Optimization</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost Efficiency</span>
                  <span className="font-semibold text-blue-600">88%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Management</span>
                  <span className="font-semibold text-emerald-600">91%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Market Timing</span>
                  <span className="font-semibold text-purple-600">79%</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-sm text-gray-700">
                  <strong>AI Insight:</strong> Optimal conditions detected for 15% yield increase with strategic input timing.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Genius Action Card Component
const GeniusActionCard: React.FC = () => {
  const [currentAction] = useState({
    title: "Optimal Maize Planting Window Detected",
    description: "Plant in Field 2 within next 72 hours for optimal soil moisture and temperature conditions.",
    impact: "+3% FPSI increase",
    urgency: "high",
    type: "planting"
  });

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(31,38,135,0.37)]"
      whileHover={{ y: -2, shadow: "0_12px_40px_rgba(31,38,135,0.5)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-gray-800">Today's Genius Action</h3>
            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-700 text-xs font-medium rounded-full">
              High Priority
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-2">{currentAction.title}</p>
          <p className="text-sm text-gray-600 mb-3">{currentAction.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-emerald-600">
              Expected Impact: {currentAction.impact}
            </div>
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Plan
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Field Card Component
const FieldCard: React.FC<{ field: { name: string; crop: string; health: number; id: string } }> = ({ field }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(31,38,135,0.37)] cursor-pointer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Satellite imagery thumbnail simulation */}
      <div className="relative h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl mb-3 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-2 right-2">
          <Satellite className="w-4 h-4 text-white/80" />
        </div>
        <div className="absolute bottom-2 left-2">
          <div className="text-xs text-white/90 font-medium">Live View</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">{field.name}</h4>
          <div className="text-xs text-gray-600">{field.crop}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full"
              style={{ width: `${field.health}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700">{field.health}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Priority Alert Component
const PriorityAlert: React.FC = () => {
  return (
    <motion.div
      className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(31,38,135,0.37)]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Weather Alert</p>
          <p className="text-xs text-gray-600">Heavy rainfall expected in 48hrs. Prepare drainage systems.</p>
        </div>
        <motion.button
          className="text-amber-600 hover:text-amber-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Activity className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main Genius Command Center Component
export const GeniusCommandCenter: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const mockFields = [
    { id: '1', name: 'North Field', crop: 'Maize', health: 92 },
    { id: '2', name: 'South Field', crop: 'Beans', health: 87 },
    { id: '3', name: 'East Field', crop: 'Wheat', health: 94 }
  ];

  return (
    <div className="w-full bg-transparent relative">
      <div className="relative z-10 pb-4">
        {/* Removed duplicate top navigation - MobileLayout handles this */}

        {/* Dynamic Header */}
        <div className="px-4 py-6 space-y-6">
          {/* Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {greeting}, Farmer! 👋
            </h1>
            
            {/* Location & Weather */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Kakamega, Kenya</span>
              <span>•</span>
              <Cloud className="w-4 h-4" />
              <span>26°C Light Rain</span>
            </div>
          </motion.div>

          {/* Farm Profit & Sustainability Index (FPSI) */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FPSIOrb score={85} trend="growing" />
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">All fields synced</p>
            </div>
          </motion.div>

          {/* Today's Genius Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GeniusActionCard />
          </motion.div>

          {/* Ask CropGenius */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              className="flex items-center space-x-3 px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_32px_rgba(31,38,135,0.37)]"
              whileHover={{ scale: 1.05, shadow: "0_12px_40px_rgba(31,38,135,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-800">Ask CropGenius</span>
            </motion.button>
          </motion.div>

          {/* My Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">My Fields</h2>
              <motion.button
                className="p-2 bg-emerald-500/20 rounded-full text-emerald-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {mockFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                >
                  <FieldCard field={field} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Priority Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">Priority Alerts</h2>
            <PriorityAlert />
          </motion.div>
        </div>
      </div>
    </div>
  );
};