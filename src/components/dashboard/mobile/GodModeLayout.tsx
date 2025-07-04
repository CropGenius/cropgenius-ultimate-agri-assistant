import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { OneFingerNavigation } from './OneFingerNavigation';
import { FloatingParticles, SuccessCelebration } from './PremiumAnimations';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Signal,
  Bell,
  Settings,
  User,
  Crown,
  Flame,
  Award
} from 'lucide-react';

interface GodModeLayoutProps {
  children: React.ReactNode;
  showParticles?: boolean;
  particleCount?: number;
  showStatusBar?: boolean;
  showNavigation?: boolean;
  backgroundGradient?: string;
}

export const GodModeLayout: React.FC<GodModeLayoutProps> = ({
  children,
  showParticles = true,
  particleCount = 15,
  showStatusBar = true,
  showNavigation = true,
  backgroundGradient = 'from-green-50 via-emerald-50 to-teal-50'
}) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ title: '', subtitle: '' });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Battery API (if supported)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  const triggerCelebration = (title: string, subtitle: string) => {
    setCelebrationData({ title, subtitle });
    setShowCelebration(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalBars = (strength: number) => {
    return [...Array(4)].map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full ${
          i < strength ? 'bg-gray-900' : 'bg-gray-300'
        }`}
        style={{ height: `${(i + 1) * 3 + 2}px` }}
      />
    ));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} relative overflow-hidden`}>
      {/* Floating Particles Background */}
      {showParticles && <FloatingParticles count={particleCount} color="emerald" />}
      
      {/* Success Celebration */}
      <SuccessCelebration 
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
        title={celebrationData.title}
        subtitle={celebrationData.subtitle}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Status Bar */}
      {showStatusBar && (
        <div className="relative z-10 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            {/* Time */}
            <span className="font-medium text-gray-900">
              {formatTime(currentTime)}
            </span>
            
            {/* Network Status */}
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-gray-700" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Signal Strength */}
            <div className="flex items-center space-x-0.5">
              {getSignalBars(signalStrength)}
            </div>

            {/* Battery */}
            <div className="flex items-center space-x-1">
              <Battery className={`h-4 w-4 ${getBatteryColor(batteryLevel)}`} />
              <span className={`text-xs font-medium ${getBatteryColor(batteryLevel)}`}>
                {batteryLevel}%
              </span>
            </div>

            {/* Notifications */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="relative p-1"
            >
              <Bell className="h-4 w-4 text-gray-700" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              />
            </motion.button>
          </div>
        </div>
      )}

      {/* Network Status Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Working Offline - Data will sync when connected</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`relative z-10 ${showNavigation ? 'pb-24' : ''}`}>
        {children}
      </main>

      {/* One-Finger Navigation */}
      {showNavigation && (
        <OneFingerNavigation 
          currentRoute={location.pathname}
          onNavigate={(route) => {
            // Trigger celebration for certain actions
            if (route === '/scan') {
              triggerCelebration('AI Scan Ready!', 'Point camera at your crops 📸');
            } else if (route === '/market') {
              triggerCelebration('Market Insights!', 'Check the latest prices 💰');
            }
          }}
          showLabels={true}
          compactMode={false}
        />
      )}

      {/* Premium Features Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        className="fixed top-20 right-4 z-30"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
          <Crown className="h-3 w-3" />
          <span>GOD MODE</span>
        </div>
      </motion.div>

      {/* Performance Metrics (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="fixed bottom-32 left-4 bg-black/80 text-white p-2 rounded-lg text-xs z-30"
        >
          <div>Route: {location.pathname}</div>
          <div>Online: {isOnline ? 'Yes' : 'No'}</div>
          <div>Battery: {batteryLevel}%</div>
          <div>Signal: {signalStrength}/4</div>
        </motion.div>
      )}
    </div>
  );
};

export default GodModeLayout;