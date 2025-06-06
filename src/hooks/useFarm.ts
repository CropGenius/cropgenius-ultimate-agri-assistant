import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { diagnostics } from '@/core/services/diagnosticService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import farmService from '@/features/field-management/services/farmService';
import { Field } from '@/types';
import { useOfflineMutation } from '@/hooks/offline/useOfflineMutation';

// Farm interface
export interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  size_unit: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Farm context interface
interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  isLoading: boolean;
  error: Error | null;
  setSelectedFarm: (farm: Farm | null) => void;
  refreshFarms: () => Promise<void>;
  addFarm: (
    farmData: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateFarm: (
    id: string,
    farmData: Partial<
      Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    >
  ) => Promise<void>;
  deleteFarm: (id: string) => Promise<void>;
}

// Create and export the context with a default value
export const FarmContext = createContext<FarmContextType | undefined>(
  undefined
);

interface FarmProviderProps {
  children: ReactNode;
}

/**
 * FarmProvider component to wrap the application with farm context
 * @param children - React children components
 */
export function FarmProvider({ children }: FarmProviderProps) {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load farms from Supabase
  const refreshFarms = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('name');

      if (error) {
        throw error;
      }

      setFarms(data || []);

      // Select the first farm if none is selected
      if (data && data.length > 0 && !selectedFarm) {
        setSelectedFarm(data[0]);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to load farms');
      diagnostics.logError(error, {
        source: 'FarmProvider',
        operation: 'refreshFarms',
      });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load farms when user changes
  useEffect(() => {
    if (currentUser) {
      refreshFarms();
    } else {
      setFarms([]);
      setSelectedFarm(null);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Add a new farm
  const addFarm = async (
    farmData: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!currentUser) {
      throw new Error('User must be logged in to add a farm');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('farms')
        .insert({ ...farmData, user_id: currentUser.id })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFarms((prevFarms) => [...prevFarms, data]);

      // Select the new farm
      setSelectedFarm(data);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add farm');
      diagnostics.logError(error, {
        source: 'FarmProvider',
        operation: 'addFarm',
      });
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing farm
  const updateFarm = async (
    id: string,
    farmData: Partial<
      Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    >
  ) => {
    if (!currentUser) {
      throw new Error('User must be logged in to update a farm');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('farms')
        .update(farmData)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFarms((prevFarms) =>
        prevFarms.map((farm) => (farm.id === id ? data : farm))
      );

      // Update selected farm if it's the one being updated
      if (selectedFarm && selectedFarm.id === id) {
        setSelectedFarm(data);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update farm');
      diagnostics.logError(error, {
        source: 'FarmProvider',
        operation: 'updateFarm',
      });
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a farm
  const deleteFarm = async (id: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete a farm');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        throw error;
      }

      setFarms((prevFarms) => prevFarms.filter((farm) => farm.id !== id));

      // If the deleted farm was selected, select another one
      if (selectedFarm && selectedFarm.id === id) {
        const remainingFarms = farms.filter((farm) => farm.id !== id);
        setSelectedFarm(remainingFarms.length > 0 ? remainingFarms[0] : null);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete farm');
      diagnostics.logError(error, {
        source: 'FarmProvider',
        operation: 'deleteFarm',
      });
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: FarmContextType = {
    farms,
    selectedFarm,
    isLoading,
    error,
    setSelectedFarm,
    refreshFarms,
    addFarm,
    updateFarm,
    deleteFarm,
  };

  return React.createElement(FarmContext.Provider, { value }, children);
}

/**
 * Custom hook to access the farm context
 * @returns FarmContextType - The farm context
 */
export function useFarm(): FarmContextType {
  const context = useContext(FarmContext);

  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }

  return context;
}

export default useFarm;
