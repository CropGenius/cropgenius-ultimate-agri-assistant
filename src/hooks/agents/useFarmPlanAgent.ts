// src/hooks/agents/useFarmPlanAgent.ts
/**
 * Farm Plan Agent Hook
 *
 * Specialized hook for generating and saving farm plans, leveraging AIFarmPlanAgent and repositories.
 */
import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useTaskRepository, useFarmRepository } from '@/data/repositories';
import {
  generateFarmPlan as generateFarmPlanInternal,
  saveFarmPlanAndTasks as saveFarmPlanAndTasksInternal,
  FarmPlanInput,
  FarmPlanOutput,
} from '@/agents/AIFarmPlanAgent';
import { diagnostics } from '@/core/services/diagnosticService';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import {
  FarmPlannerAgent,
  FarmPlan,
  FarmPlanResult,
} from '@/agents/FarmPlannerAgent';

const AGENT_NAME = 'FarmPlanAgent';
const AGENT_VERSION = '1.0';

export const useFarmPlanAgent = ({
  weatherContext,
  marketContext,
}: { weatherContext?: any; marketContext?: any } = {}) => {
  const { user, state } = useApp();
  const { currentFarmId } = state;
  const userId = user?.id;
  const { memory, updateMemory } = useMemoryStore();

  const [farmPlan, setFarmPlan] = useState<FarmPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getFarmPlan = useCallback(
    async (
      input: Omit<
        FarmPlanInput,
        'userId' | 'farmId' | 'weatherContext' | 'marketContext'
      > & { farmId?: string }
    ) => {
      if (!userId || !(input.farmId || currentFarmId)) {
        const err = new Error('User and Farm ID required');
        setError(err);
        throw err;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fullInput: FarmPlanInput = {
          ...input,
          userId,
          farmId: input.farmId || currentFarmId!,
          weatherContext,
          marketContext,
        };
        const plan = await generateFarmPlanInternal(fullInput);
        setFarmPlan(plan);
        return { plan, inputUsed: fullInput };
      } catch (err) {
        diagnostics.logError(err, {
          source: 'FarmPlanAgent',
          operation: 'getFarmPlan',
        });
        setError(
          err instanceof Error ? err : new Error('Failed to generate farm plan')
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentFarmId, weatherContext, marketContext]
  );

  const saveFarmPlan = useCallback(
    async (plan: FarmPlanOutput, input: FarmPlanInput) => {
      if (!input.userId || !input.farmId)
        throw new Error('User ID and Farm ID required');
      try {
        await saveFarmPlanAndTasksInternal(plan, input);
      } catch (err) {
        diagnostics.logError(err, {
          source: 'FarmPlanAgent',
          operation: 'saveFarmPlan',
        });
        setError(
          err instanceof Error ? err : new Error('Failed to save farm plan')
        );
        throw err;
      }
    },
    []
  );

  return {
    farmPlan,
    isLoading,
    error,
    getFarmPlan,
    saveFarmPlan,
  };
};
