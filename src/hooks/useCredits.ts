import React, { useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { AppError, ErrorCode, reportError, reportWarning } from '@/lib/errors';
import { networkManager } from '@/lib/network';
import { APP_CONFIG } from '@/lib/config';
import { toast } from 'sonner';

export interface CreditBalance {
  balance: number;
  reserved: number;
  available: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deduct' | 'add' | 'reserve' | 'release';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

interface CreditMutationContext {
  previousBalance?: CreditBalance;
  transactionId?: string;
}

const CREDITS_CACHE_KEY = 'credits_cache';
const PENDING_TRANSACTIONS_KEY = 'pending_credit_transactions';

// Query keys factory
const creditKeys = {
  all: ['credits'] as const,
  balance: (userId: string) => [...creditKeys.all, 'balance', userId] as const,
  transactions: (userId: string) => [...creditKeys.all, 'transactions', userId] as const,
};

// Cache utilities
const getCachedCredits = (): CreditBalance | null => {
  try {
    const cached = localStorage.getItem(CREDITS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    reportWarning('Failed to load cached credits', { error });
    return null;
  }
};

const setCachedCredits = (credits: CreditBalance): void => {
  try {
    localStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify(credits));
  } catch (error) {
    reportWarning('Failed to cache credits', { error });
  }
};

const getPendingTransactions = (): CreditTransaction[] => {
  try {
    const pending = localStorage.getItem(PENDING_TRANSACTIONS_KEY);
    return pending ? JSON.parse(pending) : [];
  } catch (error) {
    reportWarning('Failed to load pending transactions', { error });
    return [];
  }
};

const setPendingTransactions = (transactions: CreditTransaction[]): void => {
  try {
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    reportWarning('Failed to cache pending transactions', { error });
  }
};

// REMOVED: This function is no longer needed as we handle credit fetching directly in the query

// FIXED: Execute credit transaction using real Supabase RPC functions
const executeCreditTransaction = async (
  transaction: Omit<CreditTransaction, 'id' | 'createdAt' | 'status'>
): Promise<CreditTransaction> => {
  const fullTransaction: CreditTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  // Add to pending transactions for offline handling
  const pending = getPendingTransactions();
  setPendingTransactions([...pending, fullTransaction]);

  const operation = async (): Promise<CreditTransaction> => {
    // FIXED: Use real Supabase RPC functions that exist in the database
    if (transaction.type === 'deduct') {
      const { error } = await supabase.rpc('deduct_user_credits', {
        p_user_id: transaction.userId,
        p_amount: Math.abs(transaction.amount),
        p_description: transaction.description
      });

      if (error) {
        throw new AppError(
          ErrorCode.CREDITS_TRANSACTION_FAILED,
          error.message,
          'Credit deduction failed',
          { transaction: fullTransaction, error }
        );
      }
    } else if (transaction.type === 'add') {
      const { error } = await supabase.rpc('restore_user_credits', {
        p_user_id: transaction.userId,
        p_amount: Math.abs(transaction.amount),
        p_description: transaction.description
      });

      if (error) {
        throw new AppError(
          ErrorCode.CREDITS_TRANSACTION_FAILED,
          error.message,
          'Credit restoration failed',
          { transaction: fullTransaction, error }
        );
      }
    }

    // Mark transaction as completed
    const completedTransaction = {
      ...fullTransaction,
      status: 'completed' as const,
    };

    // Remove from pending transactions
    const currentPending = getPendingTransactions();
    const filteredPending = currentPending.filter(t => t.id !== fullTransaction.id);
    setPendingTransactions(filteredPending);

    return completedTransaction;
  };

  try {
    return await networkManager.executeWithRetry(operation, {
      retries: 3,
      priority: 'high',
      offlineQueue: true,
    });
  } catch (error) {
    // Mark transaction as failed but keep it for retry
    const failedTransaction = {
      ...fullTransaction,
      status: 'failed' as const,
    };

    const pending = getPendingTransactions();
    const updatedPending = pending.map(t => 
      t.id === fullTransaction.id ? failedTransaction : t
    );
    setPendingTransactions(updatedPending);

    throw error;
  }
};

export const useCredits = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Memoized query key for performance
  const balanceQueryKey = useMemo(
    () => user ? creditKeys.balance(user.id) : null,
    [user?.id]
  );

  // Query for credit balance - FIXED to use real database
  const balanceQuery = useQuery({
    queryKey: balanceQueryKey || ['credits', 'balance', 'anonymous'],
    queryFn: async () => {
      if (!user?.id) {
        // Return default credits for anonymous/non-authenticated users
        return {
          balance: 100,
          reserved: 0,
          available: 100,
          lastUpdated: new Date().toISOString(),
        };
      }
      
      // FIXED: Fetch from real user_credits table with proper error handling
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('balance, last_updated_at')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // If user doesn't have credits record, create one
          if (error.code === 'PGRST116') {
            const { data: newRecord, error: insertError } = await supabase
              .from('user_credits')
              .insert({
                user_id: user.id,
                balance: 100, // Initial credits for new users
                last_updated_at: new Date().toISOString()
              })
              .select('balance, last_updated_at')
              .single();
              
            if (insertError) {
              throw insertError;
            }
            
            return {
              balance: newRecord.balance,
              reserved: 0,
              available: newRecord.balance,
              lastUpdated: newRecord.last_updated_at,
            };
          }
          throw error;
        }
        
        return {
          balance: data.balance,
          reserved: 0,
          available: data.balance,
          lastUpdated: data.last_updated_at,
        };
      } catch (error) {
        console.error('Failed to fetch credits from database:', error);
        // Return cached balance if available, otherwise return default
        const cached = getCachedCredits();
        if (cached) {
          reportWarning('Using cached credit balance due to database error');
          return cached;
        }
        
        // Last resort: return default balance
        return {
          balance: 100,
          reserved: 0,
          available: 100,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    enabled: true, // Always enabled now
    staleTime: APP_CONFIG.performance.queryStaleTime,
    gcTime: APP_CONFIG.performance.cacheTime,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof AppError && error.code === ErrorCode.AUTH_USER_NOT_FOUND) {
        return false;
      }
      return failureCount < 3;
    },
    // Use cached data as initial data
    placeholderData: () => getCachedCredits(),
  });

  // realtime subscription to balance changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`credits-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_credits',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        if (balanceQueryKey) queryClient.invalidateQueries({ queryKey: balanceQueryKey });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Optimistic balance calculation
  const optimisticBalance = useMemo(() => {
    const pending = getPendingTransactions();
    const currentBalance = balanceQuery.data;
    
    if (!currentBalance) return null;

    const pendingDeductions = pending
      .filter(t => t.type === 'deduct' && t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const pendingAdditions = pending
      .filter(t => t.type === 'add' && t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      ...currentBalance,
      balance: currentBalance.balance - pendingDeductions + pendingAdditions,
      available: currentBalance.available - pendingDeductions + pendingAdditions,
    };
  }, [balanceQuery.data]);

  // Deduct credits mutation
  const deductCreditsMutation = useMutation({
    mutationFn: async ({ amount, description, metadata }: {
      amount: number;
      description: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) {
        throw new AppError(
          ErrorCode.AUTH_USER_NOT_FOUND,
          'User not authenticated',
          'Please log in to use credits'
        );
      }

      const currentBalance = optimisticBalance || balanceQuery.data;
      if (!currentBalance || currentBalance.available < amount) {
        throw new AppError(
          ErrorCode.CREDITS_INSUFFICIENT,
          `Insufficient credits. Required: ${amount}, Available: ${currentBalance?.available || 0}`,
          'You don\'t have enough credits for this action',
          { required: amount, available: currentBalance?.available || 0 }
        );
      }

      return executeCreditTransaction({
        userId: user.id,
        amount: -amount, // Negative for deduction
        type: 'deduct',
        description,
        metadata,
      });
    },
    onMutate: async ({ amount, description }) => {
      // Cancel outgoing refetches
      if (balanceQueryKey) {
        await queryClient.cancelQueries({ queryKey: balanceQueryKey });
      }

      // Snapshot previous value
      const previousBalance = balanceQueryKey 
        ? queryClient.getQueryData<CreditBalance>(balanceQueryKey)
        : null;

      // Optimistically update balance
      if (previousBalance && balanceQueryKey) {
        const newBalance: CreditBalance = {
          ...previousBalance,
          balance: previousBalance.balance - amount,
          available: previousBalance.available - amount,
          lastUpdated: new Date().toISOString(),
        };
        
        queryClient.setQueryData(balanceQueryKey, newBalance);
        setCachedCredits(newBalance);
      }

      toast.info(`Using ${amount} credits for ${description}...`);
      
      return { previousBalance } as CreditMutationContext;
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousBalance && balanceQueryKey) {
        queryClient.setQueryData(balanceQueryKey, context.previousBalance);
        setCachedCredits(context.previousBalance);
      }

      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.CREDITS_TRANSACTION_FAILED);

      reportError(appError);
      toast.error('Transaction Failed', { 
        description: appError.userMessage,
        action: appError.retryable ? {
          label: 'Retry',
          onClick: () => deductCreditsMutation.mutate(variables),
        } : undefined,
      });
    },
    onSuccess: (transaction) => {
      toast.success(`Credits deducted successfully!`);
      reportWarning('Credit transaction completed', { transactionId: transaction.id });
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      if (balanceQueryKey) {
        queryClient.invalidateQueries({ queryKey: balanceQueryKey });
      }
    },
  });

  // Restore credits mutation (for failed transactions)
  const restoreCreditsMutation = useMutation({
    mutationFn: async ({ amount, description, metadata }: {
      amount: number;
      description: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) {
        throw new AppError(
          ErrorCode.AUTH_USER_NOT_FOUND,
          'User not authenticated',
          'Please log in to restore credits'
        );
      }

      return executeCreditTransaction({
        userId: user.id,
        amount: amount, // Positive for addition
        type: 'add',
        description,
        metadata,
      });
    },
    onSuccess: (transaction) => {
      toast.success('Credits restored successfully');
      reportWarning('Credit restoration completed', { transactionId: transaction.id });
      
      // Refetch balance
      if (balanceQueryKey) {
        queryClient.invalidateQueries({ queryKey: balanceQueryKey });
      }
    },
    onError: (error) => {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.CREDITS_TRANSACTION_FAILED);

      reportError(appError);
      toast.error('Credit restoration failed', { 
        description: appError.userMessage 
      });
    },
  });

  // Check if user has sufficient credits
  const hasCredits = useCallback((amount: number): boolean => {
    const balance = optimisticBalance || balanceQuery.data;
    return !!balance && balance.available >= amount;
  }, [optimisticBalance, balanceQuery.data]);

  // Get pending transaction count
  const pendingCount = useMemo(() => {
    return getPendingTransactions().filter(t => t.status === 'pending').length;
  }, [deductCreditsMutation.isPending, restoreCreditsMutation.isPending]);

  return {
    // Balance data
    balance: optimisticBalance?.balance ?? balanceQuery.data?.balance ?? 0,
    available: optimisticBalance?.available ?? balanceQuery.data?.available ?? 0,
    reserved: optimisticBalance?.reserved ?? balanceQuery.data?.reserved ?? 0,
    
    // Query state
    isLoading: balanceQuery.isLoading,
    isError: balanceQuery.isError,
    error: balanceQuery.error as AppError | null,
    
    // Transaction state
    isDeducting: deductCreditsMutation.isPending,
    isRestoring: restoreCreditsMutation.isPending,
    pendingTransactions: pendingCount,
    
    // Actions
    deductCredits: deductCreditsMutation.mutateAsync,
    restoreCredits: restoreCreditsMutation.mutateAsync,
    hasCredits,
    
    // Utilities
    refetch: balanceQuery.refetch,
    invalidate: () => {
      if (balanceQueryKey) {
        queryClient.invalidateQueries({ queryKey: balanceQueryKey });
      }
    },
  };
}; 