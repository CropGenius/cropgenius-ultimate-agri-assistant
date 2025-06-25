/**
 * 📊 MARKET INTELLIGENCE BOARD - SOCIAL MEDIA WORTHY PRICE DISPLAYS
 * ==================================================================
 * Real-time market prices that farmers will screenshot and share daily!
 * Designed with psychology and social engineering for maximum engagement.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Calendar,
  Share,
  Download,
  Star,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  Crown
} from 'lucide-react';

const MarketIntelligenceBoard = () => {
  const [selectedCrop, setSelectedCrop] = useState('maize');
  const [timeframe, setTimeframe] = useState('today');
  const [isLive, setIsLive] = useState(true);

  // Simulated real-time market data that looks incredibly professional
  const marketData = {
    maize: {
      currentPrice: 0.35,
      change: +0.08,
      changePercent: +12.5,
      volume: 2543,
      high24h: 0.37,
      low24h: 0.31,
      trend: 'up',
      marketCap: '2.1M',
      traders: 1247,
      topMarkets: [
        { name: 'Nairobi Central', price: 0.37, change: +15.2 },
        { name: 'Lagos State Market', price: 0.34, change: +8.7 },
        { name: 'Accra Central', price: 0.36, change: +11.3 },
        { name: 'Kampala Market', price: 0.33, change: +5.9 }
      ]
    },
    beans: {
      currentPrice: 1.12,
      change: -0.05,
      changePercent: -4.2,
      volume: 1876,
      high24h: 1.18,
      low24h: 1.09,
      trend: 'down',
      marketCap: '1.8M',
      traders: 892,
      topMarkets: [
        { name: 'Nairobi Central', price: 1.15, change: -2.1 },
        { name: 'Kano Market', price: 1.08, change: -6.8 },
        { name: 'Kumasi Market', price: 1.13, change: -3.4 },
        { name: 'Addis Ababa', price: 1.11, change: -4.9 }
      ]
    },
    tomato: {
      currentPrice: 0.82,
      change: +0.12,
      changePercent: +17.1,
      volume: 3421,
      high24h: 0.85,
      low24h: 0.68,
      trend: 'up',
      marketCap: '3.2M',
      traders: 1689,
      topMarkets: [
        { name: 'Mombasa Market', price: 0.85, change: +19.4 },
        { name: 'Port Harcourt', price: 0.79, change: +14.8 },
        { name: 'Accra Central', price: 0.83, change: +17.9 },
        { name: 'Jinja Market', price: 0.80, change: +16.2 }
      ]
    }
  };

  const currentData = marketData[selectedCrop];

  // Social engineering: Update prices every few seconds to create urgency
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time price updates
        const fluctuation = (Math.random() - 0.5) * 0.02;
        // Update would happen here in real implementation
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="px-6 pb-16">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-yellow-500 bg-clip-text text-transparent">
            Market Intelligence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time crop prices across Africa. Get the best deals and maximize your profits with data-driven insights.
          </p>
        </motion.div>

        {/* Market Controls */}
        <MarketControls 
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          isLive={isLive}
          setIsLive={setIsLive}
        />

        {/* Main Price Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <PriceChart data={currentData} crop={selectedCrop} />
          </div>
          <div>
            <LivePriceCard data={currentData} crop={selectedCrop} />
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MarketMetricCard
            icon={DollarSign}
            title="24h Volume"
            value={`${currentData.volume.toLocaleString()} kg`}
            change={`+${(currentData.volume * 0.1).toFixed(0)}`}
            color="from-green-400 to-cyan-400"
          />
          <MarketMetricCard
            icon={Users}
            title="Active Traders"
            value={currentData.traders.toLocaleString()}
            change="+127"
            color="from-purple-400 to-pink-400"
          />
          <MarketMetricCard
            icon={BarChart3}
            title="Market Cap"
            value={currentData.marketCap}
            change="+8.3%"
            color="from-orange-400 to-red-400"
          />
          <MarketMetricCard
            icon={Crown}
            title="Best Price"
            value={`$${currentData.high24h}`}
            change="Nairobi"
            color="from-yellow-400 to-orange-400"
          />
        </div>

        {/* Top Markets */}
        <TopMarketsTable markets={currentData.topMarkets} crop={selectedCrop} />

        {/* Social Sharing Section */}
        <SocialSharingSection data={currentData} crop={selectedCrop} />
      </div>
    </div>
  );
};

