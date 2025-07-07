/**
 * 🛰️ SATELLITE FIELD VIEWER - Visual Field Analysis
 * Interactive satellite imagery with NDVI overlays
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FieldAnalysisData {
  fieldHealth: number;
  ndviValue: number;
  moistureStress: string;
  problemAreas: Array<{
    lat: number;
    lng: number;
    severity: string;
  }>;
  recommendations: string[];
}

export const SatelliteFieldViewer: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<FieldAnalysisData | null>(null);
  const [viewMode, setViewMode] = useState<'satellite' | 'ndvi' | 'health'>('satellite');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFieldAnalysis();
  }, []);

  const loadFieldAnalysis = async () => {
    try {
      const mockData: FieldAnalysisData = {
        fieldHealth: 78,
        ndviValue: 0.65,
        moistureStress: 'moderate',
        problemAreas: [
          { lat: -1.2864, lng: 36.8172, severity: 'medium' },
          { lat: -1.2865, lng: 36.8173, severity: 'low' }
        ],
        recommendations: [
          'Increase irrigation in northeast section',
          'Monitor for pest activity in problem areas',
          'Consider foliar feeding for nutrient boost'
        ]
      };
      setAnalysisData(mockData);
    } catch (error) {
      console.error('Error loading field analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing satellite imagery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Field Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Field Analysis</h2>
        
        {/* Satellite Image Placeholder */}
        <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-xl h-64 mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20"></div>
          <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-2">
            <p className="text-xs font-medium text-gray-700">10m Resolution</p>
            <p className="text-xs text-gray-600">Sentinel-2 Imagery</p>
          </div>
          
          {/* Problem Areas Overlay */}
          {analysisData?.problemAreas.map((area, index) => (
            <motion.div
              key={index}
              className={`absolute w-4 h-4 rounded-full ${
                area.severity === 'high' ? 'bg-red-500' :
                area.severity === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
              } opacity-80`}
              style={{
                top: `${30 + index * 20}%`,
                left: `${40 + index * 15}%`
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))}
          
          <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 rounded px-2 py-1">
            Last Updated: Today
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {['satellite', 'ndvi', 'health'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Field Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <MetricCard
            title="Field Health"
            value={`${analysisData?.fieldHealth}%`}
            color="green"
            icon="🌾"
          />
          <MetricCard
            title="NDVI Index"
            value={analysisData?.ndviValue.toFixed(2) || '0.00'}
            color="blue"
            icon="📊"
          />
          <MetricCard
            title="Moisture"
            value={analysisData?.moistureStress || 'Unknown'}
            color="purple"
            icon="💧"
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Recommendations</h3>
        <div className="space-y-3">
          {analysisData?.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="flex items-start p-3 bg-green-50 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-700 flex-1">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          className="bg-green-600 text-white py-3 px-4 rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📱 Get WhatsApp Updates
        </motion.button>
        <motion.button
          className="bg-blue-600 text-white py-3 px-4 rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📊 Detailed Report
        </motion.button>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  color: string;
  icon: string;
}> = ({ title, value, color, icon }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mx-auto mb-2`}>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-600 mb-1">{title}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
};