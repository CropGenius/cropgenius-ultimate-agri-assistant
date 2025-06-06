import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { analyzeField } from '@/services/fieldAIService';
import { useToast } from '@/components/ui/use-toast';

export function useFieldInsights(fieldId?: string) {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [insights, setInsights] = useState<string[]>([]);

  // Query for field insights
  const {
    data: fieldInsights = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['fieldInsights', fieldId],
    queryFn: () => (fieldId ? analyzeField(fieldId) : Promise.resolve([])),
    enabled: !!fieldId && isOnline,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Update local state when query data changes
  useEffect(() => {
    if (fieldInsights && fieldInsights.length > 0) {
      setInsights(fieldInsights);
    }
  }, [fieldInsights]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!fieldId) {
      toast({
        title: 'Error',
        description: 'Field ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot refresh insights while offline',
        variant: 'default',
      });
      return;
    }

    try {
      await refetch();
      toast({
        title: 'Success',
        description: 'Insights refreshed',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to refresh insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh insights',
        variant: 'destructive',
      });
    }
  }, [fieldId, isOnline, refetch, toast]);

  return {
    insights,
    isLoading,
    error: queryError,
    refresh,
  };
}
