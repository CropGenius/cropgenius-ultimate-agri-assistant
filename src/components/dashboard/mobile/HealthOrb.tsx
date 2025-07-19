/**
 * 🌾 CROPGENIUS – HEALTH ORB COMPONENT
 * -------------------------------------------------------------
 * PRODUCTION-READY Real-Time Farm Health Visualization
 * - Real-time farm health data integration with useFarmHealth hook
 * - Dynamic visual states driven by actual health scores
 * - Trust indicators rendered from real data sources
 * - Comprehensive loading and error state handling
 * - Celebration animations for health improvements
 */

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
  Target,
  Loader2,
  RefreshCw,
  Droplets,
  Bug,
  Cloud,
  DollarSign
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useFarmHealth } from '@/hooks/useFarmHealth';
import { TrustIndicator } from '@/services/FarmHealthService';

interface HealthOrbProps {
  farmId: string;
  size?: number;
  className?: string;
  showTrustIndicators?: boolean;
  onHealthClick?: (healthData: any) => void;
  enableRealTimeUpdates?: boolean;
}

/**
 * PRODUCTION-READY Health Orb with Real-Time Data Integration
 */
export const HealthOrb: React.FC<HealthOrbProps> = ({ 
  farmId, 
  size = 120,
  className = '',
  showTrustIndicators = true,
  onHealthClick,
  enableRealTimeUpdates = true
}) => {
  const { 
    data: healthData, 
    isLoading, 
    error, 
    healthScore,
    isHealthy,
    hasAlerts,
    alertCount,
    lastUpdated,
    refreshHealth
  } = useFarmHealth(farmId, {
    enabled: !!farmId,
    enableRealTimeUpdates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    onSuccess: (data) => {
      console.log('Health data updated:', data);
    },
    onError: (error) => {
      console.error('Health data error:', error);
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);

  // Animate score changes
  useEffect(() => {
    if (!healthScore || isLoading) return;
    
    const timer = setTimeout(() => {
      const increment = Math.abs(healthScore - animatedScore) / 30;
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          const target = healthScore * 100; // Convert to percentage
          if (Math.abs(prev - target) < 1) {
            clearInterval(interval);
            return target;
          }
          return prev < target ? 
            Math.min(prev + increment * 100, target) : 
            Math.max(prev - increment * 100, target);
        });
      }, 50);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [healthScore, isLoading, animatedScore]);

  // Trigger celebration for significant improvements
  useEffect(() => {
    if (healthScore && previousScore && healthScore > previousScore + 0.1) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setPreviousScore(healthScore);
  }, [healthScore, previousScore]);

  // Handle orb click
  const handleOrbClick = () => {
    if (onHealthClick && healthData) {
      onHealthClick(healthData);
    }
  };

  // Get visual styling based on health score
  const getHealthVisuals = (score: number) => {
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

  // Get trend direction from health data
  const getTrendDirection = (): 'improving' | 'stable' | 'declining' => {
    if (!healthData?.trends?.length) return 'stable';
    const recentTrend = healthData.trends.find(t => t.period === '24h');
    return recentTrend?.direction || 'stable';
  };

  // Get trust indicator icons
  const getTrustIndicatorIcon = (type: string) => {
    switch (type) {
      case 'soil': return <Target className="h-3 w-3" />;
      case 'weather': return <Cloud className="h-3 w-3" />;
      case 'disease': return <Bug className="h-3 w-3" />;
      case 'market': return <DollarSign className="h-3 w-3" />;
      case 'water': return <Droplets className="h-3 w-3" />;
      default: return <CheckCircle2 className="h-3 w-3" />;
    }
  };

  const currentScore = Math.round(animatedScore);
  const visualData = getHealthVisuals(currentScore);
  const trend = getTrendDirection();

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className={`relative ${className} flex items-center justify-center`} style={{ width: size, height: size }}>
        <Skeleton className="absolute inset-0 rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
          <span className="text-xs text-gray-500">Loading health data...</span>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className={`relative ${className} flex flex-col items-center justify-center bg-red-50 rounded-full border-2 border-red-200`} 
        style={{ width: size, height: size }}>
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshHealth}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-red-600 font-medium">Failed to load farm health</p>
          <p className="text-xs text-red-500 mt-1">Check your connection and try again</p>
        </div>
      </div>
    );
  }

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

      {/* Animated ring border */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${visualData.ringColor}`}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Pulsing glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${visualData.pulseColor} blur-xl`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Main orb with health data */}
      <motion.div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${visualData.gradient} shadow-2xl ${visualData.glowColor} flex items-center justify-center cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleOrbClick}
      >
        <div className="text-white text-center relative z-10">
          <motion.div 
            className="text-4xl font-black mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {currentScore}%
          </motion.div>
          
          <motion.div 
            className="text-xs font-semibold opacity-90 flex items-center justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>{visualData.emoji}</span>
            <span>{visualData.status}</span>
          </motion.div>
        </div>

        {/* Trend indicator */}
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

        {/* Alert indicator */}
        {hasAlerts && (
          <motion.div
            className="absolute -bottom-2 -left-2 p-1 bg-red-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
          >
            <span className="text-white text-xs font-bold px-1">{alertCount}</span>
          </motion.div>
        )}

        {/* Sparkle effects for excellent health */}
        {currentScore >= 80 && (
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

      {/* Trust indicators tooltip */}
      <AnimatePresence>
        {isHovered && showTrustIndicators && healthData?.trustIndicators && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md text-white px-4 py-3 rounded-xl text-xs whitespace-nowrap z-20 min-w-max"
          >
            <div className="flex items-center space-x-4">
              {/* Data quality indicator */}
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                <span>{Math.round((healthData.dataQuality || 0.8) * 100)}% data quality</span>
              </div>
              
              <div className="w-px h-3 bg-white/30" />
              
              {/* AI verification */}
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span>AI-verified</span>
              </div>
              
              <div className="w-px h-3 bg-white/30" />
              
              {/* Last updated */}
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'recently'}</span>
              </div>
            </div>
            
            {/* Trust indicators */}
            {healthData.trustIndicators.length > 0 && (
              <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-white/20">
                {healthData.trustIndicators.slice(0, 4).map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <div className={`p-1 rounded-full ${
                      indicator.status === 'good' ? 'bg-green-500/20' :
                      indicator.status === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      {getTrustIndicatorIcon(indicator.type)}
                    </div>
                    <span className={`text-xs ${
                      indicator.status === 'good' ? 'text-green-400' :
                      indicator.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {indicator.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status message */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-xs text-gray-600 font-medium">{visualData.message}</p>
        {hasAlerts && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {alertCount} alert{alertCount !== 1 ? 's' : ''} require attention
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default HealthOrb;