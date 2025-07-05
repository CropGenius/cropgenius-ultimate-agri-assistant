import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Award, Crown } from 'lucide-react';

// Floating Particles Component
interface FloatingParticlesProps {
  count?: number;
  color?: 'emerald' | 'blue' | 'purple' | 'gold';
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ 
  count = 15, 
  color = 'emerald' 
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [count]);

  const colorClasses = {
    emerald: 'bg-emerald-400/30',
    blue: 'bg-blue-400/30',
    purple: 'bg-purple-400/30',
    gold: 'bg-yellow-400/30'
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full ${colorClasses[color]}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Success Celebration Component
interface SuccessCelebrationProps {
  show: boolean;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  show,
  onComplete,
  title = "Success!",
  subtitle = "Great job!"
}) => {
  useEffect(() => {
    if (show) {
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
          >
            {/* Celebration Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: 3,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Award className="h-10 w-10 text-white" />
            </motion.div>

            {/* Confetti */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* Text */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Morphing Button Component
interface MorphingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  className?: string;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-blue-500 to-indigo-600'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-r ${variants[variant]} text-white px-6 py-3 rounded-2xl font-medium shadow-lg ${className}`}
    >
      {/* Morphing Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        animate={{
          x: isHovered ? "100%" : "-100%"
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          children
        )}
      </div>
    </motion.button>
  );
};

// Liquid Progress Component
interface LiquidProgressProps {
  progress: number;
  color?: string;
  size?: number;
}

export const LiquidProgress: React.FC<LiquidProgressProps> = ({
  progress,
  color = '#10b981',
  size = 100
}) => {
  return (
    <div 
      className="relative rounded-full border-4 border-gray-200 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          height: `${progress}%`
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Wave Effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-4"
        style={{ backgroundColor: color, opacity: 0.7 }}
        animate={{
          y: [0, -4, 0],
          scaleX: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Progress Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Magnetic Card Component
interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  className = '',
  onClick
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.1, y: y * 0.1 });
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onClick={onClick}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-600/20 rounded-2xl blur-xl"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 0.8
        }}
        transition={{ duration: 0.3 }}
      />
      
      {children}
    </motion.div>
  );
};

// Typewriter Text Component
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
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