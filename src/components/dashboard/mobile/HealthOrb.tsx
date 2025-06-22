import React from 'react';
import { motion } from 'framer-motion';

interface HealthOrbProps {
  score: number;
  size?: number;
  className?: string;
}

export const HealthOrb: React.FC<HealthOrbProps> = ({ 
  score, 
  size = 120,
  className = '' 
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-teal-500';
    if (score >= 60) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-pink-500';
  };

  const getPulseColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/30';
    if (score >= 60) return 'bg-yellow-500/30';
    return 'bg-red-500/30';
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Pulsing background effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${getPulseColor(score)}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Main orb */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${getHealthColor(score)} shadow-lg flex items-center justify-center`}
      >
        <div className="text-white text-center">
          <div className="text-3xl font-bold">{score}%</div>
          <div className="text-xs opacity-80">Health</div>
        </div>
      </div>
    </div>
  );
};

export default HealthOrb;
