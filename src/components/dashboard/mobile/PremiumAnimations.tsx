import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Zap, 
  Award, 
  Crown,
  Gift,
  Target,
  TrendingUp,
  CheckCircle2,
  Flame,
  Shield
} from 'lucide-react';

// Floating Particles Animation
export const FloatingParticles: React.FC<{ count?: number; color?: string }> = ({ 
  count = 20, 
  color = 'emerald' 
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 bg-${color}-400 rounded-full opacity-60`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Success Celebration Animation
export const SuccessCelebration: React.FC<{ 
  show: boolean; 
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
}> = ({ show, onComplete, title = "Success!", subtitle = "Great job!" }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][i % 5],
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 400],
                  y: [0, (Math.random() - 0.5) * 400],
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Morphing Button Animation
export const MorphingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const variants = {
    primary: 'from-emerald-500 to-green-600',
    secondary: 'from-blue-500 to-cyan-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-orange-500 to-red-500'
  };

  const handlePress = () => {
    setIsPressed(true);
    controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3 }
    });
    setTimeout(() => setIsPressed(false), 300);
    onClick?.();
  };

  return (
    <motion.button
      animate={controls}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : handlePress}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden px-6 py-3 rounded-2xl font-semibold text-white
        bg-gradient-to-r ${variants[variant]} shadow-lg transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
        ${className}
      `}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: loading ? [-200, 200] : [-200, -200]
        }}
        transition={{
          duration: 1.5,
          repeat: loading ? Infinity : 0,
          ease: "linear"
        }}
      />

      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          children
        )}
      </div>

      <AnimatePresence>
        {isPressed && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white/20 rounded-full"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Liquid Progress Bar
export const LiquidProgress: React.FC<{
  progress: number;
  height?: number;
  color?: string;
  animated?: boolean;
}> = ({ progress, height = 8, color = 'emerald', animated = true }) => {
  return (
    <div 
      className="relative bg-gray-200 rounded-full overflow-hidden"
      style={{ height }}
    >
      <motion.div
        className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
      >
        {animated && (
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)`,
              backgroundSize: '200% 100%'
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

// Magnetic Card Effect
export const MagneticCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}> = ({ children, className = '', intensity = 0.1 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const handleMouse = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) * intensity);
    y.set((event.clientY - centerY) * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Typewriter Effect
export const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}> = ({ text, speed = 50, className = '', onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

export default {
  FloatingParticles,
  SuccessCelebration,
  MorphingButton,
  LiquidProgress,
  MagneticCard,
  TypewriterText
};