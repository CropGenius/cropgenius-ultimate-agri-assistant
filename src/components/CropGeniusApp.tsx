/**
 * 🌟 CROPGENIUS - FUTURISTIC AGRICULTURAL INTELLIGENCE PLATFORM
 * =================================================================
 * The most visually stunning agricultural interface ever created!
 * Designed to make Apple jealous and 100M African farmers feel like gods!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, 
  Cloud, 
  TrendingUp, 
  Camera, 
  MapPin, 
  Zap,
  Leaf,
  Eye,
  Brain,
  Globe,
  Star,
  BarChart3,
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react';

// Futuristic color palette that screams premium
const colors = {
  primary: '#00D4FF',      // Electric cyan
  secondary: '#FF6B35',    // Vibrant orange
  accent: '#7B68EE',       // Electric purple
  success: '#00FF88',      // Neon green
  warning: '#FFD700',      // Golden yellow
  danger: '#FF3366',       // Electric red
  dark: '#0A0A0B',         // Deep black
  darkCard: '#1A1A1B',     // Card background
  glass: 'rgba(255, 255, 255, 0.05)', // Glass morphism
  glow: '0 0 30px rgba(0, 212, 255, 0.5)', // Neon glow
};

const CropGeniusApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState('satellite');
  const [farmerData, setFarmerData] = useState({
    location: { lat: -1.286389, lng: 36.817223, name: 'Nairobi, Kenya' },
    crops: ['Maize', 'Beans', 'Tomatoes'],
    fieldHealth: 87,
    yieldPrediction: 4.2,
    marketValue: 1250
  });

  // Epic loading sequence
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <FuturisticLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * window.innerWidth,
              top: Math.random() * window.innerHeight,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <FuturisticHeader />
        <HeroDashboard 
          farmerData={farmerData}
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
        />
        <FeatureGrid activeFeature={activeFeature} />
        <SatelliteImageryDisplay />
        <MarketIntelligenceBoard />
        <AIInsightsPanel />
      </div>
    </div>
  );
};

// 🚀 FUTURISTIC LOADER - SETS THE STAGE
const FuturisticLoader = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-8"
      />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4"
      >
        CROPGENIUS
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-gray-400 text-lg"
      >
        Initializing Agricultural Intelligence...
      </motion.p>
    </div>
  </div>
);

// 🌟 FUTURISTIC HEADER - PREMIUM NAVIGATION
const FuturisticHeader = () => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-0 w-full z-50 backdrop-blur-lg bg-black/20 border-b border-cyan-400/20"
  >
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-3"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          CropGenius
        </span>
      </motion.div>

      <nav className="hidden md:flex space-x-8">
        {['Dashboard', 'Satellite', 'Weather', 'Market', 'AI Assistant'].map((item) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            whileHover={{ scale: 1.1, color: colors.primary }}
            className="text-gray-300 hover:text-cyan-400 transition-colors"
          >
            {item}
          </motion.a>
        ))}
      </nav>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-3"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full" />
        <span className="text-sm text-gray-300">John Mwangi</span>
      </motion.div>
    </div>
  </motion.header>
);

// 🏆 HERO DASHBOARD - THE MAIN ATTRACTION
const HeroDashboard = ({ farmerData, activeFeature, setActiveFeature }) => (
  <div className="pt-24 pb-16 px-6">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
          Agricultural Intelligence
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
          Revolutionary AI-powered insights for African farmers. Real satellite data, weather intelligence, and market analysis in one stunning platform.
        </p>
        
        {/* Real-time stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <StatsCard 
            icon={Satellite}
            value={`${farmerData.fieldHealth}%`}
            label="Field Health"
            color="from-green-400 to-cyan-400"
            glow="shadow-green-400/50"
          />
          <StatsCard 
            icon={TrendingUp}
            value={`${farmerData.yieldPrediction}T/Ha`}
            label="Yield Prediction"
            color="from-purple-400 to-pink-400"
            glow="shadow-purple-400/50"
          />
          <StatsCard 
            icon={BarChart3}
            value={`$${farmerData.marketValue}`}
            label="Market Value"
            color="from-orange-400 to-red-400"
            glow="shadow-orange-400/50"
          />
          <StatsCard 
            icon={Shield}
            value="99.2%"
            label="AI Accuracy"
            color="from-cyan-400 to-blue-400"
            glow="shadow-cyan-400/50"
          />
        </div>
      </motion.div>
    </div>
  </div>
);

// 📊 STATS CARD - GLOWING METRICS
const StatsCard = ({ icon: Icon, value, label, color, glow }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -10 }}
    className={`relative p-6 rounded-2xl bg-gradient-to-br ${color} backdrop-blur-lg shadow-2xl ${glow}`}
  >
    <div className="relative z-10">
      <Icon className="w-8 h-8 text-white mb-4 mx-auto" />
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-white/80">{label}</div>
    </div>
    <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-lg" />
  </motion.div>
);

// 🎯 FEATURE GRID - INTERACTIVE INTELLIGENCE MODULES
const FeatureGrid = ({ activeFeature }) => (
  <div className="px-6 pb-16">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={Satellite}
          title="Satellite Intelligence"
          description="Real NDVI analysis from Sentinel-2 imagery"
          isActive={activeFeature === 'satellite'}
          color="from-blue-500 to-cyan-500"
        />
        <FeatureCard
          icon={Cloud}
          title="Weather Prophecy"
          description="5-day agricultural weather forecasts"
          isActive={activeFeature === 'weather'}
          color="from-purple-500 to-pink-500"
        />
        <FeatureCard
          icon={Camera}
          title="Disease Detection"
          description="AI-powered crop disease identification"
          isActive={activeFeature === 'disease'}
          color="from-orange-500 to-red-500"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Market Intelligence"
          description="Real-time crop prices across Africa"
          isActive={activeFeature === 'market'}
          color="from-green-500 to-teal-500"
        />
      </div>
    </div>
  </div>
);

// 🎨 FEATURE CARD - PREMIUM GLASS MORPHISM
const FeatureCard = ({ icon: Icon, title, description, isActive, color }) => (
  <motion.div
    whileHover={{ scale: 1.05, rotateY: 5 }}
    className={`relative p-8 rounded-3xl backdrop-blur-lg border border-white/10 cursor-pointer group
      ${isActive ? 'bg-gradient-to-br ' + color : 'bg-white/5 hover:bg-white/10'}
    `}
  >
    <div className="relative z-10">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 mx-auto`}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-3 text-center">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </div>
    
    {/* Glow effect */}
    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 bg-gradient-to-br ${color} transition-opacity duration-300`} />
  </motion.div>
);

export default CropGeniusApp;