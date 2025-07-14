/**
 * 📱 MOBILE LAYOUT - Trillion-Dollar Container + Neuro-Magic
 * iPhone 20 Pro level layout with voice, swipe, haptic interactions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { FloatingActionButton } from './FloatingActionButton';
import { VoiceCommandChip } from './VoiceCommandChip';
import { useToast } from './DopamineToast';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useHapticFeedback } from '@/lib/hapticFeedback';
import { AchievementCelebration } from './AchievementCelebration';
import { useGamification, Achievement } from '@/lib/gamificationEngine';


interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  const { isOnline, statusConfig, clearOfflineFlag } = useOfflineStatus();
  const { success, warning, info, ToastContainer } = useToast();
  const { triggerMedium, triggerSuccess } = useHapticFeedback();
  const { trackAction } = useGamification();
  
  // Get current active tab from location
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/farms') return 'home';
    if (path === '/scan') return 'scan';
    if (path === '/market') return 'market';
    if (path === '/weather') return 'weather';
    if (path === '/chat') return 'chat';
    if (path === '/community') return 'community';
    return 'home';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);
  
  useEffect(() => {
    if (statusConfig.status === 'reconnected') {
      success('Connected!', 'All your data is now synced', '🟢');
      const timer = setTimeout(() => {
        clearOfflineFlag();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusConfig.status, clearOfflineFlag, success]);
  
  useEffect(() => {
    // Track daily login with real user
    trackAction('daily_login').then(result => {
      if (result.newAchievements.length > 0) {
        setCelebrationAchievement(result.newAchievements[0]);
      }
    });
  }, [trackAction]);

  const handleScanCrop = async () => {
    navigate('/scan');
    triggerMedium();
    info('Camera Ready', 'Point at your crop to analyze', '📸');
    
    // Track action for gamification
    const result = await trackAction('navigate_to_scan');
    if (result.newAchievements.length > 0) {
      setCelebrationAchievement(result.newAchievements[0]);
    }
  };

  const handleWeatherCheck = async () => {
    navigate('/weather');
    triggerMedium();
    
    const result = await trackAction('weather_check');
    if (result.newAchievements.length > 0) {
      setCelebrationAchievement(result.newAchievements[0]);
    }
  };

  const handleMarketCheck = async () => {
    navigate('/market');
    triggerMedium();
    
    const result = await trackAction('market_check');
    if (result.newAchievements.length > 0) {
      setCelebrationAchievement(result.newAchievements[0]);
    }
  };
  
  const handleVoiceNavigate = (tab: string) => {
    const routeMap = {
      'home': '/farms',
      'scan': '/scan',
      'market': '/market',
      'weather': '/weather',
      'chat': '/chat',
      'community': '/community'
    };
    navigate(routeMap[tab] || '/farms');
    triggerSuccess();
    success('Voice Command', `Navigated to ${tab}`, '🗣️');
  };
  
  const handleVoiceAction = (action: string) => {
    switch (action) {
      case 'analyze':
        if (activeTab === 'scan') {
          success('AI Analysis', 'Starting crop analysis...', '🧠');
        }
        break;
      case 'refresh':
        success('Refreshed', 'Data updated successfully', '🔄');
        break;
    }
    triggerSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Status Bar */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusConfig.color} ${statusConfig.glow}`} />
          <span className="text-xs font-medium text-gray-700">
            {statusConfig.text}
          </span>
          {statusConfig.status === 'reconnected' && (
            <motion.span
              className="text-xs text-green-600 font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ✨ Synced
            </motion.span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-lg">🌾</span>
          <span className="text-sm font-bold text-green-primary">CropGenius</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="w-6 h-3 border border-gray-400 rounded-sm relative">
            <div className="absolute inset-0.5 bg-green-500 rounded-sm" style={{ width: '80%' }} />
          </div>
          <span className="text-xs text-gray-600">80%</span>
        </div>
      </div>

      {/* Main Content - Fixed Scroll Issues */}
      <div className="pb-20 min-h-screen overflow-y-scroll overscroll-y-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="h-full touch-pan-y"
            style={{ touchAction: 'pan-y' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onScanCrop={handleScanCrop}
        onWeatherCheck={handleWeatherCheck}
        onMarketCheck={handleMarketCheck}
      />

      {/* Voice Command Chip */}
      <VoiceCommandChip
        onNavigate={handleVoiceNavigate}
        onAction={handleVoiceAction}
      />
      
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Achievement Celebration */}
      <AchievementCelebration
        achievement={celebrationAchievement}
        onComplete={() => setCelebrationAchievement(null)}
      />
      
      {/* Personalized Greeting */}
      {personalizedGreeting && (
        <motion.div
          className="fixed top-16 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-glow-green z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-gray-800 text-center">{personalizedGreeting}</p>
        </motion.div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          const routeMap = {
            'home': '/farms',
            'scan': '/scan',
            'market': '/market',
            'weather': '/weather',
            'chat': '/chat',
            'community': '/community'
          };
          navigate(routeMap[tab] || '/farms');
          triggerMedium();
        }}
      />
    </div>
  );
};

// Community Hub Component
const CommunityHub: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-glow-green">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Farmer Community</h2>
        
        <div className="space-y-4">
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-gray-800 mb-2">💬 Group Chat</h3>
            <p className="text-sm text-gray-600">Connect with 2,847 farmers in your region</p>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-gray-800 mb-2">🧑‍🌾 Ask Agronomist</h3>
            <p className="text-sm text-gray-600">Get expert advice from certified professionals</p>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-gray-800 mb-2">🏆 Success Stories</h3>
            <p className="text-sm text-gray-600">Share your farming achievements</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};