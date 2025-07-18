import { supabase } from '@/integrations/supabase/client';
import { useHapticFeedback } from './hapticFeedback';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface UserStats {
  userId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  achievements: Achievement[];
}

class GamificationEngine {
  private static instance: GamificationEngine;
  
  static getInstance(): GamificationEngine {
    if (!GamificationEngine.instance) {
      GamificationEngine.instance = new GamificationEngine();
    }
    return GamificationEngine.instance;
  }

  async trackAction(userId: string, actionType: string): Promise<{
    newAchievements: Achievement[];
    levelUp: boolean;
    currentLevel: number;
    totalPoints: number;
  }> {
    return {
      newAchievements: [],
      levelUp: false,
      currentLevel: 1,
      totalPoints: 0
    };
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return {
      userId,
      level: 1,
      totalPoints: 0,
      currentStreak: 0,
      achievements: []
    };
  }

  async getLeaderboard(): Promise<any[]> {
    return [];
  }
}

export const gamificationEngine = GamificationEngine.getInstance();

export const useGamification = () => {
  const { triggerSuccess } = useHapticFeedback();

  const trackAction = async (actionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { newAchievements: [], levelUp: false, currentLevel: 1, totalPoints: 0 };
    
    return await gamificationEngine.trackAction(user.id, actionType);
  };

  const getUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { userId: '', level: 1, totalPoints: 0, currentStreak: 0, achievements: [] };
    
    return await gamificationEngine.getUserStats(user.id);
  };

  return { trackAction, getUserStats, getLeaderboard: gamificationEngine.getLeaderboard };
};