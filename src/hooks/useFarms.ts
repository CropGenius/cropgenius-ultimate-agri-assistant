import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useAuthContext as useAuth } from '@/providers/AuthProvider';
import { Farm } from '@/types/farm';
import { toast } from 'sonner';

export const useFarms = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    if (user) {
      loadFarms();
      loadSelectedFarm();
    }
  }, [user]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      toast.error('Failed to load farms', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedFarm = () => {
    const farmId = localStorage.getItem('selectedFarmId');
    if (farmId) {
      const farm = farms.find(f => f.id === farmId);
      if (farm) {
        setSelectedFarm(farm);
      }
    } else if (farms.length > 0) {
      // Auto-select first farm if none selected
      selectFarm(farms[0]);
    }
  };

  const selectFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    localStorage.setItem('selectedFarmId', farm.id);
    localStorage.setItem('selectedFarmName', farm.name);
  };

  const createFarm = async (farmData: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert({
          ...farmData,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setFarms(prev => [data, ...prev]);
      selectFarm(data);
      toast.success('Farm created successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to create farm', { description: error.message });
      throw error;
    }
  };

  const updateFarm = async (farmId: string, updates: Partial<Farm>) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update(updates)
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      
      setFarms(prev => prev.map(f => f.id === farmId ? data : f));
      if (selectedFarm?.id === farmId) {
        setSelectedFarm(data);
      }
      toast.success('Farm updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update farm', { description: error.message });
      throw error;
    }
  };

  const deleteFarm = async (farmId: string) => {
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;
      
      setFarms(prev => prev.filter(f => f.id !== farmId));
      if (selectedFarm?.id === farmId) {
        const remainingFarms = farms.filter(f => f.id !== farmId);
        if (remainingFarms.length > 0) {
          selectFarm(remainingFarms[0]);
        } else {
          setSelectedFarm(null);
          localStorage.removeItem('selectedFarmId');
          localStorage.removeItem('selectedFarmName');
        }
      }
      toast.success('Farm deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete farm', { description: error.message });
      throw error;
    }
  };

  return {
    farms,
    loading,
    selectedFarm,
    selectFarm,
    createFarm,
    updateFarm,
    deleteFarm,
    refetch: loadFarms
  };
};