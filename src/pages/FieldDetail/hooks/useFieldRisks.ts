import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { checkFieldRisks } from '@/services/fieldAIService';

export function useFieldRisks(fieldId?: string) {
  const { isOnline } = useNetworkStatus();

  // Query for field risks
  const {
    data: risks = { hasRisks: false, risks: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fieldRisks', fieldId],
    queryFn: () =>
      fieldId
        ? checkFieldRisks(fieldId)
        : Promise.resolve({ hasRisks: false, risks: [] }),
    enabled: !!fieldId && isOnline,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    risks,
    isLoading,
    error,
  };
}
