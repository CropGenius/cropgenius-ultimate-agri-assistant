/**
 * ✨ LOADING STATES - Trillion-Dollar Shimmers
 * Beautiful loading states with green glow magic
 */

import React from 'react';
import { motion } from 'framer-motion';

// Shimmer Card Loader
export const ShimmerCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${className}`}>
    <div className="animate-pulse space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-500/10 rounded-xl animate-shimmer"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-green-500/10 rounded-lg animate-shimmer"></div>
          <div className="h-3 bg-green-500/10 rounded-lg w-2/3 animate-shimmer"></div>
        </div>
      </div>
      <div className="h-20 bg-green-500/10 rounded-xl animate-shimmer"></div>
    </div>
  </div>
);

// Health Orb Loader
export const HealthOrbLoader: React.FC = () => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-glow-green">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-green-500/10 rounded-lg w-32 animate-shimmer"></div>
        <div className="h-4 bg-green-500/10 rounded-lg w-24 animate-shimmer"></div>
      </div>
      <div className="relative">
        <motion.div 
          className="w-24 h-24 rounded-full bg-green-500/10 animate-glow-pulse"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-2 rounded-full bg-white/5 backdrop-blur-sm"></div>
        </motion.div>
      </div>
    </div>
  </div>
);

// Disease Analysis Loader
export const DiseaseAnalysisLoader: React.FC = () => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-glow-green"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="relative mb-4">
      <div className="w-16 h-16 bg-gradient-to-r from-green-primary to-emerald-500 rounded-2xl animate-glow-pulse flex items-center justify-center mx-auto">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-primary/20 to-transparent animate-shimmer rounded-2xl"></div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-green-500/10 rounded-lg mx-auto w-48 animate-shimmer"></div>
      <div className="h-4 bg-green-500/10 rounded-lg mx-auto w-32 animate-shimmer"></div>
    </div>
    <div className="mt-4 bg-white/5 rounded-xl p-2">
      <div className="h-1 bg-gradient-to-r from-green-primary to-emerald-500 rounded-full animate-pulse"></div>
    </div>
  </motion.div>
);

// Market Data Loader
export const MarketDataLoader: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl animate-shimmer"></div>
            <div className="space-y-2">
              <div className="h-4 bg-green-500/10 rounded-lg w-20 animate-shimmer"></div>
              <div className="h-3 bg-green-500/10 rounded-lg w-16 animate-shimmer"></div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-5 bg-green-500/10 rounded-lg w-16 animate-shimmer"></div>
            <div className="h-3 bg-green-500/10 rounded-lg w-12 animate-shimmer"></div>
          </div>
        </div>
        <div className="h-16 bg-green-500/10 rounded-xl animate-shimmer"></div>
      </div>
    ))}
  </div>
);

// Weather Widget Loader
export const WeatherWidgetLoader: React.FC = () => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-glow-green">
    <div className="flex bg-gray-50/10">
      {['Current', 'Forecast', 'Insights'].map((tab) => (
        <div key={tab} className="flex-1 py-3 px-2 text-center">
          <div className="h-4 bg-green-500/10 rounded-lg animate-shimmer"></div>
        </div>
      ))}
    </div>
    <div className="p-4 space-y-4">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-500/10 rounded-2xl mx-auto animate-shimmer"></div>
        <div className="h-8 bg-green-500/10 rounded-lg w-24 mx-auto animate-shimmer"></div>
        <div className="h-4 bg-green-500/10 rounded-lg w-32 mx-auto animate-shimmer"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 rounded-xl p-3 animate-shimmer h-20"></div>
        <div className="bg-green-500/10 rounded-xl p-3 animate-shimmer h-20"></div>
      </div>
    </div>
  </div>
);

// Error State Component
export const ErrorState: React.FC<{
  message: string;
  onRetry: () => void;
  icon?: string;
}> = ({ message, onRetry, icon = '⚠️' }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-glow-green"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops!</h3>
    <p className="text-sm text-gray-600 mb-4">{message}</p>
    <motion.button
      onClick={onRetry}
      className="bg-gradient-to-r from-green-primary to-emerald-500 text-white py-2 px-6 rounded-xl font-medium shadow-glow-green"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      🔄 Try Again
    </motion.button>
  </motion.div>
);

// Empty State Component
export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: string;
}> = ({ title, description, actionLabel, onAction, icon = '🌱' }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-glow-green"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <motion.button
      onClick={onAction}
      className="bg-gradient-to-r from-green-primary to-emerald-500 text-white py-3 px-8 rounded-2xl font-medium shadow-glow-green-lg"
      whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(16, 185, 129, 0.8)' }}
      whileTap={{ scale: 0.95 }}
    >
      {actionLabel}
    </motion.button>
  </motion.div>
);