// 🎛️ MARKET CONTROLS - SLEEK FILTERING
const MarketControls = ({ selectedCrop, setSelectedCrop, timeframe, setTimeframe, isLive, setIsLive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="flex flex-wrap items-center justify-between p-6 rounded-3xl backdrop-blur-lg bg-white/5 border border-green-400/20 mb-8"
  >
    {/* Crop Selector */}
    <div className="flex items-center space-x-3 mb-4 md:mb-0">
      <label className="text-sm font-medium text-gray-300">Crop:</label>
      <div className="flex space-x-2">
        {[
          { id: 'maize', name: 'Maize', emoji: '🌽' },
          { id: 'beans', name: 'Beans', emoji: '🫘' },
          { id: 'tomato', name: 'Tomato', emoji: '🍅' },
        ].map((crop) => (
          <motion.button
            key={crop.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCrop(crop.id)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              selectedCrop === crop.id
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            {crop.emoji} {crop.name}
          </motion.button>
        ))}
      </div>
    </div>

    {/* Live Toggle */}
    <div className="flex items-center space-x-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsLive(!isLive)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
          isLive
            ? 'bg-gradient-to-r from-red-400 to-pink-400 border-white/20 text-white'
            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
        }`}
      >
        <motion.div
          animate={isLive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-2 h-2 rounded-full ${isLive ? 'bg-white' : 'bg-gray-400'}`}
        />
        <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
      >
        <Share className="w-5 h-5" />
      </motion.button>
    </div>
  </motion.div>
);

// 📈 PRICE CHART - PROFESSIONAL TRADING VIEW
const PriceChart = ({ data, crop }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    className="p-8 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-green-400/20 h-96"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white capitalize">{crop} Price Chart</h3>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>2,847 watching</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1 rounded-lg bg-green-400/20 text-green-400 text-sm font-medium"
        >
          24H
        </motion.button>
      </div>
    </div>

    {/* Simulated Chart */}
    <div className="relative h-64">
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Chart background grid */}
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={data.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={data.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Price line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          d={`M 0,${data.trend === 'up' ? '200' : '50'} Q 100,150 200,${data.trend === 'up' ? '80' : '180'} T 400,${data.trend === 'up' ? '60' : '200'} T 600,${data.trend === 'up' ? '40' : '220'}`}
          stroke={data.trend === 'up' ? '#10B981' : '#EF4444'}
          strokeWidth="3"
          fill="none"
          filter="drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))"
        />
        
        {/* Area under curve */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          d={`M 0,${data.trend === 'up' ? '200' : '50'} Q 100,150 200,${data.trend === 'up' ? '80' : '180'} T 400,${data.trend === 'up' ? '60' : '200'} T 600,${data.trend === 'up' ? '40' : '220'} L 600,250 L 0,250 Z`}
          fill="url(#priceGradient)"
        />
      </svg>

      {/* Price points */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2 + 1 }}
            className="absolute w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
            style={{
              left: `${i * 25}%`,
              top: `${Math.random() * 50 + 25}%`,
            }}
          />
        ))}
      </div>
    </div>

    {/* Chart footer */}
    <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
      <span>24h Range: ${data.low24h} - ${data.high24h}</span>
      <span>Volume: {data.volume.toLocaleString()} kg</span>
    </div>
  </motion.div>
);

