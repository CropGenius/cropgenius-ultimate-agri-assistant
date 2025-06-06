// src/data/repositories/cropScanRepository.ts
/**
 * Repository for crop scan data operations
 */

import { db } from '@/data/supabaseClient';
import { useApp } from '@/context/AppContext';

// CropScan entity type
export interface CropScan {
  id: string;
  farm_id: string;
  field_id?: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string;
  scan_date: string;
  crop_type_id?: string;
  crop_type_name?: string;
  health_status: 'healthy' | 'stressed' | 'diseased' | 'unknown';
  health_score?: number; // 0-100 percentage
  disease_name?: string;
  disease_confidence?: number;
  analysis_summary: string;
  analysis_details?: any; // JSON with detailed findings
  recommendations?: string[];
  created_at?: string;
  updated_at?: string;
}

// CropScan creation payload
export interface CreateCropScanPayload {
  farm_id: string;
  field_id?: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string;
  scan_date?: string;
  crop_type_id?: string;
  crop_type_name?: string;
  health_status: 'healthy' | 'stressed' | 'diseased' | 'unknown';
  health_score?: number;
  disease_name?: string;
  disease_confidence?: number;
  analysis_summary: string;
  analysis_details?: any;
  recommendations?: string[];
}

// CropScanRepository singleton
export const CropScanRepository = {
  /**
   * Get all crop scans for a farm
   */
  async getCropScansByFarmId(
    farmId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'scan_date' | 'health_score';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{ data: CropScan[] | null; error: Error | null }> {
    return db.find<CropScan>({
      table: 'crop_scans',
      filters: { farm_id: farmId },
      order: {
        column: options.sortBy || 'scan_date',
        ascending: options.sortDirection !== 'desc',
      },
      limit: options.limit,
      offset: options.offset,
    });
  },

  /**
   * Get crop scans for a specific field
   */
  async getCropScansByFieldId(
    fieldId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'scan_date' | 'health_score';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{ data: CropScan[] | null; error: Error | null }> {
    return db.find<CropScan>({
      table: 'crop_scans',
      filters: { field_id: fieldId },
      order: {
        column: options.sortBy || 'scan_date',
        ascending: options.sortDirection !== 'desc',
      },
      limit: options.limit,
      offset: options.offset,
    });
  },

  /**
   * Get a specific crop scan by ID
   */
  async getCropScanById(
    scanId: string
  ): Promise<{ data: CropScan | null; error: Error | null }> {
    const result = await db.find<CropScan>({
      table: 'crop_scans',
      filters: { id: scanId },
      singleRecord: true,
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  },

  /**
   * Create a new crop scan record
   */
  async createCropScan(
    scan: CreateCropScanPayload
  ): Promise<{ data: CropScan | null; error: Error | null }> {
    // Ensure scan_date is set
    const scanWithDefaults = {
      ...scan,
      scan_date: scan.scan_date || new Date().toISOString(),
    };

    const result = await db.insert<CropScan>('crop_scans', scanWithDefaults, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Update crop scan details
   */
  async updateCropScan(
    scanId: string,
    updates: Partial<
      Omit<CropScan, 'id' | 'created_at' | 'updated_at' | 'farm_id' | 'user_id'>
    >
  ): Promise<{ data: CropScan | null; error: Error | null }> {
    return db.update<CropScan>('crop_scans', { id: scanId }, updates, {
      returnData: true,
    });
  },

  /**
   * Delete a crop scan
   */
  async deleteCropScan(
    scanId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    const result = await db.delete('crop_scans', { id: scanId });
    return {
      success: !result.error,
      error: result.error,
    };
  },

  /**
   * Get latest crop scan for a field
   */
  async getLatestCropScanForField(
    fieldId: string
  ): Promise<{ data: CropScan | null; error: Error | null }> {
    const { data, error } = await db.raw
      .from('crop_scans')
      .select('*')
      .eq('field_id', fieldId)
      .order('scan_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return {
        data: null,
        error: new Error(`Error fetching latest crop scan: ${error.message}`),
      };
    }

    return { data, error: null };
  },
};

/**
 * Hook for crop scan operations that automatically includes the current user and farm context
 */
export const useCropScanRepository = () => {
  const { user, state } = useApp();
  const userId = user?.id;
  const { currentFarmId, selectedFieldId } = state;

  return {
    ...CropScanRepository,

    /**
     * Get crop scans for the current farm
     */
    getCurrentFarmCropScans: async (
      options?: Parameters<typeof CropScanRepository.getCropScansByFarmId>[1]
    ): Promise<{ data: CropScan[] | null; error: Error | null }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return CropScanRepository.getCropScansByFarmId(currentFarmId, options);
    },

    /**
     * Get crop scans for the selected field
     */
    getSelectedFieldCropScans: async (
      options?: Parameters<typeof CropScanRepository.getCropScansByFieldId>[1]
    ): Promise<{ data: CropScan[] | null; error: Error | null }> => {
      if (!selectedFieldId) {
        return { data: null, error: new Error('No field selected') };
      }
      return CropScanRepository.getCropScansByFieldId(selectedFieldId, options);
    },

    /**
     * Get latest crop scan for the selected field
     */
    getLatestCropScanForSelectedField: async (): Promise<{
      data: CropScan | null;
      error: Error | null;
    }> => {
      if (!selectedFieldId) {
        return { data: null, error: new Error('No field selected') };
      }
      return CropScanRepository.getLatestCropScanForField(selectedFieldId);
    },

    /**
     * Create a crop scan for the current farm and selected field
     */
    createCropScanInCurrentContext: async (
      scan: Omit<CreateCropScanPayload, 'farm_id' | 'field_id' | 'user_id'>
    ): Promise<{ data: CropScan | null; error: Error | null }> => {
      if (!currentFarmId || !userId) {
        return { data: null, error: new Error('Farm or user context missing') };
      }

      return CropScanRepository.createCropScan({
        ...scan,
        farm_id: currentFarmId,
        field_id: selectedFieldId,
        user_id: userId,
      });
    },
  };
};
