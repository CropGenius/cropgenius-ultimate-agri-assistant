import { useState, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { useYieldPredictorAgent } from '@/hooks/agents/useYieldPredictorAgent';
import { useToast } from '@/components/ui/use-toast';

export function useYieldPrediction(fieldId?: string) {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [prediction, setPrediction] = useState<any>(null);

  // Use the yield predictor agent
  const {
    predictYield: agentPredictYield,
    isLoading: isAgentLoading,
    error: agentError,
  } = useYieldPredictorAgent();

  // Predict yield for the field
  const predictYield = useCallback(async () => {
    if (!fieldId) {
      toast({
        title: 'Error',
        description: 'Field ID is required',
        variant: 'destructive',
      });
      return null;
    }

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Yield prediction requires an internet connection',
        variant: 'default',
      });
      return null;
    }

    try {
      const result = await agentPredictYield({
        fieldId,
        // Add any additional parameters needed for prediction
      });

      if (result) {
        setPrediction(result);
        toast({
          title: 'Success',
          description: 'Yield prediction completed',
          variant: 'default',
        });
        return result;
      }
    } catch (error) {
      console.error('Yield prediction failed:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to predict yield',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fieldId, isOnline, toast, agentPredictYield]);

  return {
    predictYield,
    prediction,
    isLoading: isAgentLoading,
    error: agentError,
  };
}