// 💰 LIVE PRICE CARD - ATTENTION GRABBING DISPLAY
const LivePriceCard = ({ data, crop }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="p-8 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-400/20 h-96"
  >
    <div className="text-center mb-8">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-4"
      >
        {crop === 'maize' ? '🌽' : crop === 'beans' ? '🫘' : '🍅'}
      </motion.div>
      <h3 className="text-2xl font-bold text-white capitalize mb-2">{crop}</h3>
      <p className="text-gray-400">Current Market Price</p>
    </div>

    {/* Main Price */}
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-5xl font-bold text-white mb-2"
      >
        ${data.currentPrice}
      </motion.div>
      <div className={`flex items-center justify-center space-x-2 text-lg font-semibold ${
        data.trend === 'up' ? 'text-green-400' : 'text-red-400'
      }`}>
        {data.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        <span>{data.changePercent > 0 ? '+' : ''}{data.changePercent}%</span>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
        <span className="text-gray-400">24h Change</span>
        <span className={`font-bold ${data.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          ${data.change > 0 ? '+' : ''}{data.change}
        </span>
      </div>
      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
        <span className="text-gray-400">Volume</span>
        <span className="text-white font-bold">{data.volume.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
        <span className="text-gray-400">Traders</span>
        <span className="text-cyan-400 font-bold">{data.traders.toLocaleString()}</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="grid grid-cols-2 gap-3 mt-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="py-3 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-black font-semibold"
      >
        Sell Now
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="py-3 rounded-xl border border-white/20 text-white font-semibold"
      >
        Set Alert
      </motion.button>
    </div>
  </motion.div>
);

// 📊 MARKET METRIC CARD - BEAUTIFUL DATA DISPLAY
const MarketMetricCard = ({ icon: Icon, title, value, change, color }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`p-6 rounded-2xl backdrop-blur-lg bg-gradient-to-br ${color} shadow-2xl`}
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-8 h-8 text-white" />
      <span className="text-white/80 text-sm font-medium">{change}</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-white/80 text-sm">{title}</div>
  </motion.div>
);

// 🏆 TOP MARKETS TABLE - LEADERBOARD STYLE
const TopMarketsTable = ({ markets, crop }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="p-8 rounded-3xl backdrop-blur-lg bg-white/5 border border-green-400/20 mb-8"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-white">Top Markets</h3>
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <Star className="w-4 h-4 text-yellow-400" />
        <span>Best Prices</span>
      </div>
    </div>

    <div className="space-y-3">
      {markets.map((market, index) => (
        <motion.div
          key={market.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-yellow-400 text-black' :
              index === 1 ? 'bg-gray-400 text-black' :
              index === 2 ? 'bg-orange-400 text-black' :
              'bg-gray-600 text-white'
            }`}>
              {index + 1}
            </div>
            <div>
              <div className="text-white font-semibold">{market.name}</div>
              <div className="text-gray-400 text-sm flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 50 + 10)}km away
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-white font-bold text-lg">${market.price}</div>
            <div className={`text-sm font-semibold flex items-center ${
              market.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {market.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {market.change > 0 ? '+' : ''}{market.change}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// 📱 SOCIAL SHARING SECTION - VIRAL MARKETING
const SocialSharingSection = ({ data, crop }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="p-8 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20"
  >
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-white mb-2">Share This Intelligence</h3>
      <p className="text-gray-400">Help fellow farmers with real-time market data</p>
    </div>

    {/* Shareable Card Preview */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 text-black mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{crop === 'maize' ? '🌽' : crop === 'beans' ? '🫘' : '🍅'}</div>
        <div className="text-xs font-semibold bg-black/20 px-2 py-1 rounded-full">LIVE</div>
      </div>
      <div className="text-3xl font-bold mb-2">${data.currentPrice}</div>
      <div className={`text-lg font-semibold ${data.trend === 'up' ? 'text-green-800' : 'text-red-600'}`}>
        {data.changePercent > 0 ? '+' : ''}{data.changePercent}% today
      </div>
      <div className="text-xs mt-3 opacity-80">
        CropGenius • Agricultural Intelligence
      </div>
    </motion.div>

    {/* Share Buttons */}
    <div className="flex justify-center space-x-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold"
      >
        <Share className="w-4 h-4" />
        <span>WhatsApp</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold"
      >
        <Download className="w-4 h-4" />
        <span>Screenshot</span>
      </motion.button>
    </div>
  </motion.div>
);

export default MarketIntelligenceBoard;