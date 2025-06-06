import { devMemoryOverride, UserMemory } from '@/hooks/useMemoryStore';
import { supabase } from '@/integrations/supabase/client';

/**
 * Developer utility to simulate different user memory scenarios
 */
export const simulateMemoryScenarios = {
  /**
   * Simulates a new user with no prior data
   */
  newUser: async () => {
    return devMemoryOverride({
      farmerName: 'New Farmer',
      lastLogin: null,
      lastFieldCount: 0,
      lastUsedFeature: null,
      recentCropsPlanted: null,
      fieldLocations: null,
      firstTimeUser: true,
      syncStatus: 'synced',
    });
  },

  /**
   * Simulates a returning user with moderate farm activity
   */
  returningUser: async () => {
    const lastLogin = new Date();
    lastLogin.setDate(lastLogin.getDate() - 7); // 7 days ago

    return devMemoryOverride({
      farmerName: 'Returning Farmer',
      lastLogin: lastLogin.toISOString(),
      lastFieldCount: 3,
      lastUsedFeature: 'crop-scanner',
      recentCropsPlanted: ['maize', 'beans'],
      fieldLocations: [
        { name: 'North Field', size: 2.5, crop: 'maize' },
        { name: 'South Field', size: 1.8, crop: 'beans' },
        { name: 'West Field', size: 3.2, crop: 'tomatoes' },
      ],
      firstTimeUser: false,
      syncStatus: 'synced',
    });
  },

  /**
   * Simulates a power user with extensive farm data
   */
  powerUser: async () => {
    const lastLogin = new Date();
    lastLogin.setHours(lastLogin.getHours() - 12); // 12 hours ago

    return devMemoryOverride({
      farmerName: 'Power Farmer',
      lastLogin: lastLogin.toISOString(),
      lastFieldCount: 8,
      lastUsedFeature: 'fertilizer-calculator',
      recentCropsPlanted: ['maize', 'beans', 'cassava', 'rice', 'tomatoes'],
      fieldLocations: Array(8)
        .fill(0)
        .map((_, i) => ({
          name: `Field ${i + 1}`,
          size: Math.round((Math.random() * 5 + 1) * 10) / 10,
          crop: ['maize', 'beans', 'cassava', 'rice', 'tomatoes'][
            Math.floor(Math.random() * 5)
          ],
        })),
      lastFertilizerPlan: {
        recommendedNPK: '17-17-17',
        quantityPerHectare: 250,
        totalCost: 45000,
      },
      firstTimeUser: false,
      invitesSent: 5,
      premiumTrialActivated: true,
      syncStatus: 'synced',
    });
  },

  /**
   * Simulates a referred user who came through a link
   */
  referredUser: async () => {
    return devMemoryOverride({
      farmerName: 'Referred Farmer',
      lastLogin: null,
      lastFieldCount: 0,
      lastUsedFeature: null,
      referrerId: 'abc123',
      firstTimeUser: true,
      syncStatus: 'synced',
    });
  },

  /**
   * Simulates a user with offline/sync issues
   */
  offlineUser: async () => {
    const lastLogin = new Date();
    lastLogin.setDate(lastLogin.getDate() - 3); // 3 days ago

    return devMemoryOverride({
      farmerName: 'Offline Farmer',
      lastLogin: lastLogin.toISOString(),
      lastFieldCount: 2,
      lastUsedFeature: 'weather',
      syncStatus: 'failed',
    });
  },
};

/**
 * Development panel component for testing memory scenarios
 * This can be included in the DevDebugPanel
 */
export const logCurrentMemory = async () => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('This function is only available in development mode');
    return;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    console.warn('User must be logged in to view memory');
    return null;
  }

  try {
    // Get from localStorage first
    let memory = null;
    const localData = localStorage.getItem(`cropgenius-memory-${data.user.id}`);

    if (localData) {
      try {
        memory = JSON.parse(localData);
        console.log('📋 Memory from localStorage:', memory);
      } catch (e) {
        console.error('Failed to parse localStorage memory');
      }
    }

    // Get from Supabase
    const { data: memoryData, error: memoryError } = await supabase
      .from('user_memory')
      .select('memory_data')
      .eq('user_id', data.user.id)
      .single();

    if (memoryError) {
      console.error('Failed to fetch server memory:', memoryError);
    } else {
      console.log('💾 Memory from server:', memoryData.memory_data);
      memory = memoryData.memory_data;
    }

    return memory;
  } catch (error) {
    console.error('Error fetching memory:', error);
    return null;
  }
};
