import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { useOfflineQueue } from './useOfflineQueue';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

export interface OfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<void> | void;
  onSuccess?: (data: TData, variables: TVariables) => Promise<void> | void;
  onError?: (error: Error, variables: TVariables) => Promise<void> | void;
  onSettled?: () => Promise<void> | void;
  retry?: boolean;
  retryDelay?: number;
  meta?: Record<string, unknown>;
}

export function useOfflineMutation<TData = unknown, TVariables = void>(
  options: OfflineMutationOptions<TData, TVariables>
) {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { addToQueue, retryQueue } = useOfflineQueue();
  const queryClient = useQueryClient();
  const mutationRef = useRef<ReturnType<typeof useMutation>>();

  const mutationFn = useCallback(
    async (variables: TVariables) => {
      try {
        // Call onMutate for optimistic updates
        await options.onMutate?.(variables);

        if (!isOnline) {
          // Queue the mutation when offline
          const operationId = uuidv4();
          await addToQueue({
            id: operationId,
            type: 'mutation',
            variables,
            meta: options.meta || {},
            timestamp: new Date().toISOString(),
            retry: options.retry ?? true,
            retryDelay: options.retryDelay ?? 5000,
          });

          // Return a resolved promise with a special offline result
          return {
            __offline: true,
            id: operationId,
            timestamp: new Date().toISOString(),
          } as unknown as TData;
        }

        // Execute the actual mutation when online
        return await options.mutationFn(variables);
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    [isOnline, addToQueue, options]
  );

  mutationRef.current = useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      try {
        if (data && (data as any).__offline) {
          // Show queued notification
          toast({
            title: 'Operation queued',
            description:
              'This operation will be completed when you are back online',
            variant: 'default',
          });
          return;
        }

        // Call the success handler
        await options.onSuccess?.(data, variables);

        // Invalidate relevant queries
        await queryClient.invalidateQueries();
      } catch (error) {
        console.error('Error in onSuccess:', error);
      } finally {
        await options.onSettled?.();
      }
    },
    onError: async (error, variables) => {
      try {
        await options.onError?.(error, variables);

        // Show error toast
        toast({
          title: 'Operation failed',
          description: error.message,
          variant: 'destructive',
        });
      } catch (error) {
        console.error('Error in onError:', error);
      } finally {
        await options.onSettled?.();
      }
    },
  });

  // Retry failed mutations when coming back online
  const retryMutation = useCallback(async () => {
    if (isOnline) {
      await retryQueue();
    }
  }, [isOnline, retryQueue]);

  return {
    ...mutationRef.current,
    retry: retryMutation,
  };
}
