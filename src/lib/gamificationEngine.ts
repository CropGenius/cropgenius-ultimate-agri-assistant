/**
 * 🏆 GAMIFICATION ENGINE - Trillion-Dollar Behavioral Lock-in
 * Achievement system that creates dopamine-driven farming habits
 */

import { supabase } from '@/lib/supabaseClient';
import { useHapticFeedback } from './hapticFeedback';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  category: 'scanning' | 'weather' | 'market' | 'community' | 'streak' | 'harvest';
  requirements: {
    type: string;
    count: number;
    timeframe?: number; // days
  };
  unlockedAt?: number;
  progress?: number;
}

export interface UserStats {
  userId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  dailyActions: number;
  weeklyRank: number;
  badges: string[];
}

class GamificationEngine {
  private static instance: GamificationEngine;
  private userStats: Map<string, UserStats> = new Map();
  
  // Achievement definitions
  private achievements: Achievement[] = [
    {
      id: 'first_scan',
      title: 'First Scan',
      description: 'Scanned your first crop with AI',
      icon: '📸',
      rarity: 'common',
      points: 10,
      category: 'scanning',
      requirements: { type: 'disease_scan', count: 1 }
    },
    {
      id: 'scan_master',
      title: 'Scan Master',
      description: 'Completed 50 crop scans',
      icon: '🔬',
      rarity: 'epic',
      points: 100,
      category: 'scanning',
      requirements: { type: 'disease_scan', count: 50 }
    },
    {
      id: 'weather_watcher',
      title: 'Weather Watcher',
      description: 'Checked weather 7 days in a row',
      icon: '🌦️',
      rarity: 'rare',
      points: 50,
      category: 'weather',
      requirements: { type: 'weather_check', count: 7, timeframe: 7 }
    },
    {
      id: 'market_maven',
      title: 'Market Maven',
      description: 'Checked market prices 20 times',
      icon: '💰',
      rarity: 'rare',
      points: 75,
      category: 'market',
      requirements: { type: 'market_check', count: 20 }
    },
    {
      id: 'community_helper',
      title: 'Community Helper',
      description: 'Helped 10 fellow farmers',
      icon: '🤝',
      rarity: 'epic',
      points: 150,
      category: 'community',
      requirements: { type: 'help_farmer', count: 10 }
    },
    {
      id: 'voice_commander',
      title: 'Voice Commander',
      description: 'Used voice commands 25 times',
      icon: '🗣️',
      rarity: 'rare',
      points: 60,
      category: 'scanning',
      requirements: { type: 'voice_command', count: 25 }
    },
    {
      id: 'streak_legend',
      title: 'Streak Legend',
      description: 'Maintained 30-day activity streak',
      icon: '🔥',
      rarity: 'legendary',
      points: 500,
      category: 'streak',
      requirements: { type: 'daily_login', count: 30, timeframe: 30 }
    },
    {
      id: 'harvest_hero',
      title: 'Harvest Hero',
      description: 'Logged 5 successful harvests',
      icon: '🌾',
      rarity: 'epic',
      points: 200,
      category: 'harvest',
      requirements: { type: 'harvest_logged', count: 5 }
    }
  ];

  static getInstance(): GamificationEngine {
    if (!GamificationEngine.instance) {
      GamificationEngine.instance = new GamificationEngine();
    }
    return GamificationEngine.instance;
  }

  // Track user action and check for achievements
  async trackAction(userId: string, actionType: string, context: any = {}) {
    const stats = await this.getUserStats(userId);
    
    // Update daily actions
    stats.dailyActions += 1;
    
    // Check for new achievements
    const newAchievements = await this.checkAchievements(userId, actionType, stats);
    
    // Update streak if daily login
    if (actionType === 'daily_login') {
      await this.updateStreak(userId, stats);
    }
    
    // Calculate level and points
    await this.updateLevelAndPoints(userId, stats, newAchievements);
    
    // Persist to database
    await this.persistUserStats(userId, stats);
    
    return {
      newAchievements,
      levelUp: this.checkLevelUp(stats),
      currentLevel: stats.level,
      totalPoints: stats.totalPoints
    };
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    if (this.userStats.has(userId)) {
      return this.userStats.get(userId)!;
    }

    // Load from database
    const { data } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    const stats: UserStats = data || {
      userId,
      level: 1,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      dailyActions: 0,
      weeklyRank: 0,
      badges: []
    };

    this.userStats.set(userId, stats);
    return stats;
  }

