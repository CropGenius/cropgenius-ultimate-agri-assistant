import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Droplet, 
  Sun, 
  CloudRain, 
  Zap, 
  Bell, 
  ArrowUpRight,
  Droplets,
  Calendar as CalendarIcon,
  BarChart2 as BarChart2Icon,
  Plus as PlusIcon,
  X as XIcon,
  MessageCircle as MessageCircleIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  Star as StarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  Shield,
  Award,
  Users,
  Flame,
  Camera,
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
  Heart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Leaf
} from 'lucide-react';

// Import our enhanced components
import { HealthOrb } from '@/components/dashboard/mobile/HealthOrb';
import FeatureCard from '@/components/dashboard/mobile/FeatureCard';
import ProSwipeBanner from '@/components/dashboard/mobile/ProSwipeBanner';
import ChatbotAvatar from '@/components/dashboard/mobile/ChatbotAvatar';

// Enhanced farming data with psychological triggers
const farmingProfile = {
  name: 'John Doe',
  level: 12,
  streak: 7,
  totalScore: 2847,
  region: 'Nairobi, Kenya',
  achievements: 18,
  farmRank: 'Gold Farmer',
  nextMilestone: 3000,
  communityRank: 156,
  totalFarmers: 12847
};

const sampleFields = [
  { 
    id: 1, 
    name: 'North Field', 
    crop: 'Maize', 
    health: 85, 
    size: '2.5', 
    unit: 'acres',
    trend: 'improving',
    lastCheck: '2 hours ago',
    issues: 0,
    yieldPrediction: 4.2
  },
  { 
    id: 2, 
    name: 'South Field', 
    crop: 'Beans', 
    health: 72, 
    size: '1.8', 
    unit: 'acres',
    trend: 'stable',
    lastCheck: '5 hours ago',
    issues: 1,
    yieldPrediction: 2.8
  },
  { 
    id: 3, 
    name: 'East Field', 
    crop: 'Tomatoes', 
    health: 64, 
    size: '0.8', 
    unit: 'acres',
    trend: 'declining',
    lastCheck: '1 day ago',
    issues: 2,
    yieldPrediction: 15.5
  },
];

const urgentTasks = [
  { 
    id: 1, 
    title: 'Fertilize Maize - Critical Window', 
    due: 'Today', 
    priority: 'critical',
    timeLeft: '4 hours',
    impact: '+25% yield potential',
    category: 'nutrition'
  },
  { 
    id: 2, 
    title: 'Pest Alert - Tomato Field', 
    due: 'Now', 
    priority: 'urgent',
    timeLeft: 'Immediate',
    impact: 'Prevent $150 loss',
    category: 'protection'
  },
  { 
    id: 3, 
    title: 'Irrigation Check', 
    due: 'Tomorrow', 
    priority: 'medium',
    timeLeft: '18 hours',
    impact: 'Maintain health',
    category: 'irrigation'
  },
];

