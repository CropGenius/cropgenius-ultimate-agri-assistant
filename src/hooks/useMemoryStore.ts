import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

export interface UserMemory {
  farmerName: string | null;
  lastLogin: string | null;
  lastFieldCount: number;
  lastUsedFeature: string | null;
  recentCropsPlanted: string[] | null;
  fieldLocations: any[] | null;
  lastFertilizerPlan: any | null;
  referrerId: string | null;
  preferredLanguage: string | null;
  syncStatus: 'synced' | 'pending' | 'failed';
  firstTimeUser: boolean;
  invitesSent: number;
  premiumTrialActivated: boolean;
  lastSyncedAt: string | null;
  // New fields for AI Whisperer and Monetization
  lastInsightShown: string | null;
  lastProSuggestion: string | null;
  whatsappOptIn: boolean;
  featureUsageCount: number;
  proTrialDaysRemaining: number;
  proExpirationDate: string | null;
}

const DEFAULT_MEMORY: UserMemory = {
  farmerName: null,
  lastLogin: null,
  lastFieldCount: 0,
  lastUsedFeature: null,
  recentCropsPlanted: null,
  fieldLocations: null,
  lastFertilizerPlan: null,
  referrerId: null,
  preferredLanguage: 'en',
  syncStatus: 'pending',
  firstTimeUser: true,
  invitesSent: 0,
  premiumTrialActivated: false,
  lastSyncedAt: null,
  // New fields initialized
  lastInsightShown: null,
  lastProSuggestion: null,
  whatsappOptIn: false,
  featureUsageCount: 0,
  proTrialDaysRemaining: 0,
  proExpirationDate: null
};

/**
 * Extracts referrerId from URL search params
 */
const extractReferrerId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

/**
 * Hook for handling user memory across sessions
 */
