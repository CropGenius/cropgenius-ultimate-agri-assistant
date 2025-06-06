// src/data/repositories/farmRepository.ts
/**
 * Repository for farm-related data operations
 */

import { db } from '@/data/supabaseClient';
import { useApp } from '@/context/AppContext';

// Farm entity type
export interface Farm {
  id: string;
  name: string;
  location: string;
  size_hectares?: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  primary_crop_type_id?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

// Field entity type (for farm-related operations)
export interface Field {
  id: string;
  farm_id: string;
  name: string;
  size_hectares: number;
  crop_type_id?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  coordinates?: { lat: number; lng: number; polygon?: [number, number][] };
  created_at?: string;
  updated_at?: string;
}

// FarmRepository singleton
export const FarmRepository = {
  /**
   * Get all farms for a user
   */
  async getFarmsByUserId(
    userId: string
  ): Promise<{ data: Farm[] | null; error: Error | null }> {
    return db.find<Farm>({
      table: 'farms',
      filters: { user_id: userId },
    });
  },

  /**
   * Get a specific farm by ID
   */
  async getFarmById(
    farmId: string
  ): Promise<{ data: Farm | null; error: Error | null }> {
    const result = await db.find<Farm>({
      table: 'farms',
      filters: { id: farmId },
      singleRecord: true,
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  },

  /**
   * Create a new farm
   */
  async createFarm(
    farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Farm | null; error: Error | null }> {
    const result = await db.insert<Farm>('farms', farm, { returnData: true });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Update farm details
   */
  async updateFarm(
    farmId: string,
    updates: Partial<Omit<Farm, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
  ): Promise<{ data: Farm | null; error: Error | null }> {
    return db.update<Farm>('farms', { id: farmId }, updates, {
      returnData: true,
    });
  },

  /**
   * Get all fields for a farm
   */
  async getFieldsByFarmId(
    farmId: string
  ): Promise<{ data: Field[] | null; error: Error | null }> {
    return db.find<Field>({
      table: 'fields',
      filters: { farm_id: farmId },
      order: { column: 'name', ascending: true },
    });
  },

  /**
   * Get a specific field by ID
   */
  async getFieldById(
    fieldId: string
  ): Promise<{ data: Field | null; error: Error | null }> {
    const result = await db.find<Field>({
      table: 'fields',
      filters: { id: fieldId },
      singleRecord: true,
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  },

  /**
   * Create a new field
   */
  async createField(
    field: Omit<Field, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Field | null; error: Error | null }> {
    const result = await db.insert<Field>('fields', field, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Update field details
   */
  async updateField(
    fieldId: string,
    updates: Partial<
      Omit<Field, 'id' | 'created_at' | 'updated_at' | 'farm_id'>
    >
  ): Promise<{ data: Field | null; error: Error | null }> {
    return db.update<Field>('fields', { id: fieldId }, updates, {
      returnData: true,
    });
  },

  /**
   * Delete a field
   */
  async deleteField(
    fieldId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    const result = await db.delete('fields', { id: fieldId });
    return {
      success: !result.error,
      error: result.error,
    };
  },
};

/**
 * Hook for farm operations that automatically includes the current user and farm context
 */
export const useFarmRepository = () => {
  const { user, state } = useApp();
  const userId = user?.id;
  const { currentFarmId } = state;

  return {
    ...FarmRepository,

    /**
     * Get all farms for the current user
     */
    getCurrentUserFarms: async (): Promise<{
      data: Farm[] | null;
      error: Error | null;
    }> => {
      if (!userId) {
        return { data: null, error: new Error('User not authenticated') };
      }
      return FarmRepository.getFarmsByUserId(userId);
    },

    /**
     * Get the current farm
     */
    getCurrentFarm: async (): Promise<{
      data: Farm | null;
      error: Error | null;
    }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return FarmRepository.getFarmById(currentFarmId);
    },

    /**
     * Get fields for the current farm
     */
    getCurrentFarmFields: async (): Promise<{
      data: Field[] | null;
      error: Error | null;
    }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return FarmRepository.getFieldsByFarmId(currentFarmId);
    },

    /**
     * Create a field in the current farm
     */
    createFieldInCurrentFarm: async (
      field: Omit<Field, 'id' | 'created_at' | 'updated_at' | 'farm_id'>
    ): Promise<{ data: Field | null; error: Error | null }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return FarmRepository.createField({
        ...field,
        farm_id: currentFarmId,
      });
    },
  };
};
