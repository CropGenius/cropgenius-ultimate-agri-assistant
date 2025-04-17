
import { useEffect } from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';

interface ConversionDetectorProps {
  onDetect?: () => void;
}

/**
 * This component silently monitors user behavior to detect high-value
 * moments when users are most likely to convert to Pro subscriptions
 */
const ConversionDetector = ({ onDetect }: ConversionDetectorProps) => {
  const { user } = useAuth();
  const { memory, shouldShowProUpgrade } = useMemoryStore();
  
  useEffect(() => {
    if (!user) return;
    
    // Check for high-value conversion moments
    const checkConversionTriggers = () => {
      // Don't trigger if user is already on Pro
      if (memory.proStatus) return false;
      
      // Trigger conditions
      return shouldShowProUpgrade();
    };
    
    // Check right away
    if (checkConversionTriggers() && onDetect) {
      onDetect();
    }
    
    // Re-check every minute for user behavior changes
    const interval = setInterval(() => {
      if (checkConversionTriggers() && onDetect) {
        onDetect();
        clearInterval(interval);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user, memory]);
  
  // This is an invisible component
  return null;
};

export default ConversionDetector;