export const useMemoryStore = () => {
  const { user, isLoading } = useAuth();
  const [memory, setMemory] = useState<UserMemory>(DEFAULT_MEMORY);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Helper function to save memory to localStorage
  const saveToLocalStorage = (data: UserMemory) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`cropgenius-memory-${user.id}`, JSON.stringify(data));
    }
  };

  // Helper function to load memory from localStorage
  const loadFromLocalStorage = (): UserMemory | null => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem(`cropgenius-memory-${user.id}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing stored memory:", e);
          return null;
        }
      }
    }
    return null;
  };

  // Update a specific memory property
  const updateMemory = async (updates: Partial<UserMemory>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Update local state immediately for responsive UI
      setMemory(prev => ({ ...prev, ...updates, syncStatus: 'pending' }));
      
      // Save to localStorage as a fallback/cache
      saveToLocalStorage({ ...memory, ...updates, syncStatus: 'pending' });
      
      // Track feature usage count - this helps with monetization triggers
      let updatedMemory = { ...memory, ...updates };
      if (updates.lastUsedFeature && updates.lastUsedFeature !== memory.lastUsedFeature) {
        updatedMemory.featureUsageCount = (memory.featureUsageCount || 0) + 1;
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_memory')
        .upsert({ 
          user_id: user.id,
          memory_data: updatedMemory,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state with successful sync status
      setMemory(prev => ({ 
        ...prev, 
        ...updatedMemory, 
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString() 
      }));
      
      // Update localStorage with successful sync
      saveToLocalStorage({ 
        ...updatedMemory, 
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString() 
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update memory:", error);
      
      // Mark as failed in local state
      setMemory(prev => ({ ...prev, syncStatus: 'failed' }));
      saveToLocalStorage({ ...memory, ...updates, syncStatus: 'failed' });
      
      toast.error("Failed to sync your farm data", {
        description: "We'll try again automatically"
      });
      
      return false;
    }
  };
  
  // Perform a full memory sync with the server
  const syncMemory = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // First update local copy with any URL params (like referrerId)
      const referrerId = extractReferrerId();
      if (referrerId && !memory.referrerId) {
        setMemory(prev => ({ ...prev, referrerId }));
      }
      
      // Get memory from Supabase
      const { data, error } = await supabase
        .from('user_memory')
        .select('memory_data')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is not a real error
        throw error;
      }
      
      // If we have server data, use it as the source of truth
      if (data?.memory_data) {
        const serverMemory = data.memory_data as UserMemory;
        
        // If we have a referrerId from URL but not in server memory, keep it
        if (referrerId && !serverMemory.referrerId) {
          serverMemory.referrerId = referrerId;
        }
        
        // Update local state with server data + sync status
        setMemory({ 
          ...serverMemory,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString() // Always update last login
        });
        
        // Save to localStorage
        saveToLocalStorage({ 
          ...serverMemory,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        
        // Save the lastLogin update back to server
        await supabase
          .from('user_memory')
          .update({ 
            memory_data: { 
              ...serverMemory,
              lastLogin: new Date().toISOString() 
            },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        return true;
      } 
      else {
        // No server record yet - create one from local or default
        const localMemory = loadFromLocalStorage() || { ...DEFAULT_MEMORY };
        
        // Add referrer from URL if available
        if (referrerId) {
          localMemory.referrerId = referrerId;
        }
        
        // Get user profile for farmer name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (profileData?.full_name) {
          localMemory.farmerName = profileData.full_name;
        }
        
        // Update last login
        localMemory.lastLogin = new Date().toISOString();
        
        // Create server record
        await supabase
          .from('user_memory')
          .insert({
            user_id: user.id,
            memory_data: localMemory,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        // Update local state
        setMemory({ 
          ...localMemory,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString() 
        });
        
        // Save to localStorage
        saveToLocalStorage({ 
          ...localMemory,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString() 
        });
        
        return true;
      }
    } catch (error) {
      console.error("Failed to sync memory:", error);
      
      // Try to load from localStorage as fallback
      const localMemory = loadFromLocalStorage();
      if (localMemory) {
        setMemory({ ...localMemory, syncStatus: 'failed' });
      }
      
      toast.error("Failed to sync your farm data", {
        description: "Please check your connection"
      });
      
      return false;
    } finally {
      setIsInitialized(true);
    }
  };

  // Reset memory to defaults (for logout or testing)
  const resetMemory = () => {
    setMemory(DEFAULT_MEMORY);
    if (typeof window !== 'undefined' && user) {
      localStorage.removeItem(`cropgenius-memory-${user.id}`);
    }
  };
  
  // New function: Track feature usage for monetization triggers
  const trackFeatureUsage = async (featureName: string): Promise<void> => {
    await updateMemory({
      lastUsedFeature: featureName,
      featureUsageCount: (memory.featureUsageCount || 0) + 1
    });
    
    // Check if we should suggest Pro upgrade based on usage
    if ((memory.featureUsageCount || 0) >= 5 && !memory.lastProSuggestion) {
      // User has used features frequently - good time to suggest Pro
      console.log("High feature usage detected - good time for Pro suggestion");
    }
  };
  
  // New function: Activate Pro trial
  const activateProTrial = async (daysToAdd: number): Promise<boolean> => {
    try {
      const currentDays = memory.proTrialDaysRemaining || 0;
      const newTotalDays = currentDays + daysToAdd;
      
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + newTotalDays);
      
      const success = await updateMemory({
        premiumTrialActivated: true,
        proTrialDaysRemaining: newTotalDays,
        proExpirationDate: expirationDate.toISOString()
      });
      
      if (success) {
        toast.success(`Pro features activated for ${newTotalDays} days!`, {
          description: "Enjoy advanced AI farming insights"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to activate Pro trial:", error);
      return false;
    }
  };
  
  // New function: Check Pro status
  const checkProStatus = (): { isActive: boolean, daysRemaining: number } => {
    if (!memory.premiumTrialActivated || !memory.proExpirationDate) {
      return { isActive: false, daysRemaining: 0 };
    }
    
    const now = new Date();
    const expiration = new Date(memory.proExpirationDate);
    
    if (now > expiration) {
      // Pro trial has expired
      return { isActive: false, daysRemaining: 0 };
    }
    
    // Calculate days remaining
    const diffTime = Math.abs(expiration.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { isActive: true, daysRemaining: diffDays };
  };
  
  // New function: Set WhatsApp preferences
  const setWhatsAppPreference = async (optIn: boolean): Promise<boolean> => {
    return await updateMemory({ whatsappOptIn: optIn });
  };
  
  // Initial setup - load memory when user is available
  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      // Try to load from localStorage first for immediate UI response
      const localMemory = loadFromLocalStorage();
      if (localMemory) {
        setMemory({ ...localMemory, syncStatus: 'pending' });
      }
      
      // Then sync with server
      syncMemory();
    } else {
      // Reset if no user
      resetMemory();
      setIsInitialized(true);
    }
  }, [user, isLoading]);

  return {
    memory,
    updateMemory,
    syncMemory,
    resetMemory,
    isInitialized,
    // New functions for AI Whisperer and Monetization
    trackFeatureUsage,
    activateProTrial,
    checkProStatus,
    setWhatsAppPreference
  };
};

/**
 * Hook for automatic memory synchronization
 */
export const useAutoMemorySync = () => {
  const { memory, syncMemory, isInitialized } = useMemoryStore();
  const { user, isLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Auto-sync on app load or network recovery
  useEffect(() => {
    if (!isLoading && user && !isSyncing && navigator.onLine) {
      setIsSyncing(true);
      syncMemory().finally(() => setIsSyncing(false));
    }
  }, [user, isLoading, navigator.onLine]);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (user && !isSyncing) {
        setIsSyncing(true);
        syncMemory().finally(() => setIsSyncing(false));
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, isSyncing]);
  
  return {
    memory,
    syncMemory,
    isSyncing,
    isInitialized
  };
};

/**
 * Development utility to override memory for testing
 */
export const devMemoryOverride = async (overrides: Partial<UserMemory>) => {
  if (import.meta.env.MODE !== 'development') {
    console.warn('devMemoryOverride is only available in development mode');
    return;
  }
  
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    console.warn('User must be logged in to override memory');
    return;
  }
  
  // Get current memory
  let currentMemory: UserMemory = DEFAULT_MEMORY;
  
  try {
    const { data: memoryData } = await supabase
      .from('user_memory')
      .select('memory_data')
      .eq('user_id', data.user.id)
      .single();
      
    if (memoryData?.memory_data) {
      currentMemory = memoryData.memory_data as UserMemory;
    }
  } catch (error) {
    console.warn('Failed to get current memory, using defaults');
  }
  
  // Apply overrides
  const updatedMemory = {
    ...currentMemory,
    ...overrides
  };
  
  // Save to Supabase
  try {
    await supabase
      .from('user_memory')
      .upsert({
        user_id: data.user.id,
        memory_data: updatedMemory,
        updated_at: new Date().toISOString()
      });
      
    console.log('Memory override applied:', updatedMemory);
    
    // Also save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cropgenius-memory-${data.user.id}`, JSON.stringify(updatedMemory));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to apply memory override:', error);
    return false;
  }
};
