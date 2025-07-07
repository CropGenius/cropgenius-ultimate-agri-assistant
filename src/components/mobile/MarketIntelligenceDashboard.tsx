/**
 * 💰 MARKET INTELLIGENCE DASHBOARD - Real-Time Pricing
 * Visual market data with trends and opportunities
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  crop: string;
  currentPrice: number;
  priceChange: number;
  trend: 'rising' | 'falling' | 'stable';
  bestMarket: string;
  opportunity: string;
}

interface MarketSummary {
  totalValue: number;
  bestOpportunity: string;
  marketTrend: string;
  priceAlerts: number;
}

export const MarketIntelligenceDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      const mockData: MarketData[] = [
        {
          crop: 'Maize',
          currentPrice: 0.35,
          priceChange: 5.2,
          trend: 'rising',
          bestMarket: 'Nairobi Central',
          opportunity: 'Price spike expected'
        },
        {
          crop: 'Beans',
          currentPrice: 1.10,
          priceChange: -2.1,
          trend: 'falling',
          bestMarket: 'Kisumu Market',
          opportunity: 'Hold for better prices'
        },
        {
          crop: 'Tomato',
          currentPrice: 0.80,
          priceChange: 8.7,
          trend: 'rising',
          bestMarket: 'Mombasa Market',
          opportunity: 'Sell immediately'
        },
        {
          crop: 'Onion',
          currentPrice: 0.60,
          priceChange: 0.5,
          trend: 'stable',
          bestMarket: 'Local Cooperative',
          opportunity: 'Stable demand'
        }
      ];

      const mockSummary: MarketSummary = {
        totalValue: 2850,
        bestOpportunity: 'Tomato prices up 8.7%',
        marketTrend: 'Mixed',
        priceAlerts: 2
      };

      setMarketData(mockData);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Market Summary */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Market Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-green-100 text-sm">Portfolio Value</p>
            <p className="text-2xl font-bold">${summary?.totalValue}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Price Alerts</p>
            <p className="text-2xl font-bold">{summary?.priceAlerts}</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-xl p-3">
          <p className="text-sm font-medium">🚀 Best Opportunity</p>
          <p className="text-lg">{summary?.bestOpportunity}</p>
        </div>
      </div>

      {/* Crop Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', ...marketData.map(item => item.crop)].map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCrop === crop
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {crop.charAt(0).toUpperCase() + crop.slice(1)}
          </button>
        ))}
      </div>

      {/* Market Data Cards */}
      <div className="space-y-4">
        {marketData
          .filter(item => selectedCrop === 'all' || item.crop === selectedCrop)
          .map((item, index) => (
            <motion.div
              key={item.crop}
              className="bg-white rounded-2xl p-4 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-xl">
                      {item.crop === 'Maize' ? '🌽' :
                       item.crop === 'Beans' ? '🫘' :
                       item.crop === 'Tomato' ? '🍅' : '🧅'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.crop}</h3>
                    <p className="text-sm text-gray-600">{item.bestMarket}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">${item.currentPrice}/kg</p>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      item.trend === 'rising' ? 'text-green-600' :
                      item.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.trend === 'rising' ? '↗️' :
                       item.trend === 'falling' ? '↘️' : '➡️'}
                      {Math.abs(item.priceChange)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Chart Placeholder */}
              <div className="bg-gray-50 rounded-xl h-20 mb-3 flex items-center justify-center">
                <div className="flex items-end space-x-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 bg-gradient-to-t ${
                        item.trend === 'rising' ? 'from-green-400 to-green-600' :
                        item.trend === 'falling' ? 'from-red-400 to-red-600' :
                        'from-gray-400 to-gray-600'
                      } rounded-t`}
                      style={{ height: `${Math.random() * 40 + 20}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Opportunity Badge */}
              <div className={`rounded-xl p-3 ${
                item.opportunity.includes('Sell') ? 'bg-green-50 border border-green-200' :
                item.opportunity.includes('Hold') ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-sm font-medium text-gray-800">💡 {item.opportunity}</p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Market Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          className="bg-green-600 text-white py-4 px-4 rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📊 Price Alerts
        </motion.button>
        <motion.button
          className="bg-blue-600 text-white py-4 px-4 rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🏪 Find Buyers
        </motion.button>
      </div>

      {/* Market Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">💡 Market Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="text-purple-500 mr-2 mt-0.5">•</span>
            <span>Check multiple markets before selling</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2 mt-0.5">•</span>
            <span>Consider storage costs vs. price trends</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2 mt-0.5">•</span>
            <span>Join cooperatives for better prices</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2 mt-0.5">•</span>
            <span>Factor in transport costs to distant markets</span>
          </div>
        </div>
      </div>
    </div>
  );
};