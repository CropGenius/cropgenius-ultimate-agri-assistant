import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageCircle, X, Bot, Sparkles } from 'lucide-react';

interface ChatbotAvatarProps {
  onClick?: () => void;
  className?: string;
  isOpen?: boolean;
  hasNewMessage?: boolean;
  onClose?: () => void;
}

export const ChatbotAvatar: React.FC<ChatbotAvatarProps> = ({
  onClick,
  className = '',
  isOpen = false,
  hasNewMessage = false,
  onClose,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Handle pulse animation
  useEffect(() => {
    if (hasNewMessage) {
      setShowPulse(true);
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasNewMessage]);

  // Handle hover and animation states
  const handleHoverStart = () => {
    if (isOpen) return;
    setIsHovered(true);
  };

  const handleHoverEnd = () => {
    if (isOpen) return;
    setIsHovered(false);
  };

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (onClick) {
      onClick();
    }
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
  };

  return (
    <div className={cn('relative', className)}>
      {/* Chat bubble that appears on hover */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 0 }}
            className="absolute right-16 -top-2 bg-white shadow-lg rounded-xl p-3 w-48 z-50"
          >
            <div className="text-sm font-medium text-gray-800">Need help?</div>
            <p className="text-xs text-gray-500 mt-1">Chat with our AI farming assistant</p>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main avatar button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
          'shadow-lg hover:shadow-xl active:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
          'transition-all duration-200',
          isOpen ? 'scale-100' : 'scale-100 hover:scale-105',
          isAnimating && 'scale-95',
          'z-50', // Ensure it stays above other elements
          className
        )}
        aria-label="Chat with AI Assistant"
      >
        {/* Pulse effect for new messages */}
        {showPulse && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400/30"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{
              scale: [1, 1.5],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Notification badge */}
        {hasNewMessage && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">!</span>
          </motion.div>
        )}

        {/* Main icon */}
        <motion.div
          animate={{
            rotate: isOpen ? 0 : 0,
            scale: isAnimating ? 0.9 : 1,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="relative z-10"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </motion.div>

        {/* AI badge */}
        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
          <Sparkles className="h-3 w-3" />
        </div>
      </motion.button>
    </div>
  );
};

export default ChatbotAvatar;
