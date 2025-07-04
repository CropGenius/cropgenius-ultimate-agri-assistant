import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Sparkles,
  Heart,
  Award,
  Target
} from 'lucide-react';

interface HealthOrbProps {
  score: number;
  size?: number;
  className?: string;
  trend?: 'improving' | 'stable' | 'declining';
  showTrustIndicators?: boolean;
  lastUpdated?: string;
  accuracy?: number;
}

export const HealthOrb: React.FC<HealthOrbProps> = ({ 
  score, 
  size = 120,
  className = '',
  trend = 'stable',
  showTrustIndicators = true,
  lastUpdated = '2 hours ago',
  accuracy = 99.7
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = score / 30;
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return Math.min(prev + increment, score);
        });
      }, 50);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  useEffect(() => {
    if (score >= 85 && trend === 'improving') {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [score, trend]);

  const getHealthData = (score: number) => {
    if (score >= 85) return {
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      pulseColor: 'bg-emerald-500/20',
      glowColor: 'shadow-emerald-500/30',
      ringColor: 'border-emerald-400/50',
      status: 'Excellent',
      emoji: '🌟',
      message: 'Outstanding farm health!',
      icon: Award
    };
    if (score >= 70) return {
      gradient: 'from-green-400 via-emerald-500 to-green-600',
      pulseColor: 'bg-green-500/20',
      glowColor: 'shadow-green-500/25',
      ringColor: 'border-green-400/50',
      status: 'Good',
      emoji: '✅',
      message: 'Healthy and growing',
      icon: CheckCircle2
    };
    if (score >= 50) return {
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      pulseColor: 'bg-yellow-500/20',
      glowColor: 'shadow-yellow-500/25',
      ringColor: 'border-yellow-400/50',
      status: 'Fair',
      emoji: '⚠️',
      message: 'Needs attention',
      icon: AlertTriangle
    };
    return {
      gradient: 'from-red-400 via-pink-500 to-rose-600',
      pulseColor: 'bg-red-500/20',
      glowColor: 'shadow-red-500/25',
      ringColor: 'border-red-400/50',
      status: 'Critical',
      emoji: '🚨',
      message: 'Immediate action needed',
      icon: AlertTriangle
    };
  };

  const healthData = getHealthData(score);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <AnimatePresence>
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{ left: '50%', top: '50%' }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, 360]
                }}
                transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${healthData.ringColor}`}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className={`absolute inset-0 rounded-full ${healthData.pulseColor} blur-xl`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${healthData.gradient} shadow-2xl ${healthData.glowColor} flex items-center justify-center cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="text-white text-center relative z-10">
          <motion.div 
            className="text-4xl font-black mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {Math.round(animatedScore)}%
          </motion.div>
          
          <motion.div 
            className="text-xs font-semibold opacity-90 flex items-center justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>{healthData.emoji}</span>
            <span>{healthData.status}</span>
          </motion.div>
        </div>

        <motion.div
          className="absolute -top-2 -right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          {trend === 'improving' && <TrendingUp className="h-4 w-4 text-white" />}
          {trend === 'stable' && <Shield className="h-4 w-4 text-white" />}
          {trend === 'declining' && <AlertTriangle className="h-4 w-4 text-white" />}
        </motion.div>

        {score >= 80 && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{ top: '50%', left: '50%' }}
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * (size * 0.6)],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * (size * 0.6)],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isHovered && showTrustIndicators && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs whitespace-nowrap z-20"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                <span>{accuracy}% accurate</span>
              </div>
              <div className="w-px h-3 bg-white/30" />
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span>AI-verified</span>
              </div>
              <div className="w-px h-3 bg-white/30" />
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Updated {lastUpdated}</span>
              </div>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-xs text-gray-600 font-medium">{healthData.message}</p>
      </motion.div>
    </div>
  );
};

export default HealthOrb;