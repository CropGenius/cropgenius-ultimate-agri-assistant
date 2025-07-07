/**
 * 🎉 ACHIEVEMENT CELEBRATION - Trillion-Dollar Dopamine Explosion
 * Brain-hacking celebration system that creates farming addiction
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/lib/gamificationEngine';
import { useHapticFeedback } from '@/lib/hapticFeedback';

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onComplete: () => void;
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  onComplete
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { triggerSuccess, triggerHeavy } = useHapticFeedback();

  useEffect(() => {
    if (achievement) {
      // Trigger celebration sequence
      triggerHeavy();
      setShowConfetti(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, triggerHeavy]);

  const handleClose = () => {
    setShowConfetti(false);
    setShowShareOptions(false);
    onComplete();
  };

  const handleShare = (platform: string) => {
    const shareText = `🏆 Just unlocked "${achievement?.title}" on CropGenius! 🌾 ${achievement?.description} #SmartFarming #CropGenius`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
        break;
    }
    
    triggerSuccess();
    handleClose();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-green-400 to-green-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-[0_0_40px_rgba(251,191,36,0.8)]';
      case 'epic': return 'shadow-[0_0_40px_rgba(168,85,247,0.8)]';
      case 'rare': return 'shadow-[0_0_40px_rgba(59,130,246,0.8)]';
      default: return 'shadow-[0_0_40px_rgba(16,185,129,0.8)]';
    }
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        {/* Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: 'easeOut',
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}

        {/* Achievement Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mx-4 max-w-sm w-full shadow-glow-green-xl"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Achievement Icon */}
          <motion.div
            className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)} flex items-center justify-center`}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <span className="text-4xl drop-shadow-lg">{achievement.icon}</span>
          </motion.div>

          {/* Achievement Details */}
          <div className="text-center mb-6">
            <motion.div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-700 border border-purple-500/30' :
                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30' :
                'bg-green-500/20 text-green-700 border border-green-500/30'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {achievement.rarity.toUpperCase()}
            </motion.div>
            
            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {achievement.title}
            </motion.h2>
            
            <motion.p
              className="text-sm text-gray-600 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.description}
            </motion.p>
            
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-green-primary">+{achievement.points}</span>
              <span className="text-sm text-gray-600">points</span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full bg-gradient-to-r from-green-primary to-emerald-500 text-white py-3 px-6 rounded-2xl font-medium shadow-glow-green"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              🎉 Share Achievement
            </motion.button>

            {/* Share Options */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  className="flex justify-center space-x-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <motion.button
                    onClick={() => handleShare('whatsapp')}
                    className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    📱
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare('facebook')}
                    className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    📘
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare('twitter')}
                    className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    🐦
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleClose}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/10 text-gray-700 py-2 px-6 rounded-2xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Continue Farming
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};