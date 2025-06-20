import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

const creditKeys = {
  balance: (userId: string) => ['credits', 'balance', userId] as const,
};

// Function to fetch the user's credit balance
const fetchCreditBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return { balance: 0 };
    }
    throw new Error(error.message);
  }

  return data || { balance: 0 };
};

export const useCredits = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Query to get the user's credit balance
  const { data: creditBalance, ...queryInfo } = useQuery({
    queryKey: creditKeys.balance(user?.id!),
    queryFn: () => fetchCreditBalance(user?.id!),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to deduct credits
  const { mutate: deductCredits, isPending: isDeducting } = useMutation({
    mutationFn: async ({ amount, description }: { amount: number, description: string }) => {
      if (!user) throw new Error('User not authenticated.');

      const { error } = await supabase.functions.invoke('deduct-credits', {
        body: { userId: user.id, amount, description },
      });

      if (error) throw new Error(error.message);
    },
    onMutate: async ({ amount, description }) => {
      await queryClient.cancelQueries({ queryKey: creditKeys.balance(user!.id) });
      const previousBalance = queryClient.getQueryData<{ balance: number }>(creditKeys.balance(user!.id));
      
      if (previousBalance) {
        const newBalance = previousBalance.balance - amount;
        queryClient.setQueryData(creditKeys.balance(user!.id), { balance: newBalance });
      }

      toast.info(`Deducting ${amount} credits for ${description}...`);
      return { previousBalance };
    },
    onError: (err, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(creditKeys.balance(user!.id), context.previousBalance);
      }
      toast.error('Transaction Failed', { description: err.message });
    },
    onSuccess: () => {
      toast.success('Credits deducted!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.balance(user!.id) });
    },
  });

  const { mutateAsync: restoreCredits, isPending: isRestoring } = useMutation({
    mutationFn: async ({ amount, description }: { amount: number, description: string }) => {
      if (!user) throw new Error('User not authenticated.');

      const { error } = await supabase.functions.invoke('restore-credits', {
        body: { userId: user.id, amount, description },
      });

      if (error) throw new Error(error.message);
    },
    onMutate: async ({ amount, description }) => {
      await queryClient.cancelQueries({ queryKey: creditKeys.balance(user!.id) });
      const previousBalance = queryClient.getQueryData<{ balance: number }>(creditKeys.balance(user!.id));
      
      if (previousBalance) {
        const newBalance = previousBalance.balance + amount;
        queryClient.setQueryData(creditKeys.balance(user!.id), { balance: newBalance });
      }
      
      toast.info(`Rolling back transaction: ${description}`);
      return { previousBalance };
    },
    onError: (err, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(creditKeys.balance(user!.id), context.previousBalance);
      }
      toast.error('Credit restoration failed', { description: err.message });
    },
    onSuccess: () => {
      toast.success('Credits restored.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.balance(user!.id) });
    },
  });

  return {
    balance: creditBalance?.balance ?? 0,
    deductCredits,
    restoreCredits,
    isDeducting,
    isRestoring,
    ...queryInfo,
  };
}; 