  // Check for new achievements
  private async checkAchievements(userId: string, actionType: string, stats: UserStats): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    
    // Get user's action history from database
    const { data: actionHistory } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    for (const achievement of this.achievements) {
      // Skip if already unlocked
      if (stats.achievements.some(a => a.id === achievement.id)) continue;

      const relevantActions = actionHistory?.filter(action => 
        action.action_type === achievement.requirements.type
      ) || [];

      let qualifies = false;

      if (achievement.requirements.timeframe) {
        // Time-based requirement
        const timeframeStart = Date.now() - (achievement.requirements.timeframe * 24 * 60 * 60 * 1000);
        const recentActions = relevantActions.filter(action => 
          new Date(action.created_at).getTime() > timeframeStart
        );
        qualifies = recentActions.length >= achievement.requirements.count;
      } else {
        // Total count requirement
        qualifies = relevantActions.length >= achievement.requirements.count;
      }

      if (qualifies) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: Date.now(),
          progress: 100
        };
        
        stats.achievements.push(unlockedAchievement);
        newAchievements.push(unlockedAchievement);
      }
    }

    return newAchievements;
  }

  // Update user streak
  private async updateStreak(userId: string, stats: UserStats) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const { data: lastLogin } = await supabase
      .from('user_actions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('action_type', 'daily_login')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin.created_at).toDateString();
      
      if (lastLoginDate === yesterday) {
        // Continue streak
        stats.currentStreak += 1;
      } else if (lastLoginDate !== today) {
        // Reset streak
        stats.currentStreak = 1;
      }
    } else {
      // First login
      stats.currentStreak = 1;
    }

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  // Update level and points
  private async updateLevelAndPoints(userId: string, stats: UserStats, newAchievements: Achievement[]) {
    // Add points from new achievements
    const newPoints = newAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    stats.totalPoints += newPoints;

    // Calculate level (every 100 points = 1 level)
    const newLevel = Math.floor(stats.totalPoints / 100) + 1;
    stats.level = newLevel;
  }

  // Check if user leveled up
  private checkLevelUp(stats: UserStats): boolean {
    const previousLevel = Math.floor((stats.totalPoints - 10) / 100) + 1; // Assuming 10 points added
    return stats.level > previousLevel;
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    name: string;
    level: number;
    totalPoints: number;
    achievements: number;
    rank: number;
  }>> {
    const { data } = await supabase
      .from('user_gamification')
      .select(`
        user_id,
        level,
        total_points,
        achievements,
        profiles!inner(full_name)
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    return data?.map((user, index) => ({
      userId: user.user_id,
      name: user.profiles.full_name,
      level: user.level,
      totalPoints: user.total_points,
      achievements: user.achievements?.length || 0,
      rank: index + 1
    })) || [];
  }

  // Get achievement progress
  getAchievementProgress(userId: string, achievementId: string): number {
    // This would calculate current progress towards an achievement
    // Implementation depends on specific achievement requirements
    return 0;
  }

  // Generate shareable achievement card
  generateShareableCard(achievement: Achievement): {
    title: string;
    description: string;
    image: string;
    shareText: string;
  } {
    return {
      title: `🏆 ${achievement.title}`,
      description: achievement.description,
      image: achievement.icon,
      shareText: `Just unlocked "${achievement.title}" on CropGenius! 🌾 ${achievement.description} #SmartFarming #CropGenius`
    };
  }

  // Persist user stats to database
  private async persistUserStats(userId: string, stats: UserStats) {
    await supabase
      .from('user_gamification')
      .upsert({
        user_id: userId,
        level: stats.level,
        total_points: stats.totalPoints,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        achievements: stats.achievements,
        daily_actions: stats.dailyActions,
        weekly_rank: stats.weeklyRank,
        badges: stats.badges,
        updated_at: new Date().toISOString()
      });
  }
}

export const gamificationEngine = GamificationEngine.getInstance();

// React hook for gamification
export const useGamification = () => {
  const { triggerSuccess, triggerMedium } = useHapticFeedback();

  const trackAction = async (actionType: string, context?: any) => {
    // Get current user (would integrate with auth)
    const userId = 'current-user-id'; // Placeholder
    
    const result = await gamificationEngine.trackAction(userId, actionType, context);
    
    // Trigger haptic feedback for achievements
    if (result.newAchievements.length > 0) {
      triggerSuccess();
    } else if (result.levelUp) {
      triggerMedium();
    }
    
    return result;
  };

  const getUserStats = async () => {
    const userId = 'current-user-id'; // Placeholder
    return await gamificationEngine.getUserStats(userId);
  };

  const getLeaderboard = async (limit?: number) => {
    return await gamificationEngine.getLeaderboard(limit);
  };

  return {
    trackAction,
    getUserStats,
    getLeaderboard
  };
};