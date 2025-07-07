/**
 * 📱 MOBILE LAYOUT - Trillion-Dollar Container
 * iPhone 20 Pro level layout with glassmorphism magic
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNavigation } from './BottomNavigation';
import { FloatingActionButton } from './FloatingActionButton';
import { UnifiedFarmDashboard } from './UnifiedFarmDashboard';
import { SatelliteFieldViewer } from './SatelliteFieldViewer';
import { DiseaseDetectionCamera } from './DiseaseDetectionCamera';
import { MarketIntelligenceDashboard } from './MarketIntelligenceDashboard';
import { WeatherIntelligenceWidget } from './WeatherIntelligenceWidget';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const handleScanCrop = () => {
    setActiveTab('scan');
  };

  const handleWeatherCheck = () => {
    setActiveTab('weather');
  };

  const handleMarketCheck = () => {
    setActiveTab('market');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <UnifiedFarmDashboard />;
      case 'scan':
        return <DiseaseDetectionCamera />;
      case 'market':
        return <MarketIntelligenceDashboard />;
      case 'weather':
        return <WeatherIntelligenceWidget />;
      case 'community':
        return <CommunityHub />;
      default:
        return <UnifiedFarmDashboard />;
    }
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden\">
      {/* Background Pattern */}
      <div className=\"absolute inset-0 opacity-5\">\n        <div className=\"absolute inset-0\" style={{\n          backgroundImage: `url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")`,\n        }} />\n      </div>\n\n      {/* Status Bar */}\n      <div className=\"bg-white/10 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-between\">\n        <div className=\"flex items-center space-x-2\">\n          <div className={`w-2 h-2 rounded-full ${\n            isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'\n          }`} />\n          <span className=\"text-xs font-medium text-gray-700\">\n            {isOnline ? 'Online' : 'Offline Mode'}\n          </span>\n        </div>\n        \n        <div className=\"flex items-center space-x-1\">\n          <span className=\"text-lg\">🌾</span>\n          <span className=\"text-sm font-bold text-green-primary\">CropGenius</span>\n        </div>\n        \n        <div className=\"flex items-center space-x-1\">\n          <div className=\"w-6 h-3 border border-gray-400 rounded-sm relative\">\n            <div className=\"absolute inset-0.5 bg-green-500 rounded-sm\" style={{ width: '80%' }} />\n          </div>\n          <span className=\"text-xs text-gray-600\">80%</span>\n        </div>\n      </div>\n\n      {/* Main Content */}\n      <div className=\"pb-20 min-h-screen\">\n        <AnimatePresence mode=\"wait\">\n          <motion.div\n            key={activeTab}\n            initial={{ opacity: 0, x: 20 }}\n            animate={{ opacity: 1, x: 0 }}\n            exit={{ opacity: 0, x: -20 }}\n            transition={{ duration: 0.3 }}\n            className=\"h-full\"\n          >\n            {renderContent()}\n          </motion.div>\n        </AnimatePresence>\n      </div>\n\n      {/* Floating Action Button */}\n      <FloatingActionButton\n        onScanCrop={handleScanCrop}\n        onWeatherCheck={handleWeatherCheck}\n        onMarketCheck={handleMarketCheck}\n      />\n\n      {/* Bottom Navigation */}\n      <BottomNavigation\n        activeTab={activeTab}\n        onTabChange={setActiveTab}\n      />\n    </div>\n  );\n};\n\n// Community Hub Component\nconst CommunityHub: React.FC = () => {\n  return (\n    <div className=\"p-4 space-y-6\">\n      <div className=\"bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-glow-green\">\n        <h2 className=\"text-2xl font-bold text-gray-800 mb-4\">👥 Farmer Community</h2>\n        \n        <div className=\"space-y-4\">\n          <motion.div \n            className=\"bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4\"\n            whileHover={{ scale: 1.02 }}\n          >\n            <h3 className=\"font-semibold text-gray-800 mb-2\">💬 Group Chat</h3>\n            <p className=\"text-sm text-gray-600\">Connect with 2,847 farmers in your region</p>\n          </motion.div>\n          \n          <motion.div \n            className=\"bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4\"\n            whileHover={{ scale: 1.02 }}\n          >\n            <h3 className=\"font-semibold text-gray-800 mb-2\">🧑‍🌾 Ask Agronomist</h3>\n            <p className=\"text-sm text-gray-600\">Get expert advice from certified professionals</p>\n          </motion.div>\n          \n          <motion.div \n            className=\"bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4\"\n            whileHover={{ scale: 1.02 }}\n          >\n            <h3 className=\"font-semibold text-gray-800 mb-2\">🏆 Success Stories</h3>\n            <p className=\"text-sm text-gray-600\">Share your farming achievements</p>\n          </motion.div>\n        </div>\n      </div>\n    </div>\n  );\n};