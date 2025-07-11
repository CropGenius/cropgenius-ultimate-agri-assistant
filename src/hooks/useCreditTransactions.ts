import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export interface CreditTransactionRow {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

const TXN_PAGE_SIZE = 50;

export const useCreditTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = user ? ['credit_transactions', user.id] : ['credit_transactions', 'anon'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<CreditTransactionRow[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('id, amount, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(TXN_PAGE_SIZE);

      if (error) throw error;
      return data as CreditTransactionRow[];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  /* realtime subscription */
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`credits-txn-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credit_transactions',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // invalidate cache to refetch
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return query;
};
