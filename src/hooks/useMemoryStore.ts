
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserMemory } from '@/types/supabase';

// Default memory structure
const defaultMemory = {
  farmerName: null,
  lastLogin: null,
  lastFieldCount: 0,
  lastUsedFeature: null,
  recentCropsPlanted: [],
  preferredCrops: [],
  commonIssues: [],
  aiInteractions: 0,
  scanCount: 0,
  weatherChecks: 0,
  marketChecks: 0,
  taskCompletionRate: 0,
  geniusScore: 0,
  invitesSent: 0,
  offlineSessions: 0,
  proTrialEligible: true,
  proTrialUsed: false,
  proStatus: false,
  proExpirationDate: null,
  whatsappOptIn: false, // Added whatsappOptIn property
  syncStatus: 'pending' // Added syncStatus property
};

export const useMemoryStore = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<typeof defaultMemory>(defaultMemory);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [memoryId, setMemoryId] = useState<string | null>(null);
  const [syncDate, setSyncDate] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Track online status 
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load memory from local storage on init
  useEffect(() => {
    const loadLocalMemory = () => {
      try {
        const localMemory = localStorage.getItem('user_memory');
        if (localMemory) {
          const parsedMemory = JSON.parse(localMemory);
          setMemory(parsedMemory.memory_data || defaultMemory);
          setMemoryId(parsedMemory.id || null);
          setSyncDate(parsedMemory.syncDate ? new Date(parsedMemory.syncDate) : null);
        }
      } catch (e) {
        console.error('Error loading memory from localStorage:', e);
      }
    };
    
    loadLocalMemory();
  }, []);

  // Load or create user memory when user is available
  useEffect(() => {
    if (!user) return;
    
    const fetchMemory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get existing memory
        const { data, error } = await supabase
          .from('user_memory')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // If memory exists, use it
        if (data) {
          // Make sure memory_data exists and is valid
          const memoryData = data.memory_data || defaultMemory;
          
          setMemory(memoryData);
          setMemoryId(data.id);
          
          // Save to local storage
          localStorage.setItem('user_memory', JSON.stringify({
            id: data.id,
            memory_data: memoryData,
            syncDate: new Date().toISOString()
          }));
          
          setSyncDate(new Date());
          return;
        }
        
        // If no memory, create new
        if (!data) {
          const newMemory = {
            user_id: user.id,
            memory_data: {
              ...defaultMemory,
              farmerName: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
              lastLogin: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          };
          
          const { data: createdData, error: createError } = await supabase
            .from('user_memory')
            .insert(newMemory)
            .select();
            
          if (createError) throw createError;
          
          if (createdData && createdData[0]) {
            setMemory(createdData[0].memory_data);
            setMemoryId(createdData[0].id);
            
            // Save to local storage
            localStorage.setItem('user_memory', JSON.stringify({
              id: createdData[0].id,
              memory_data: createdData[0].memory_data,
              syncDate: new Date().toISOString()
            }));
            
            setSyncDate(new Date());
          }
        }
      } catch (err: any) {
        console.error('Error fetching memory:', err);
        setError(err.message);
        
        // Try to load from local storage as fallback
        try {
          const localMemory = localStorage.getItem('user_memory');
          if (localMemory) {
            const parsedMemory = JSON.parse(localMemory);
            setMemory(parsedMemory.memory_data || defaultMemory);
            setMemoryId(parsedMemory.id || null);
            setSyncDate(parsedMemory.syncDate ? new Date(parsedMemory.syncDate) : null);
          }
        } catch (e) {
          console.error('Error loading memory from localStorage as fallback:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemory();
  }, [user]);

  // Update memory in Supabase and local storage
  const updateMemory = async (updates: Partial<typeof defaultMemory>) => {
    try {
      // Update local state first for immediate feedback
      const updatedMemory = { ...memory, ...updates };
      setMemory(updatedMemory);
      
      // Save to local storage
      const localData = {
        id: memoryId,
        memory_data: updatedMemory,
        syncDate: new Date().toISOString()
      };
      localStorage.setItem('user_memory', JSON.stringify(localData));
      setSyncDate(new Date());
      
      // If offline, just keep in localStorage until back online
      if (isOffline || !user) {
        return updatedMemory;
      }
      
      // If online, update Supabase
      if (memoryId) {
        // Update existing memory
        const { error } = await supabase
          .from('user_memory')
          .update({
            memory_data: updatedMemory,
            updated_at: new Date().toISOString()
          })
          .eq('id', memoryId);
          
        if (error) throw error;
      } else if (user) {
        // Create new memory if we have user but no memoryId
        const newMemory = {
          user_id: user.id,
          memory_data: updatedMemory,
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('user_memory')
          .insert(newMemory)
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          setMemoryId(data[0].id);
          localStorage.setItem('user_memory', JSON.stringify({
            id: data[0].id,
            memory_data: updatedMemory,
            syncDate: new Date().toISOString()
          }));
        }
      }
      
      return updatedMemory;
    } catch (err: any) {
      console.error('Error updating memory:', err);
      // Toast only for server-side errors, not offline mode
      if (!isOffline) {
        toast.error('Failed to sync memory', {
          description: 'Your data will be saved locally until reconnected.'
        });
      }
      return memory;
    }
  };
  
  // Add WhatsApp preference function
  const setWhatsAppPreference = async (optIn: boolean) => {
    return await updateMemory({ whatsappOptIn: optIn });
  };

  // Function to sync memory
  const syncMemory = async () => {
    if (!user || !memoryId || isOffline) {
      console.log("[Memory] Cannot sync - offline or no user/memory ID");
      return { success: false };
    }
    
    try {
      const { error } = await supabase
        .from('user_memory')
        .update({
          memory_data: {
            ...memory,
            syncStatus: 'synced'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', memoryId);
        
      if (error) throw error;
      
      // Update local state
      setMemory({ ...memory, syncStatus: 'synced' });
      setSyncDate(new Date());
      
      // Save to local storage
      localStorage.setItem('user_memory', JSON.stringify({
        id: memoryId,
        memory_data: { ...memory, syncStatus: 'synced' },
        syncDate: new Date().toISOString()
      }));
      
      toast.success('Memory synced successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error syncing memory:', err);
      setMemory({ ...memory, syncStatus: 'failed' });
      toast.error('Failed to sync memory');
      return { success: false, error: err.message };
    }
  };
  
  // Function to reset memory
  const resetMemory = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all memory data? This cannot be undone."
    );
    
    if (!confirmReset) return;
    
    try {
      setMemory(defaultMemory);
      
      if (user && memoryId) {
        // Reset on the server
        const { error } = await supabase
          .from('user_memory')
          .update({
            memory_data: defaultMemory,
            updated_at: new Date().toISOString()
          })
          .eq('id', memoryId);
          
        if (error) throw error;
      }
      
      // Clear local storage
      localStorage.removeItem('user_memory');
      setMemoryId(null);
      setSyncDate(new Date());
      
      toast.success('Memory data has been reset');
    } catch (err: any) {
      console.error('Error resetting memory:', err);
      toast.error('Failed to reset memory');
    }
  };

  // Sync memory from local to server when coming online
  useEffect(() => {
    if (!isOffline && user && memoryId) {
      const syncOfflineChanges = async () => {
        try {
          const localMemory = localStorage.getItem('user_memory');
          if (!localMemory) return;
          
          const parsedMemory = JSON.parse(localMemory);
          
          // Update server with local changes
          await supabase
            .from('user_memory')
            .update({
              memory_data: parsedMemory.memory_data,
              updated_at: new Date().toISOString()
            })
            .eq('id', memoryId);
            
          setSyncDate(new Date());
          toast.success('Memory synchronized', {
            description: 'Your data has been saved to the server.'
          });
        } catch (err) {
          console.error('Error syncing memory:', err);
        }
      };
      
      syncOfflineChanges();
    }
  }, [isOffline, user, memoryId]);

  return {
    memory,
    updateMemory,
    setWhatsAppPreference,
    syncMemory,
    resetMemory,
    loading,
    error,
    syncDate,
    isOffline
  };
};

// For dev debug panel
export const devMemoryOverride = async (memoryUpdates: any) => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      console.warn('User must be logged in to override memory');
      return false;
    }
    
    const userId = data.user.id;
    
    // Get existing memory
    const { data: memData } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (memData) {
      // Update existing memory
      const updatedMemory = {
        ...memData.memory_data,
        ...memoryUpdates
      };
      
      await supabase
        .from('user_memory')
        .update({
          memory_data: updatedMemory
        })
        .eq('id', memData.id);
        
      // Update local storage
      localStorage.setItem('user_memory', JSON.stringify({
        id: memData.id,
        memory_data: updatedMemory,
        syncDate: new Date().toISOString()
      }));
      
      return updatedMemory;
    }
    
    return false;
  } catch (error) {
    console.error('Error overriding memory:', error);
    return false;
  }
};
