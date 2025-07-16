import { useState, useCallback } from 'react';
import { aiServices } from '@/services/aiServices';
import { toast } from 'sonner';

export const useRealTimeAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAIOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string = 'AI operation failed'
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chatWithAI = useCallback(async (message: string, conversationId?: string) => {
    return handleAIOperation(
      () => aiServices.chatWithAI(message, conversationId),
      'Failed to get AI response'
    );
  }, [handleAIOperation]);

  const scanCropDisease = useCallback(async (
    imageData: string,
    cropType: string,
    fieldId: string
  ) => {
    return handleAIOperation(
      () => aiServices.detectCropDisease(imageData, cropType, fieldId),
      'Failed to analyze crop disease'
    );
  }, [handleAIOperation]);

  const predictYield = useCallback(async (
    fieldId: string,
    cropType: string,
    plantingDate: string,
    expectedHarvest: string,
    fieldSize: number,
    soilType: string,
    irrigationType: string
  ) => {
    return handleAIOperation(
      () => aiServices.predictYield(
        fieldId,
        cropType,
        plantingDate,
        expectedHarvest,
        fieldSize,
        soilType,
        irrigationType
      ),
      'Failed to predict yield'
    );
  }, [handleAIOperation]);

  const generateFarmPlan = useCallback(async (
    farmId: string,
    season: string,
    goals: string[],
    cropTypes: string[],
    farmSize: number,
    budget?: number
  ) => {
    return handleAIOperation(
      () => aiServices.generateFarmPlan(farmId, season, goals, cropTypes, farmSize, budget),
      'Failed to generate farm plan'
    );
  }, [handleAIOperation]);

  const getAIUsage = useCallback(async () => {
    return handleAIOperation(
      () => aiServices.getUserAIUsage(),
      'Failed to get AI usage data'
    );
  }, [handleAIOperation]);

  return {
    isLoading,
    error,
    chatWithAI,
    scanCropDisease,
    predictYield,
    generateFarmPlan,
    getAIUsage
  };
};