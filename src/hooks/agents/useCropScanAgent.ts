// src/hooks/agents/useCropScanAgent.ts
/**
 * Crop Scan Agent Hook
 *
 * Specialized hook for crop scan analysis operations.
 * Leverages CropScanRepository for data persistence.
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useCropScanRepository, CropScan } from '@/data/repositories';
import {
  performCropScanAndSave as performCropScanInternal,
  CropScanInput,
  ProcessedCropScanResult,
} from '@/agents/CropScanAgent';
import { diagnostics } from '@/utils/diagnosticService';

export interface CropScanAgentState {
  scanResult:
    | (ProcessedCropScanResult & { id: string; imageUrl: string })
    | null;
  isLoading: boolean;
  error: Error | null;
  recentScans: CropScan[];
}

export const useCropScanAgent = () => {
  // Get farm and user context
  const { user, state } = useApp();
  const { currentFarmId, selectedFieldId } = state;
  const userId = user?.id;

  // Get repository for data operations
  const cropScanRepository = useCropScanRepository();

  // Agent state
  const [scanResult, setScanResult] = useState<
    (ProcessedCropScanResult & { id: string; imageUrl: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentScans, setRecentScans] = useState<CropScan[]>([]);

  /**
   * Perform a crop scan analysis
   */
  const performCropScan = useCallback(
    async (
      scanInput: Omit<CropScanInput, 'userId' | 'farmId'>
    ): Promise<
      (ProcessedCropScanResult & { id: string; imageUrl: string }) | undefined
    > => {
      if (!userId || !currentFarmId) {
        const contextError = new Error(
          'User or Farm context missing for crop scan'
        );
        setError(contextError);
        throw contextError;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare full input with context
        const fullInput: CropScanInput = {
          ...scanInput,
          userId,
          farmId: currentFarmId,
          fieldId: selectedFieldId,
        };

        // Use the agent to perform the scan
        const result = await performCropScanInternal(fullInput);
        setScanResult(result);

        // After a successful scan, refresh the recent scans
        try {
          if (selectedFieldId) {
            const { data } = await cropScanRepository.getSelectedFieldCropScans(
              {
                limit: 5,
                sortBy: 'scan_date',
                sortDirection: 'desc',
              }
            );

            if (data) {
              setRecentScans(data);
            }
          } else {
            const { data } = await cropScanRepository.getCurrentFarmCropScans({
              limit: 5,
              sortBy: 'scan_date',
              sortDirection: 'desc',
            });

            if (data) {
              setRecentScans(data);
            }
          }
        } catch (repoError) {
          console.error('Error fetching recent scans:', repoError);
          // Don't fail the entire operation if just fetching recent scans fails
        }

        return result;
      } catch (error) {
        console.error('Error performing crop scan:', error);
        const scanError =
          error instanceof Error
            ? error
            : new Error('Failed to perform crop scan');

        diagnostics.logError(scanError, {
          source: 'CropScanAgent',
          operation: 'performCropScan',
          context: { farmId: currentFarmId, fieldId: selectedFieldId },
        });

        setError(scanError);
        throw scanError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [currentFarmId, selectedFieldId, userId, cropScanRepository]
  );

  /**
   * Get recent crop scans for the current field
   */
  const getRecentFieldScans = useCallback(
    async (
      limit: number = 5
    ): Promise<{ data: CropScan[] | null; error: Error | null }> => {
      if (!selectedFieldId) {
        return { data: null, error: new Error('No field selected') };
      }

      setIsLoading(true);
      try {
        const result = await cropScanRepository.getCropScansByFieldId(
          selectedFieldId,
          {
            limit,
            sortBy: 'scan_date',
            sortDirection: 'desc',
          }
        );

        if (result.data) {
          setRecentScans(result.data);
        }

        return result;
      } catch (error) {
        console.error('Error fetching field scans:', error);
        return {
          data: null,
          error:
            error instanceof Error
              ? error
              : new Error('Error fetching field scans'),
        };
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFieldId, cropScanRepository]
  );

  /**
   * Get the latest crop scan for the current field
   */
  const getLatestFieldScan = useCallback(async (): Promise<{
    data: CropScan | null;
    error: Error | null;
  }> => {
    if (!selectedFieldId) {
      return { data: null, error: new Error('No field selected') };
    }

    return cropScanRepository.getLatestCropScanForField(selectedFieldId);
  }, [selectedFieldId, cropScanRepository]);

  /**
   * Get crop scan history for the current farm
   */
  const getFarmScanHistory = useCallback(
    async (
      options: {
        limit?: number;
        offset?: number;
      } = {}
    ): Promise<{ data: CropScan[] | null; error: Error | null }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }

      return cropScanRepository.getCropScansByFarmId(currentFarmId, {
        ...options,
        sortBy: 'scan_date',
        sortDirection: 'desc',
      });
    },
    [currentFarmId, cropScanRepository]
  );

  return {
    // State
    scanResult,
    isLoading,
    error,
    recentScans,

    // Actions
    performCropScan,
    getRecentFieldScans,
    getLatestFieldScan,
    getFarmScanHistory,
  };
};
