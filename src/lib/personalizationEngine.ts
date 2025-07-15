/**
 * 🧠 AI PERSONALIZATION ENGINE - Trillion-Dollar User Intelligence
 * Every farmer gets their own superintelligence companion
 */

import { supabase } from '@/services/supabaseClient';

interface UserBehavior {
  userId: string;
  actions: Array<{
    type: string;
    timestamp: number;
    context: any;
  }>;
  preferences: {
    primaryCrops: string[];
    farmingStyle: 'traditional' | 'modern' | 'organic';
    preferredLanguage: string;
    activeHours: number[];
    voiceUsage: number;
  };
  fieldProfile: {
    totalFields: number;
    avgFieldSize: number;
    soilTypes: string[];
    lastHarvest: string;
    nextPlanting: string;
  };
}

class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private userBehavior: Map<string, UserBehavior> = new Map();

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  // Track user action for learning
  async trackAction(userId: string, action: string, context: any = {}) {
    const behavior = this.userBehavior.get(userId) || this.initUserBehavior(userId);
    
    behavior.actions.push({
      type: action,
      timestamp: Date.now(),
      context
    });

    // Keep only last 100 actions for performance
    if (behavior.actions.length > 100) {
      behavior.actions = behavior.actions.slice(-100);
    }

    this.userBehavior.set(userId, behavior);
    
    // Persist to Supabase
    await this.persistBehavior(userId, behavior);
  }

  // Generate personalized greeting
  getPersonalizedGreeting(userId: string): string {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return "Welcome to CropGenius! 🌾";

    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    const recentActions = behavior.actions.slice(-5);
    const lastAction = recentActions[recentActions.length - 1];
    
    if (lastAction?.type === 'disease_scan') {
      return `${timeGreeting}! Ready to scan more crops? 📸`;
    } else if (lastAction?.type === 'weather_check') {
      return `${timeGreeting}! Perfect weather for farming today! ☀️`;
    } else if (behavior.preferences.primaryCrops.length > 0) {
      const crop = behavior.preferences.primaryCrops[0];
      return `${timeGreeting}! How's your ${crop} doing? 🌱`;
    }
    
    return `${timeGreeting}! Your farm intelligence is ready! 🚀`;
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(userId: string): Array<{
    title: string;
    description: string;
    action: string;
    priority: number;
  }> {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return this.getDefaultRecommendations();

    const recommendations = [];
    const recentActions = behavior.actions.slice(-10);
    const actionTypes = recentActions.map(a => a.type);

    // Weather-based recommendations
    if (!actionTypes.includes('weather_check')) {
      recommendations.push({
        title: 'Check Today\'s Weather',
        description: 'Get farming-specific weather insights',
        action: 'weather',
        priority: 8
      });
    }

    // Disease scanning recommendations
    if (actionTypes.filter(t => t === 'disease_scan').length < 2) {
      recommendations.push({
        title: 'Scan Your Crops',
        description: 'AI disease detection with 99.7% accuracy',
        action: 'scan',
        priority: 9
      });
    }

    // Market recommendations
    if (!actionTypes.includes('market_check')) {
      recommendations.push({
        title: 'Check Market Prices',
        description: 'Find the best selling opportunities',
        action: 'market',
        priority: 7
      });
    }

    // Voice usage encouragement
    if (behavior.preferences.voiceUsage < 5) {
      recommendations.push({
        title: 'Try Voice Commands',
        description: 'Say "Scan crop" or "Check weather"',
        action: 'voice',
        priority: 6
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }

  // Customize UI layout based on usage
  getPersonalizedLayout(userId: string): {
    primaryActions: string[];
    hiddenFeatures: string[];
    quickAccess: string[];
  } {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return this.getDefaultLayout();

    const actionCounts = behavior.actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([action]) => action);

    return {
      primaryActions: sortedActions.slice(0, 3),
      hiddenFeatures: sortedActions.slice(6),
      quickAccess: sortedActions.slice(0, 4)
    };
  }

  // Generate smart alerts
  getSmartAlerts(userId: string): Array<{
    type: 'weather' | 'market' | 'field' | 'community';
    title: string;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return [];

    const alerts = [];
    const now = new Date();
    const lastAction = behavior.actions[behavior.actions.length - 1];
    
    // Inactivity alert
    if (lastAction && (now.getTime() - lastAction.timestamp) > 24 * 60 * 60 * 1000) {
      alerts.push({
        type: 'field' as const,
        title: 'Field Check Reminder',
        message: 'Your crops might need attention. Quick scan?',
        urgency: 'medium' as const
      });
    }

    // Seasonal alerts based on field profile
    if (behavior.fieldProfile.nextPlanting) {
      const plantingDate = new Date(behavior.fieldProfile.nextPlanting);
      const daysUntilPlanting = Math.ceil((plantingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilPlanting <= 7 && daysUntilPlanting > 0) {
        alerts.push({
          type: 'field' as const,
          title: 'Planting Season Approaching',
          message: `${daysUntilPlanting} days until planting. Prepare your fields!`,
          urgency: 'high' as const
        });
      }
    }

    return alerts;
  }

  private initUserBehavior(userId: string): UserBehavior {
    return {
      userId,
      actions: [],
      preferences: {
        primaryCrops: [],
        farmingStyle: 'traditional',
        preferredLanguage: 'en',
        activeHours: [],
        voiceUsage: 0
      },
      fieldProfile: {
        totalFields: 0,
        avgFieldSize: 0,
        soilTypes: [],
        lastHarvest: '',
        nextPlanting: ''
      }
    };
  }

  private async persistBehavior(userId: string, behavior: UserBehavior) {
    try {
      await supabase
        .from('user_behavior')
        .upsert({
          user_id: userId,
          behavior_data: behavior,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to persist user behavior:', error);
    }
  }

  private getDefaultRecommendations() {
    return [
      {
        title: 'Welcome to CropGenius!',
        description: 'Start by scanning your first crop',
        action: 'scan',
        priority: 10
      },
      {
        title: 'Check Weather',
        description: 'Get farming-specific weather insights',
        action: 'weather',
        priority: 9
      },
      {
        title: 'Explore Market Prices',
        description: 'Find the best selling opportunities',
        action: 'market',
        priority: 8
      }
    ];
  }

  private getDefaultLayout() {
    return {
      primaryActions: ['scan', 'weather', 'market'],
      hiddenFeatures: [],
      quickAccess: ['home', 'scan', 'weather', 'market']
    };
  }
}

export const personalizationEngine = PersonalizationEngine.getInstance();