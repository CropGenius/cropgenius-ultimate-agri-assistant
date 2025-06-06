// src/hooks/agents/useYieldPredictorAgent.ts
/**
 * Yield Predictor Agent Hook
 *
 * Specialized hook for yield prediction operations.
 * Leverages repositories for data persistence.
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useFarmRepository } from '@/data/repositories';
import {
  generateYieldPrediction as generateYieldPredictionInternal,
  saveYieldPrediction as saveYieldPredictionInternal,
  getHistoricalYieldPredictions as getHistoricalYieldPredictionsInternal,
  YieldPredictionInput,
  YieldPredictionResult,
  StoredYieldPrediction,
} from '@/agents/YieldPredictorAgent';
import { diagnostics } from '@/utils/diagnosticService';

export interface YieldPredictorAgentState {
  prediction: YieldPredictionResult | null;
  historicalPredictions: StoredYieldPrediction[];
  isLoading: boolean;
  error: Error | null;
}

export const useYieldPredictorAgent = () => {
  // Get farm and user context
  const { user, state } = useApp();
  const { currentFarmId, selectedFieldId } = state;
  const userId = user?.id;

  // Get repository for data operations
  const farmRepository = useFarmRepository();

  // Agent state
  const [prediction, setPrediction] = useState<YieldPredictionResult | null>(
    null
  );
  const [historicalPredictions, setHistoricalPredictions] = useState<
    StoredYieldPrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate a yield prediction
   */
  const predictYield = useCallback(
    async (
      input: Omit<YieldPredictionInput, 'userId' | 'farmId'>
    ): Promise<YieldPredictionResult | undefined> => {
      if (!userId || !currentFarmId) {
        const contextError = new Error(
          'User or Farm context missing for yield prediction'
        );
        setError(contextError);
        throw contextError;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare full input with context
        const fullInput: YieldPredictionInput = {
          ...input,
          userId,
          farmId: currentFarmId,
          fieldId: input.fieldId || selectedFieldId,
        };

        // Get field data if not provided
        if (fullInput.fieldId && !input.fieldSize) {
          try {
            const { data: field } = await farmRepository.getFieldById(
              fullInput.fieldId
            );
            if (field) {
              fullInput.fieldSize = field.size_hectares;
              fullInput.soilType = field.soil_type;
              fullInput.plantingDate = field.planting_date;
            }
          } catch (fieldError) {
            console.error(
              'Error fetching field data for yield prediction:',
              fieldError
            );
            // Continue with prediction even if field data fetch fails
          }
        }

        // Use the agent to generate the prediction
        const result = await generateYieldPredictionInternal(fullInput);
        setPrediction(result);

        return result;
      } catch (error) {
        console.error('Error generating yield prediction:', error);
        const predictionError =
          error instanceof Error
            ? error
            : new Error('Failed to generate yield prediction');

        diagnostics.logError(predictionError, {
          source: 'YieldPredictorAgent',
          operation: 'predictYield',
          context: {
            farmId: currentFarmId,
            fieldId: input.fieldId || selectedFieldId,
          },
        });

        setError(predictionError);
        throw predictionError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [currentFarmId, selectedFieldId, userId, farmRepository]
  );

  /**
   * Save a yield prediction to the database
   */
  const saveYieldPrediction = useCallback(
    async (
      predictionData: Omit<YieldPredictionInput, 'userId' | 'farmId'>,
      predictionResult: YieldPredictionResult
    ): Promise<StoredYieldPrediction | undefined> => {
      if (!userId || !currentFarmId) {
        const contextError = new Error(
          'User or Farm context missing for saving yield prediction'
        );
        setError(contextError);
        throw contextError;
      }

      if (!predictionData.fieldId) {
        const fieldError = new Error(
          'Field ID is required to save yield prediction'
        );
        setError(fieldError);
        throw fieldError;
      }

      try {
        // Prepare full input with context
        const fullInput: YieldPredictionInput = {
          ...predictionData,
          userId,
          farmId: currentFarmId,
        };

        // Save the prediction using the agent
        const savedPrediction = await saveYieldPredictionInternal(
          fullInput,
          predictionResult
        );

        // Update historical predictions
        setHistoricalPredictions((prev) =>
          [
            savedPrediction,
            ...prev.filter((p) => p.id !== savedPrediction.id),
          ].sort(
            (a, b) =>
              new Date(b.predictionDate).getTime() -
              new Date(a.predictionDate).getTime()
          )
        );

        return savedPrediction;
      } catch (error) {
        console.error('Error saving yield prediction:', error);
        const saveError =
          error instanceof Error
            ? error
            : new Error('Failed to save yield prediction');

        diagnostics.logError(saveError, {
          source: 'YieldPredictorAgent',
          operation: 'saveYieldPrediction',
          context: {
            farmId: currentFarmId,
            fieldId: predictionData.fieldId,
          },
        });

        throw saveError; // Re-throw for caller handling
      }
    },
    [currentFarmId, userId]
  );

  /**
   * Fetch historical yield predictions for a field
   */
  const fetchHistoricalYieldPredictions = useCallback(
    async (
      fieldId?: string,
      limit: number = 10
    ): Promise<StoredYieldPrediction[] | undefined> => {
      if (!userId) {
        const userError = new Error(
          'User context missing for fetching historical predictions'
        );
        setError(userError);
        throw userError;
      }

      const fieldIdToUse = fieldId || selectedFieldId;
      if (!fieldIdToUse) {
        const fieldError = new Error(
          'Field ID is required to fetch historical predictions'
        );
        setError(fieldError);
        throw fieldError;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch historical predictions using the agent
        const predictions = await getHistoricalYieldPredictionsInternal(
          fieldIdToUse,
          userId,
          limit
        );

        setHistoricalPredictions(predictions);
        return predictions;
      } catch (error) {
        console.error('Error fetching historical yield predictions:', error);
        const fetchError =
          error instanceof Error
            ? error
            : new Error('Failed to fetch historical yield predictions');

        diagnostics.logError(fetchError, {
          source: 'YieldPredictorAgent',
          operation: 'fetchHistoricalYieldPredictions',
          context: { fieldId: fieldIdToUse },
        });

        setError(fetchError);
        throw fetchError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFieldId, userId]
  );

  return {
    // State
    prediction,
    historicalPredictions,
    isLoading,
    error,

    // Actions
    predictYield,
    saveYieldPrediction,
    fetchHistoricalYieldPredictions,
  };
};
