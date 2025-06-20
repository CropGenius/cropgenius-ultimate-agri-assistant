import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateField } from '@/services/fieldService';
import { Field, Boundary } from '@/types/field';
import { toast } from 'sonner';

interface SaveFieldPayload {
  fieldId: string;
  boundary: Boundary;
}

/**
 * Hook for saving a field's boundary.
 * Uses an optimistic update strategy for a better user experience.
 */
export const useSaveFieldBoundary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, boundary }: SaveFieldPayload) => {
      // Get the current field data from the cache
      const field = queryClient.getQueryData<Field>(['field', fieldId]);

      if (!field) {
        throw new Error('Field not found in cache. Cannot update boundary.');
      }

      // Create the updated field object
      const updatedField = { ...field, boundary };

      const { data, error } = await updateField(updatedField);

      if (error) {
        throw new Error(error);
      }

      return data;
    },
    onMutate: async ({ fieldId, boundary }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['field', fieldId] });

      // Snapshot the previous value
      const previousField = queryClient.getQueryData<Field>(['field', fieldId]);

      // Optimistically update to the new value
      if (previousField) {
        queryClient.setQueryData<Field>(['field', fieldId], {
          ...previousField,
          boundary,
        });
      }
      
      toast.info('Saving field boundary...');

      return { previousField };
    },
    onError: (err, { fieldId }, context) => {
      // Rollback to the previous value on error
      if (context?.previousField) {
        queryClient.setQueryData(['field', fieldId], context.previousField);
      }
      toast.error('Failed to save', { description: err.message });
    },
    onSuccess: (data, { fieldId }) => {
      // Invalidate and refetch the query to get the latest server state
      queryClient.invalidateQueries({ queryKey: ['field', fieldId] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field boundary saved successfully!');
    },
  });
}; 