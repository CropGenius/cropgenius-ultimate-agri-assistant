import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  Crown,
  Zap,
  Heart,
  Shield,
  Sparkles,
  ChevronRight,
  Medal,
  Gift
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: string;
}

interface GamificationSystemProps {
  level: number;
  totalScore: number;
  streak: number;
  communityRank: number;
  totalFarmers: number;
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  level,
  totalScore,
  streak,
  communityRank,
  totalFarmers,
  achievements,
  onAchievementClick
}) => {
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'progress' | 'achievements' | 'leaderboard'>('progress');

  const nextLevelScore = (level + 1) * 500;
  const currentLevelProgress = ((totalScore % 500) / 500) * 100;
  const pointsToNextLevel = nextLevelScore - totalScore;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStreakReward = (streak: number) => {
    if (streak >= 30) return { emoji: '🔥', title: 'Fire Master', bonus: '+50% XP' };
    if (streak >= 14) return { emoji: '⚡', title: 'Lightning Farmer', bonus: '+25% XP' };
    if (streak >= 7) return { emoji: '🌟', title: 'Consistent Grower', bonus: '+15% XP' };
    return { emoji: '🌱', title: 'Getting Started', bonus: '+5% XP' };
  };

  const streakReward = getStreakReward(streak);

  useEffect(() => {
    if (streak > 0 && streak % 7 === 0) {
      setShowStreakCelebration(true);
      setTimeout(() => setShowStreakCelebration(false), 4000);
    }
  }, [streak]);

  const recentAchievements = achievements.filter(a => a.unlocked).slice(-3);
  const nextAchievements = achievements.filter(a => !a.unlocked && a.progress > 0).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Streak Celebration */}
      <AnimatePresence>
        {showStreakCelebration && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-3xl shadow-2xl text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-4"
              >
                🔥
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">{streak} Day Streak!</h2>
              <p className="text-orange-100">You're on fire! Keep it up!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex bg-white/60 backdrop-blur-md rounded-2xl p-1 border border-white/30">
        {[
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'leaderboard', label: 'Ranking', icon: Trophy }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Progress Tab */}
      {selectedTab === 'progress' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Level Progress */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Level {level}</h3>
                  <p className="text-sm text-gray-600">{totalScore.toLocaleString()} total points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{pointsToNextLevel} to go</p>
                <p className="text-xs text-gray-500">Level {level + 1}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress to next level</span>
                <span className="font-semibold text-emerald-600">{currentLevelProgress.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevelProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Streak System */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl"
                >
                  <Flame className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <span>{streak} Day Streak</span>
                    <span className="text-2xl">{streakReward.emoji}</span>
                  </h3>
                  <p className="text-sm text-orange-700">{streakReward.title} • {streakReward.bonus}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    i < (streak % 7) || streak >= 7
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < (streak % 7) || streak >= 7 ? '🔥' : '○'}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Recent Achievements</span>
              </h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAchievementClick?.(achievement)}
                    className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/30 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Reward: {achievement.reward}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Next Achievements */}
          {nextAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Almost There</span>
              </h3>
              <div className="space-y-3">
                {nextAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-60 rounded-xl`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Your Rank */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your Rank</h3>
                  <p className="text-sm text-purple-700">#{communityRank} of {totalFarmers.toLocaleString()} farmers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">#{communityRank}</p>
                <p className="text-xs text-gray-500">Top {((communityRank / totalFarmers) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Rank Benefits */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Gift className="h-5 w-5 text-emerald-500" />
              <span>Rank Benefits</span>
            </h3>
            <div className="space-y-3">
              {[
                { rank: 'Top 1%', benefit: 'Exclusive AI insights + Premium support', icon: '👑' },
                { rank: 'Top 5%', benefit: 'Advanced weather predictions', icon: '⚡' },
                { rank: 'Top 10%', benefit: 'Priority market alerts', icon: '📈' },
                { rank: 'Top 25%', benefit: 'Community recognition badge', icon: '🏆' }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-xl ${
                    ((communityRank / totalFarmers) * 100) <= parseInt(item.rank.replace('Top ', '').replace('%', ''))
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.rank}</p>
                    <p className="text-sm text-gray-600">{item.benefit}</p>
                  </div>
                  {((communityRank / totalFarmers) * 100) <= parseInt(item.rank.replace('Top ', '').replace('%', '')) && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GamificationSystem;