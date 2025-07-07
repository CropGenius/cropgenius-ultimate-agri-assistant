/**
 * 🗣️ VOICE COMMAND ENGINE - Trillion-Dollar Voice AI
 * Brain-hacking voice interactions with green glow feedback
 */

import { useState, useEffect, useCallback } from 'react';

interface VoiceCommandConfig {
  commands: Record<string, () => void>;
  onListening?: (listening: boolean) => void;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceCommand = ({ commands, onListening, onResult, onError }: VoiceCommandConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        onListening?.(true);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        onListening?.(false);
      };
      
      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript.toLowerCase().trim();
        
        setTranscript(transcriptResult);
        onResult?.(transcriptResult);
        
        // Check for command matches
        Object.entries(commands).forEach(([command, action]) => {
          if (transcriptResult.includes(command.toLowerCase())) {
            action();
            // Haptic feedback for successful command
            if ('vibrate' in navigator) {
              navigator.vibrate(100);
            }
          }
        });
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        setIsListening(false);
        onListening?.(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [commands, onListening, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
};