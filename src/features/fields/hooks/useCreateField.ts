import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createField } from '@/services/fieldService';
import { Field, Boundary } from '@/types/field';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

interface CreateFieldPayload {
  name: string;
  farm_id: string; // Assuming farm_id is available
  boundary: Boundary;
  // Add other properties as needed
}

/**
 * Hook for creating a new field.
 */
export const useCreateField = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async (payload: CreateFieldPayload) => {
      if (!user) {
        throw new Error('You must be logged in to create a field.');
      }

      const fieldData = {
        ...payload,
        user_id: user.id,
      };

      const { data, error } = await createField(fieldData as Omit<Field, 'id' | 'created_at' | 'updated_at'>);

      if (error) {
        throw new Error(error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('New field created successfully!');
    },
    onError: (err) => {
      toast.error('Failed to create field', { description: err.message });
    },
  });
}; 