// src/hooks/agents/useSmartMarketAgent.ts
/**
 * Smart Market Agent Hook
 *
 * Specialized hook for market data operations.
 * Leverages MarketRepository for data access.
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  useMarketRepository,
  MarketListing,
  PriceTrend,
  DemandSignal,
} from '@/data/repositories';
import {
  fetchMarketListings as fetchMarketListingsInternal,
  MarketDataInput,
  MarketDataOutput,
} from '@/agents/SmartMarketAgent';
import { diagnostics } from '@/utils/diagnosticService';

export interface SmartMarketAgentState {
  marketData: MarketDataOutput | null;
  isLoading: boolean;
  error: Error | null;
}

export const useSmartMarketAgent = () => {
  // Get farm and user context
  const { user, state } = useApp();
  const { currentFarmId } = state;
  const userId = user?.id;

  // Get repository for data operations
  const marketRepository = useMarketRepository();

  // Agent state
  const [marketData, setMarketData] = useState<MarketDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get market insights for specific crop type
   */
  const getMarketInsights = useCallback(
    async (
      input: Omit<MarketDataInput, 'userId' | 'farmId'>
    ): Promise<MarketDataOutput | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        // Prepare full input with context
        const fullInput: MarketDataInput = {
          ...input,
          userId: userId,
          farmId: currentFarmId,
        };

        // Use the agent to fetch market data
        const data = await fetchMarketListingsInternal(fullInput);
        setMarketData(data);

        return data;
      } catch (error) {
        console.error('Error fetching market insights:', error);
        const marketError =
          error instanceof Error
            ? error
            : new Error('Failed to fetch market insights');

        diagnostics.logError(marketError, {
          source: 'SmartMarketAgent',
          operation: 'getMarketInsights',
          context: { cropType: input.cropType },
        });

        setError(marketError);
        throw marketError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentFarmId]
  );

  /**
   * Get market listings directly from repository with more filtering options
   */
  const getMarketListings = useCallback(
    async (
      filters: {
        cropName?: string;
        cropTypeId?: string;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
        fromDate?: string;
        limit?: number;
      } = {}
    ): Promise<{ data: MarketListing[] | null; error: Error | null }> => {
      return marketRepository.getMarketListings(filters);
    },
    [marketRepository]
  );

  /**
   * Get price trends for a crop
   */
  const getPriceTrends = useCallback(
    async (
      cropIdentifier: string,
      period: 'daily' | 'weekly' | 'monthly' = 'weekly',
      daysBack: number = 30
    ): Promise<{ data: PriceTrend | null; error: Error | null }> => {
      return marketRepository.getPriceTrends(cropIdentifier, period, daysBack);
    },
    [marketRepository]
  );

  /**
   * Get demand signals for a crop
   */
  const getDemandSignals = useCallback(
    async (
      cropIdentifier: string
    ): Promise<{ data: DemandSignal | null; error: Error | null }> => {
      return marketRepository.getDemandSignals(cropIdentifier);
    },
    [marketRepository]
  );

  /**
   * Create a new market listing as the current user
   */
  const createListing = useCallback(
    async (
      listing: Omit<
        MarketListing,
        'id' | 'created_at' | 'updated_at' | 'seller_id'
      >
    ): Promise<{ data: MarketListing | null; error: Error | null }> => {
      return marketRepository.createListingAsCurrentUser(listing);
    },
    [marketRepository]
  );

  return {
    // State
    marketData,
    isLoading,
    error,

    // Actions
    getMarketInsights,
    getMarketListings,
    getPriceTrends,
    getDemandSignals,
    createListing,
  };
};
