import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Users, 
  TrendingUp,
  Shield,
  Zap,
  Star,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Gift,
  Target,
  Heart
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
  badge?: {
    text: string;
    color: string;
    pulse?: boolean;
  };
  stats?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  };
  urgency?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timeLeft?: string;
  };
  socialProof?: {
    count: number;
    action: string;
    timeframe: string;
  };
  premium?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const EnhancedFeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  gradient,
  onClick,
  badge,
  stats,
  urgency,
  socialProof,
  premium = false,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Pulse animation for urgent items
  useEffect(() => {
    if (urgency?.level === 'critical') {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [urgency?.level]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Clock className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Premium Glow Effect */}
      {premium && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl blur opacity-30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Critical Pulse Ring */}
      {urgency?.level === 'critical' && (
        <motion.div
          key={pulseCount}
          className="absolute -inset-2 border-2 border-red-400 rounded-3xl"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}

      {/* Main Card */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          relative w-full p-6 rounded-2xl text-left transition-all duration-300
          bg-gradient-to-br ${gradient} text-white shadow-lg overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'}
          ${loading ? 'cursor-wait' : ''}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: loading ? [-200, 200] : [-200, -200]
          }}
          transition={{
            duration: 1.5,
            repeat: loading ? Infinity : 0,
            ease: "linear"
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  icon
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-white/80 text-sm">{subtitle}</p>
              </div>
            </div>

            {/* Premium Badge */}
            {premium && (
              <div className="flex items-center space-x-1 bg-yellow-400/20 px-2 py-1 rounded-full">
                <Crown className="h-3 w-3 text-yellow-300" />
                <span className="text-xs font-medium text-yellow-200">PRO</span>
              </div>
            )}

            {/* Custom Badge */}
            {badge && (
              <motion.div
                className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${badge.color}`}
                animate={badge.pulse ? { scale: [1, 1.1, 1] } : {}}
                transition={badge.pulse ? { duration: 1, repeat: Infinity } : {}}
              >
                {badge.text}
              </motion.div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {stats.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-300" />}
                {stats.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-300 rotate-180" />}
                {stats.trend === 'stable' && <Shield className="h-4 w-4 text-blue-300" />}
                <span className="font-bold text-lg">{stats.value}</span>
              </div>
              <span className="text-white/60 text-xs">{stats.label}</span>
            </div>
          )}

          {/* Urgency Indicator */}
          {urgency && (
            <div className={`flex items-center space-x-2 mb-4 p-2 rounded-lg bg-gradient-to-r ${getUrgencyColor(urgency.level)}/20`}>
              {getUrgencyIcon(urgency.level)}
              <div className="flex-1">
                <p className="text-xs font-medium text-white">{urgency.message}</p>
                {urgency.timeLeft && (
                  <p className="text-xs text-white/70">Time left: {urgency.timeLeft}</p>
                )}
              </div>
            </div>
          )}

          {/* Social Proof */}
          {socialProof && (
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-4 w-4 text-white/60" />
              <p className="text-xs text-white/70">
                <span className="font-semibold text-white">{socialProof.count.toLocaleString()}</span> farmers {socialProof.action} {socialProof.timeframe}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!loading && (
                <>
                  <Sparkles className="h-4 w-4 text-white/60" />
                  <span className="text-xs text-white/60">
                    {premium ? 'Premium Feature' : 'AI-Powered'}
                  </span>
                </>
              )}
            </div>
            
            <motion.div
              className="flex items-center space-x-1"
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-sm font-medium">
                {loading ? 'Loading...' : disabled ? 'Coming Soon' : 'Open'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {isHovered && description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20"
            >
              {description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/90" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="flex items-center space-x-2 text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default EnhancedFeatureCard;