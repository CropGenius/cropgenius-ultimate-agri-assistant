import React, { useCallback, useMemo } from 'react';
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

// Fetch credit balance with offline support
const fetchCreditBalance = async (userId: string): Promise<CreditBalance> => {
  const operation = async (): Promise<CreditBalance> => {
    // Since user_credits table doesn't exist in schema, use profiles table for demo
    // In production, you would create a proper user_credits table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No credit record found - create initial record
        const initialBalance: CreditBalance = {
          balance: 100, // Initial credits for new users
          reserved: 0,
          available: 100,
          lastUpdated: new Date().toISOString(),
        };
        
        // Simulate credit initialization - in production use proper user_credits table
        const insertError = null; // No actual insert for demo

        if (insertError) {
          throw new AppError(
            ErrorCode.CREDITS_SYNC_FAILED,
            insertError.message,
            'Failed to initialize credit account',
            { userId, error: insertError }
          );
        }

        return initialBalance;
      }
      
      throw new AppError(
        ErrorCode.CREDITS_SYNC_FAILED,
        error.message,
        'Failed to fetch credit balance',
        { userId, error }
      );
    }

    // Simulate credit balance - in production use actual credit data
    const creditBalance: CreditBalance = {
      balance: 100, // Default balance for demo
      reserved: 0,
      available: 100,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    setCachedCredits(creditBalance);
    return creditBalance;
  };

  try {
    return await networkManager.executeWithRetry(operation, {
      retries: 3,
      priority: 'high',
      offlineQueue: true,
    });
  } catch (error) {
    // Return cached balance if available
    const cached = getCachedCredits();
    if (cached) {
      reportWarning('Using cached credit balance due to network error');
      return cached;
    }
    
    throw error;
  }
};

// Execute credit transaction with full safety
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
    const functionName = transaction.type === 'deduct' ? 'deduct-credits' : 'restore-credits';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        userId: transaction.userId,
        amount: Math.abs(transaction.amount),
        description: transaction.description,
        transactionId: fullTransaction.id,
        metadata: transaction.metadata,
      },
    });

    if (error) {
      throw new AppError(
        ErrorCode.CREDITS_TRANSACTION_FAILED,
        error.message,
        'Transaction failed',
        { transaction: fullTransaction, error }
      );
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

  // Query for credit balance
  const balanceQuery = useQuery({
    queryKey: balanceQueryKey || ['credits', 'balance', 'anonymous'],
    queryFn: () => {
      if (!user?.id) {
        throw new AppError(
          ErrorCode.AUTH_USER_NOT_FOUND,
          'User not authenticated',
          'Please log in to view your credits'
        );
      }
      return fetchCreditBalance(user.id);
    },
    enabled: isAuthenticated && !!user?.id,
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