/**
 * 🎤 VOICE COMMAND CHIP - Trillion-Dollar Voice UI
 * Floating glass voice interface with real-time transcript
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { useHapticFeedback } from '@/lib/hapticFeedback';

interface VoiceCommandChipProps {
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
}

export const VoiceCommandChip: React.FC<VoiceCommandChipProps> = ({
  onNavigate,
  onAction
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const { triggerSuccess, triggerError, triggerMedium } = useHapticFeedback();

  const voiceCommands = {
    'scan crop': () => {
      onNavigate('scan');
      triggerSuccess();
    },
    'scan field': () => {
      onNavigate('scan');
      triggerSuccess();
    },
    'show market': () => {
      onNavigate('market');
      triggerSuccess();
    },
    'market prices': () => {
      onNavigate('market');
      triggerSuccess();
    },
    'weather forecast': () => {
      onNavigate('weather');
      triggerSuccess();
    },
    'check weather': () => {
      onNavigate('weather');
      triggerSuccess();
    },
    'farm health': () => {
      onNavigate('home');
      triggerSuccess();
    },
    'home dashboard': () => {
      onNavigate('home');
      triggerSuccess();
    },
    'community chat': () => {
      onNavigate('community');
      triggerSuccess();
    },
    'analyze': () => {
      onAction('analyze');
      triggerSuccess();
    },
    'refresh': () => {
      onAction('refresh');
      triggerMedium();
    }
  };

  const {
    isSupported,
    isListening,
    transcript,
    toggleListening
  } = useVoiceCommand({
    commands: voiceCommands,
    onListening: (listening) => {
      setShowTranscript(listening);
      if (listening) {
        triggerMedium();
      }
    },
    onResult: (result) => {
      console.log('Voice result:', result);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      triggerError();
    }
  });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Voice Button */}
      <motion.button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-green-primary/20 shadow-glow-green-xl animate-glow-pulse' 
            : 'bg-white/10 shadow-glow-green hover:shadow-glow-green-lg'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isListening 
            ? '0 0 30px rgba(16, 185, 129, 1)' 
            : '0 8px 30px rgba(16, 185, 129, 0.4)'
        }}
      >
        <motion.span 
          className="text-2xl"
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0
          }}
        >
          {isListening ? '🎤' : '🗣️'}
        </motion.span>
      </motion.button>

      {/* Transcript Display */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            className="absolute top-16 right-0 min-w-48 max-w-64 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-glow-green"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                className="w-2 h-2 bg-green-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              />
              <span className="text-xs font-medium text-gray-700">Listening...</span>
            </div>
            
            {transcript && (
              <motion.div
                className="bg-white/5 backdrop-blur-sm rounded-xl p-2 border border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-gray-800 font-medium">"{transcript}"</p>
              </motion.div>
            )}
            
            {!transcript && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>Try saying:</p>
                <div className="space-y-0.5">
                  <p className="text-green-primary">"Scan crop"</p>
                  <p className="text-green-primary">"Check weather"</p>
                  <p className="text-green-primary">"Market prices"</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Command Hints */}
      {!isListening && (
        <motion.div
          className="absolute -bottom-2 right-0 bg-green-primary/20 backdrop-blur-sm rounded-full px-2 py-1 border border-green-primary/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs font-medium text-green-primary">Voice AI</span>
        </motion.div>
      )}
    </div>
  );
};