import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  Zap,
  Heart,
  Star,
  Trophy,
  Gift,
  Flame,
  Shield,
  CheckCircle2,
  ArrowRight,
  Timer,
  DollarSign,
  Sparkles
} from 'lucide-react';

interface UrgencyTrigger {
  type: 'time_sensitive' | 'scarcity' | 'social_proof' | 'loss_aversion';
  title: string;
  message: string;
  action: string;
  timeLeft?: string;
  icon: React.ReactNode;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProgressFraming {
  current: number;
  total: number;
  label: string;
  reward: string;
  encouragement: string;
}

interface SocialProof {
  type: 'recent_activity' | 'success_story' | 'community_milestone';
  message: string;
  icon: React.ReactNode;
  timestamp?: string;
}

interface PsychologyTriggersProps {
  farmHealth: number;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
  communityRank: number;
  showUrgency?: boolean;
  showProgress?: boolean;
  showSocialProof?: boolean;
}

export const PsychologyTriggers: React.FC<PsychologyTriggersProps> = ({
  farmHealth,
  tasksCompleted,
  totalTasks,
  streak,
  communityRank,
  showUrgency = true,
  showProgress = true,
  showSocialProof = true
}) => {
  const [currentUrgency, setCurrentUrgency] = useState(0);
  const [currentSocialProof, setCurrentSocialProof] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);

  const urgencyTriggers: UrgencyTrigger[] = [
    {
      type: 'time_sensitive',
      title: 'Critical Window Closing',
      message: 'Perfect planting conditions end in 3 days',
      action: 'Check Weather Now',
      timeLeft: '3 days',
      icon: <Clock className="h-4 w-4" />,
      color: 'from-red-500 to-orange-500',
      priority: 'high'
    },
    {
      type: 'loss_aversion',
      title: 'Potential Yield Loss',
      message: 'Delayed fertilization could reduce harvest by 25%',
      action: 'Schedule Now',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'from-orange-500 to-yellow-500',
      priority: 'high'
    },
    {
      type: 'scarcity',
      title: 'Limited Time Offer',
      message: 'Premium AI insights available for 48 hours',
      action: 'Upgrade Now',
      timeLeft: '2 days',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'from-purple-500 to-pink-500',
      priority: 'medium'
    },
    {
      type: 'social_proof',
      title: 'Farmers Near You Acting',
      message: '127 farmers in your area upgraded this week',
      action: 'Join Them',
      icon: <Users className="h-4 w-4" />,
      color: 'from-blue-500 to-cyan-500',
      priority: 'medium'
    }
  ];

  const socialProofItems: SocialProof[] = [
    {
      type: 'recent_activity',
      message: 'James from Nakuru just increased his yield by 35%',
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      timestamp: '2 min ago'
    },
    {
      type: 'success_story',
      message: 'Sarah saved $500 using our pest detection AI',
      icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
      timestamp: '5 min ago'
    },
    {
      type: 'community_milestone',
      message: '10,000+ farmers achieved their yield goals this season',
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      timestamp: '1 hour ago'
    }
  ];

  const progressFraming: ProgressFraming = {
    current: tasksCompleted,
    total: totalTasks,
    label: 'Farm Optimization',
    reward: '+15% yield potential',
    encouragement: "You're so close to maximizing your farm's potential!"
  };

