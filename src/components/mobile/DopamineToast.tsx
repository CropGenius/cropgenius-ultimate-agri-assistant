/**
 * 🎉 DOPAMINE TOAST - Trillion-Dollar Notifications
 * Brain-hacking success notifications with green glow magic
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/lib/hapticFeedback';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  icon?: string;
}

interface DopamineToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export const DopamineToast: React.FC<DopamineToastProps> = ({
  messages,
  onRemove
}) => {
  const { triggerSuccess, triggerWarning, triggerError } = useHapticFeedback();

  useEffect(() => {
    messages.forEach(message => {
      // Trigger haptic feedback based on message type
      switch (message.type) {
        case 'success':
          triggerSuccess();
          break;
        case 'warning':
          triggerWarning();
          break;
        case 'error':
          triggerError();
          break;
      }

      // Auto-remove after duration
      const timer = setTimeout(() => {
        onRemove(message.id);
      }, message.duration || 4000);

      return () => clearTimeout(timer);
    });
  }, [messages, onRemove, triggerSuccess, triggerWarning, triggerError]);

  const getToastStyles = (type: string) => {
    const styles = {
      success: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]',
        icon: '✅'
      },
      warning: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
        icon: '⚠️'
      },
      error: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
        icon: '❌'
      },
      info: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
        icon: 'ℹ️'
      }
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  return (
    <div className="fixed top-24 left-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {messages.map((message) => {
          const styles = getToastStyles(message.type);
          
          return (
            <motion.div
              key={message.id}
              className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${styles.bg} ${styles.border} ${styles.glow} pointer-events-auto`}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                boxShadow: styles.glow.replace('shadow-[', '').replace(']', '')
              }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onRemove(message.id)}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  className="text-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeInOut'
                  }}
                >
                  {message.icon || styles.icon}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4 
                    className="text-sm font-bold text-gray-800 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {message.title}
                  </motion.h4>
                  
                  <motion.p 
                    className="text-xs text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {message.message}
                  </motion.p>
                </div>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(message.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              {/* Progress Bar */}
              <motion.div
                className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={`h-full ${
                    message.type === 'success' ? 'bg-green-500' :
                    message.type === 'warning' ? 'bg-yellow-500' :
                    message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  } rounded-full`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: (message.duration || 4000) / 1000,
                    ease: 'linear'
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setMessages(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const success = (title: string, message: string, icon?: string) => {
    addToast({ type: 'success', title, message, icon });
  };

  const warning = (title: string, message: string, icon?: string) => {
    addToast({ type: 'warning', title, message, icon });
  };

  const error = (title: string, message: string, icon?: string) => {
    addToast({ type: 'error', title, message, icon });
  };

  const info = (title: string, message: string, icon?: string) => {
    addToast({ type: 'info', title, message, icon });
  };

  return {
    messages,
    removeToast,
    success,
    warning,
    error,
    info,
    ToastContainer: () => (
      <DopamineToast messages={messages} onRemove={removeToast} />
    )
  };
};