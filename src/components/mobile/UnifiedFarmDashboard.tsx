/**
 * 📱 UNIFIED FARM DASHBOARD - Mobile-First Design
 * Visual representation of comprehensive farm intelligence
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserFarms, useFarmHealthScore, useMarketPrices, useWeatherForecast } from '@/hooks/useBackendIntelligence';

interface FarmHealthData {
  overallHealth: number;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    icon: string;
  }>;
  quickStats: {
    fieldHealth: number;
    weatherRisk: string;
    marketTrend: string;
    diseaseRisk: string;
  };
}

export const UnifiedFarmDashboard: React.FC = () => {
  // Backend Intelligence Hooks
  const { data: farms, isLoading: farmsLoading } = useUserFarms();
  const { data: healthScore, isLoading: healthLoading } = useFarmHealthScore();
  const { data: marketData, isLoading: marketLoading } = useMarketPrices('kenya');
  const { data: weatherData, isLoading: weatherLoading } = useWeatherForecast(-1.286389, 36.817223);
  
  const loading = farmsLoading || healthLoading;
  
  // Transform backend data
  const farmData = useMemo(() => {
    if (!healthScore?.data) return null;
    
    return {
      overallHealth: healthScore.data.overallHealth,
      alerts: healthScore.data.alerts || [],
      quickStats: {
        fieldHealth: healthScore.data.factors.cropHealth,
        weatherRisk: weatherData?.data?.insights?.pest_risk || 'low',
        marketTrend: marketData?.[0]?.price_analysis?.trend_direction || 'stable',
        diseaseRisk: healthScore.data.factors.diseaseRisk < 30 ? 'low' : 'medium'
      }
    };
  }, [healthScore, weatherData, marketData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 space-y-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse">
          <div className="h-24 bg-white/20 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-pulse h-24"></div>)}
        </div>
      </div>
    );
  }
  
  if (!farmData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-6xl mb-4">🌾</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to CropGenius!</h2>
          <p className="text-gray-600 mb-6">Let's set up your first farm to get started with AI-powered insights.</p>
          <button className="bg-green-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
            🚀 Create Farm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 space-y-6">
      {/* Farm Health Orb - Glassmorphism */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-glow-green">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Farm Health</h2>
              <p className="text-gray-600/80">AI Intelligence Score</p>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90 drop-shadow-lg">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (farmData?.overallHealth || 0) / 100)}`}
                  className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-primary drop-shadow-lg">
                  {farmData?.overallHealth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid - Glassmorphism */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Field Health" value={`${farmData?.quickStats.fieldHealth}%`} icon="🌾" color="green" />
        <StatCard title="Weather Risk" value={farmData?.quickStats.weatherRisk} icon="🌦️" color="blue" />
        <StatCard title="Market Trend" value={farmData?.quickStats.marketTrend} icon="📈" color="purple" />
        <StatCard title="Disease Risk" value={farmData?.quickStats.diseaseRisk} icon="🔬" color="orange" />
      </div>

      {/* Alerts Section - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🚨 Priority Alerts</h3>
        <div className="space-y-3">
          {farmData?.alerts.map((alert, index) => (
            <motion.div
              key={index}
              className="flex items-center p-3 bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl mr-3 drop-shadow-lg">{alert.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
                <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                  alert.severity === 'high' ? 'bg-red-500/20 text-red-700 border border-red-500/30' :
                  alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-700 border border-green-500/30'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'from-green-400 to-green-600 shadow-[0_8px_20px_rgba(16,185,129,0.3)]',
    blue: 'from-blue-400 to-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.3)]',
    purple: 'from-purple-400 to-purple-600 shadow-[0_8px_20px_rgba(147,51,234,0.3)]',
    orange: 'from-orange-400 to-orange-600 shadow-[0_8px_20px_rgba(245,158,11,0.3)]'
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green hover:shadow-glow-green-lg transition-all duration-300"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3 backdrop-blur-sm`}>
        <span className="text-2xl drop-shadow-lg">{icon}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-700/80 mb-1">{title}</h4>
      <p className="text-xl font-bold text-gray-800 drop-shadow-sm">{value}</p>
    </motion.div>
  );
};