  // Auto-rotate urgency triggers
  useEffect(() => {
    if (showUrgency) {
      const interval = setInterval(() => {
        setCurrentUrgency(prev => (prev + 1) % urgencyTriggers.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [showUrgency, urgencyTriggers.length]);

  // Auto-rotate social proof
  useEffect(() => {
    if (showSocialProof) {
      const interval = setInterval(() => {
        setCurrentSocialProof(prev => (prev + 1) % socialProofItems.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [showSocialProof, socialProofItems.length]);

  // Trigger motivation based on progress
  useEffect(() => {
    const progressPercentage = (tasksCompleted / totalTasks) * 100;
    if (progressPercentage >= 80 && progressPercentage < 100) {
      setShowMotivation(true);
      const timer = setTimeout(() => setShowMotivation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [tasksCompleted, totalTasks]);

  const getMotivationalMessage = () => {
    const progressPercentage = (tasksCompleted / totalTasks) * 100;
    
    if (progressPercentage >= 90) {
      return {
        title: "Almost Perfect! 🎯",
        message: "Just one more task to achieve farm excellence!",
        color: "from-emerald-500 to-green-600"
      };
    } else if (progressPercentage >= 80) {
      return {
        title: "You're Crushing It! 🔥",
        message: "80% complete - you're in the top 10% of farmers!",
        color: "from-orange-500 to-red-500"
      };
    } else if (progressPercentage >= 60) {
      return {
        title: "Great Progress! 📈",
        message: "Keep going - you're ahead of most farmers!",
        color: "from-blue-500 to-purple-500"
      };
    } else {
      return {
        title: "Every Step Counts! 🌱",
        message: "Small actions lead to big harvests!",
        color: "from-green-500 to-emerald-500"
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="space-y-4">
      {/* Urgency Triggers */}
      {showUrgency && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUrgency}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-r ${urgencyTriggers[currentUrgency].color} text-white rounded-2xl p-4 shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {urgencyTriggers[currentUrgency].icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{urgencyTriggers[currentUrgency].title}</h4>
                  <p className="text-xs opacity-90 mb-3">{urgencyTriggers[currentUrgency].message}</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2"
                  >
                    <span>{urgencyTriggers[currentUrgency].action}</span>
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
              {urgencyTriggers[currentUrgency].timeLeft && (
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg px-2 py-1">
                    <Timer className="h-3 w-3 mx-auto mb-1" />
                    <p className="text-xs font-bold">{urgencyTriggers[currentUrgency].timeLeft}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Progress Framing */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">{progressFraming.label}</h4>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{progressFraming.current}/{progressFraming.total}</p>
              <p className="text-xs text-gray-500">tasks</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-blue-600">
                {Math.round((progressFraming.current / progressFraming.total) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progressFraming.current / progressFraming.total) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </motion.div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <Gift className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Reward</span>
            </div>
            <p className="text-xs text-blue-700">{progressFraming.reward}</p>
          </div>

          <p className="text-xs text-gray-600 mt-3 text-center font-medium">
            {progressFraming.encouragement}
          </p>
        </motion.div>
      )}

      {/* Motivational Pop-up */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`bg-gradient-to-r ${motivationalMessage.color} text-white p-6 rounded-3xl shadow-2xl text-center max-w-xs`}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-4xl mb-3"
              >
                🎉
              </motion.div>
              <h3 className="text-lg font-bold mb-2">{motivationalMessage.title}</h3>
              <p className="text-sm opacity-90">{motivationalMessage.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Proof Stream */}
      {showSocialProof && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/30"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSocialProof}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-1.5 bg-gray-100 rounded-lg">
                {socialProofItems[currentSocialProof].icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{socialProofItems[currentSocialProof].message}</p>
                {socialProofItems[currentSocialProof].timestamp && (
                  <p className="text-xs text-gray-500">{socialProofItems[currentSocialProof].timestamp}</p>
                )}
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Streak Maintenance (Loss Aversion) */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>Don't Break Your Streak!</span>
                <span className="text-orange-600">🔥</span>
              </h4>
              <p className="text-sm text-gray-600">
                You've maintained {streak} days of consistent farming. 
                <span className="font-medium text-orange-700"> Keep it going!</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{streak}</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievement Proximity (Zeigarnik Effect) */}
      {farmHealth >= 75 && farmHealth < 85 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Almost Excellent! ⭐</h4>
              <p className="text-sm text-gray-600">
                Just {85 - farmHealth} points away from achieving 
                <span className="font-medium text-purple-700"> "Farm Excellence" status</span>
              </p>
              <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                  style={{ width: `${(farmHealth / 85) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PsychologyTriggers;