const weatherInsights = {
  temp: 26,
  condition: 'Partly Cloudy',
  precipitation: 15,
  humidity: 65,
  wind: 12,
  forecast: 'Perfect for planting',
  farmingAdvice: 'Optimal conditions for field work',
  uvIndex: 6,
  soilTemp: 23
};

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const activeTab = location.pathname;
  
  // Calculate dynamic metrics
  const farmHealth = Math.round(
    sampleFields.reduce((sum, field) => sum + field.health, 0) / sampleFields.length
  );
  
  const totalYieldPrediction = sampleFields.reduce((sum, field) => sum + field.yieldPrediction, 0);
  const criticalIssues = sampleFields.reduce((sum, field) => sum + field.issues, 0);
  const progressToNextLevel = ((farmingProfile.totalScore % 500) / 500) * 100;

  // Network status effect
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

  // Achievement trigger simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 4000);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Chatbot message simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewMessage(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [hasNewMessage]);

  const toggleChatbot = () => {
    if (showChatbot && hasNewMessage) {
      setHasNewMessage(false);
    }
    setShowChatbot(!showChatbot);
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'from-emerald-400 via-green-500 to-teal-600';
    if (health >= 60) return 'from-yellow-400 via-amber-500 to-orange-600';
    return 'from-red-400 via-pink-500 to-rose-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'urgent': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
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

      {/* Network Status Bar */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 z-50"
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Working Offline - Data will sync when connected</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-20 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl shadow-2xl z-50 max-w-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Achievement Unlocked!</p>
                <p className="text-xs opacity-90">7-Day Streak Master</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
      {/* Revolutionary Header with Gamification */}
      <header className="relative z-10 pt-2">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600">{isOnline ? 'Live' : 'Offline'}</span>
            </div>
            <div className="text-xs text-gray-500">•</div>
            <div className="text-xs text-gray-600">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="relative p-2"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {criticalIssues > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {criticalIssues}
                </motion.div>
              )}
            </motion.button>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg"
            >
              {farmingProfile.name.charAt(0)}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Welcome Section with Psychology */}
        <div className="px-4 py-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <span>Welcome back, {farmingProfile.name.split(' ')[0]}!</span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    👋
                  </motion.div>
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-600">{farmingProfile.region}</p>
                  <div className="flex items-center space-x-1">
                    <div className="h-1 w-1 bg-gray-400 rounded-full" />
                    <span className="text-xs text-emerald-600 font-semibold">{farmingProfile.farmRank}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-lg font-bold text-orange-600">{farmingProfile.streak}</span>
                </div>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            </div>
          </motion.div>

          {/* Level Progress & Social Proof */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Level {farmingProfile.level}</p>
                  <p className="text-xs text-gray-600">{farmingProfile.totalScore} points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">#{farmingProfile.communityRank}</p>
                <p className="text-xs text-gray-500">of {farmingProfile.totalFarmers.toLocaleString()} farmers</p>
              </div>
            </div>
            
            {/* Progress Bar with Psychological Trigger */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Progress to Level {farmingProfile.level + 1}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {farmingProfile.nextMilestone - farmingProfile.totalScore} points to go
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </motion.div>
              </div>
              
              {/* Achievement Badges Preview */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">{farmingProfile.achievements} achievements</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-emerald-600 font-medium flex items-center space-x-1"
                  onClick={() => navigate('/achievements')}
                >
                  <span>View all</span>
                  <ChevronRight className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-6">
        {/* Revolutionary Farm Health Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-green-50/80 to-emerald-100/80 backdrop-blur-xl rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-200/20 to-emerald-300/30 rounded-3xl" />
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    <span>Farm Health Score</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {farmHealth >= 80 ? '🌟 Excellent performance!' : 
                     farmHealth >= 60 ? '📈 Good, with room to grow' : 
                     '⚠️ Needs attention'}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/fields')}
                  className="p-2 bg-emerald-100 rounded-xl"
                >
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </motion.button>
              </div>

              <div className="flex items-center space-x-6">
                {/* Enhanced Health Orb */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <HealthOrb score={farmHealth} size={120} />
                  </motion.div>
                  
                  {/* Floating particles around orb */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                    >
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Yield Est.</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {totalYieldPrediction.toFixed(1)}T
                      </p>
                      <p className="text-xs text-gray-500">+12% vs last season</p>
                    </motion.div>

                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-gray-700">Fields</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-1">{sampleFields.length}</p>
                      <p className="text-xs text-emerald-600">All monitored</p>
                    </motion.div>
                  </div>

                  {/* Trust Indicator */}
                  <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-3 border border-emerald-200/50">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-emerald-500 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-emerald-700">AI-Verified Data</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Last updated {sampleFields[0].lastCheck} • 99.7% accuracy
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Breakdown */}
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Field Performance</h3>
                {sampleFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/field/${field.id}`)}
                    className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${getHealthColor(field.health)}`} />
                        {field.trend === 'improving' && (
                          <TrendingUp className="h-2 w-2 text-green-500 absolute -top-1 -right-1" />
                        )}
                        {field.trend === 'declining' && (
                          <AlertTriangle className="h-2 w-2 text-orange-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{field.name}</p>
                        <p className="text-xs text-gray-600">{field.crop} • {field.size} {field.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">{field.health}%</p>
                      <p className="text-xs text-gray-500">{field.lastCheck}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Revolutionary Quick Actions with Psychological Triggers */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Smart Actions</span>
            </h2>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Real-time</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* AI Scan Action - Primary CTA */}
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/scan')}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg col-span-2"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: [-200, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">AI Crop Scan</h3>
                    <p className="text-emerald-100 text-sm">Instant disease detection</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-xs text-emerald-100">99.2% accurate</p>
                    <p className="text-xs text-white/80">Trusted by 12K+ farmers</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </motion.button>

            {/* Secondary Actions Grid */}
            {[
              {
                icon: <Sun className="h-5 w-5" />,
                title: 'Weather',
                subtitle: 'Perfect for planting',
                color: 'from-orange-400 to-yellow-500',
                action: () => navigate('/weather'),
                delay: 0.8
              },
              {
                icon: <Droplet className="h-5 w-5" />,
                title: 'Irrigation',
                subtitle: 'Check needed',
                color: 'from-blue-400 to-cyan-500',
                action: () => navigate('/irrigation'),
                delay: 0.9
              },
              {
                icon: <BarChart2Icon className="h-5 w-5" />,
                title: 'Market',
                subtitle: 'Prices rising',
                color: 'from-purple-400 to-pink-500',
                action: () => navigate('/market'),
                delay: 1.0
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: 'Protection',
                subtitle: 'All good',
                color: 'from-green-400 to-emerald-500',
                action: () => navigate('/protection'),
                delay: 1.1
              }
            ].map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: action.delay }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl text-white shadow-md`}>
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 hover:opacity-5 transition-opacity rounded-2xl`} />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Urgent Tasks with Psychological Urgency */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span>Urgent Actions</span>
              {urgentTasks.filter(t => t.priority === 'critical' || t.priority === 'urgent').length > 0 && (
                <motion.div
                  animate={{ pulse: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded-full"
                >
                  {urgentTasks.filter(t => t.priority === 'critical' || t.priority === 'urgent').length}
                </motion.div>
              )}
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tasks')}
              className="text-sm text-emerald-600 font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {urgentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg cursor-pointer"
              >
                {/* Priority Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityColor(task.priority)}`} />
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getPriorityColor(task.priority)}`}>
                          {task.category === 'nutrition' && <Leaf className="h-3 w-3 text-white" />}
                          {task.category === 'protection' && <Shield className="h-3 w-3 text-white" />}
                          {task.category === 'irrigation' && <Droplets className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'urgent' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{task.impact}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{task.timeLeft}</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium"
                        >
                          {task.priority === 'critical' ? 'Do Now' : 'Schedule'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Urgency Pulse for Critical Tasks */}
                {task.priority === 'critical' && (
                  <motion.div
                    className="absolute inset-0 border-2 border-red-400 rounded-2xl"
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Psychological Nudge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">Pro tip:</span> Complete urgent tasks to boost your farm score by up to 15%!
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Weather & Market Intelligence - Dual Power Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Weather Oracle */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/weather')}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500/90 to-indigo-600/90 backdrop-blur-xl rounded-2xl p-4 text-white cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/10" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <Sun className="h-6 w-6" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{weatherInsights.temp}°</p>
                <p className="text-sm opacity-90">{weatherInsights.condition}</p>
              </div>
              <div className="text-xs opacity-80">
                <p>💧 {weatherInsights.precipitation}% rain</p>
                <p className="text-green-200 font-medium">{weatherInsights.farmingAdvice}</p>
              </div>
            </div>
          </motion.div>

          {/* Market Pulse */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/market')}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500/90 to-green-600/90 backdrop-blur-xl rounded-2xl p-4 text-white cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/10" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-6 w-6" />
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs">Rising</span>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold">$45/bag</p>
                <p className="text-sm opacity-90">Maize prices</p>
              </div>
              <p className="text-xs text-green-200 font-medium">+12% this week</p>
            </div>
          </motion.div>
        </motion.section>

        {/* AI Insights - Trust Builder */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>AI Insights</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>Processing</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, title: 'Pest Risk', value: 'Low', color: 'emerald', desc: '3 days protected' },
              { icon: Droplets, title: 'Irrigation', value: 'Perfect', color: 'blue', desc: 'Optimal moisture' },
              { icon: Target, title: 'Yield Boost', value: '+15%', color: 'purple', desc: 'vs last season' },
              { icon: Users, title: 'Community', value: 'Top 10%', color: 'orange', desc: 'in your region' }
            ].map((insight, i) => (
              <motion.div
                key={insight.title}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.7 + i * 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-white/30"
              >
                <div className={`p-2 bg-${insight.color}-100 rounded-lg mb-2 w-fit`}>
                  <insight.icon className={`h-4 w-4 text-${insight.color}-600`} />
                </div>
                <p className="font-bold text-gray-900">{insight.value}</p>
                <p className="text-xs text-gray-600">{insight.title}</p>
                <p className="text-xs text-gray-500 mt-1">{insight.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Enhanced ChatBot - Floating Genius */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2, type: "spring" }}
        className="fixed bottom-24 right-4 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChatbot}
          className="relative p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-2xl"
        >
          <MessageCircleIcon className="h-6 w-6 text-white" />
          {hasNewMessage && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-bold">!</span>
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-ping opacity-20" />
        </motion.button>
      </motion.div>

      {/* Smart ChatBot Panel */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-16 right-4 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 border border-white/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-4 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">CropGenius AI</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs opacity-90">Always here to help</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowChatbot(false)}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <XIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 text-center">What can I help you with?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🔬', text: 'Disease scan', action: () => navigate('/scan') },
                  { icon: '🌦️', text: 'Weather tips', action: () => navigate('/weather') },
                  { icon: '💰', text: 'Market prices', action: () => navigate('/market') },
                  { icon: '📈', text: 'Yield tips', action: () => navigate('/insights') }
                ].map((item, i) => (
                  <motion.button
                    key={item.text}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.action}
                    className="p-3 bg-gray-50 rounded-xl text-center space-y-1"
                  >
                    <div className="text-lg">{item.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{item.text}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHomePage;
