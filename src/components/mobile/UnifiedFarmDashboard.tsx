/**
 * 📱 UNIFIED FARM DASHBOARD - Mobile-First Design
 * Visual representation of comprehensive farm intelligence
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  const [farmData, setFarmData] = useState<FarmHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmData();
  }, []);

  const loadFarmData = async () => {
    try {
      const mockData: FarmHealthData = {
        overallHealth: 78,
        alerts: [
          { type: 'weather', severity: 'medium', message: 'Rain expected in 2 days', icon: '🌧️' },
          { type: 'market', severity: 'low', message: 'Maize prices stable', icon: '💰' }
        ],
        quickStats: {
          fieldHealth: 82,
          weatherRisk: 'low',
          marketTrend: 'stable',
          diseaseRisk: 'low'
        }
      };
      setFarmData(mockData);
    } catch (error) {
      console.error('Error loading farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Farm Health Orb */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Farm Health</h2>
              <p className="text-gray-600">Overall Status</p>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
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
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {farmData?.overallHealth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Field Health" value={`${farmData?.quickStats.fieldHealth}%`} icon="🌾" color="green" />
        <StatCard title="Weather Risk" value={farmData?.quickStats.weatherRisk} icon="🌦️" color="blue" />
        <StatCard title="Market Trend" value={farmData?.quickStats.marketTrend} icon="📈" color="purple" />
        <StatCard title="Disease Risk" value={farmData?.quickStats.diseaseRisk} icon="🔬" color="orange" />
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Alerts</h3>
        <div className="space-y-3">
          {farmData?.alerts.map((alert, index) => (
            <motion.div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-xl"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-2xl mr-3">{alert.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{alert.message}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {alert.severity}
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
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600'
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-4 shadow-md"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-600 mb-1">{title}</h4>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
};