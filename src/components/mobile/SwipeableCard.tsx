/**
 * 👆 SWIPEABLE CARD - Trillion-Dollar Gesture Magic
 * Buttery smooth swipe interactions with green glow dopamine
 */

import React, { ReactNode } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  disabled = false
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for visual feedback
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = 500;
    
    // Horizontal swipes
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight();
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(50);
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
        if ('vibrate' in navigator) navigator.vibrate(50);
      }
    }
    
    // Vertical swipes
    if (Math.abs(info.offset.y) > threshold || Math.abs(info.velocity.y) > velocity) {
      if (info.offset.y < 0 && onSwipeUp) {
        onSwipeUp();
        if ('vibrate' in navigator) navigator.vibrate(100);
      } else if (info.offset.y > 0 && onSwipeDown) {
        onSwipeDown();
        if ('vibrate' in navigator) navigator.vibrate(75);
      }
    }
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`${className} cursor-grab active:cursor-grabbing`}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotateZ,
        opacity,
        scale
      }}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.8)',
        zIndex: 10
      }}
      animate={{
        x: 0,
        y: 0,
        rotateZ: 0,
        scale: 1
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
      
      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-primary text-2xl opacity-0"
        animate={{
          opacity: useTransform(x, [50, 100], [0, 1]).get(),
          scale: useTransform(x, [50, 100], [0.8, 1.2]).get()
        }}
      >
        →
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-green-primary text-2xl opacity-0"
        animate={{
          opacity: useTransform(x, [-100, -50], [1, 0]).get(),
          scale: useTransform(x, [-100, -50], [1.2, 0.8]).get()
        }}
      >
        ←
      </motion.div>
    </motion.div>
  );
};