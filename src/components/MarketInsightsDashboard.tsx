// src/components/MarketInsightsDashboard.tsx

import React, { useState, useCallback } from 'react';
import { useAIAgentHub } from '../hooks/useAIAgentHub';
import { MarketDataInput, MarketListing } from '../agents/SmartMarketAgent';

const MarketInsightsDashboard: React.FC = () => {
  const {
    getMarketInsights,
    marketData,
    isLoadingMarketData,
    marketDataError,
    resetMarketData
  } = useAIAgentHub();

  const [cropTypeInput, setCropTypeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<string>('');

  const validateInput = (input: string): string | null => {
    if (!input.trim()) return 'Please enter a crop type';
    if (input.length < 2) return 'Crop type must be at least 2 characters';
    return null;
  };

  const handleFetchInsights = async () => {
    const validationError = validateInput(cropTypeInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      // Reset previous data
      resetMarketData();
      
      const input: Omit<MarketDataInput, 'userId' | 'farmId'> = {
        cropType: cropTypeInput.trim(),
      };

      await getMarketInsights(input);
      setLastSearch(cropTypeInput.trim());
    } catch (error: any) {
      setError(error.message || 'Failed to fetch market insights');
      console.error('Market insights fetching failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Smart Market Insights</h2>
        {isLoading && (
          <div className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
            <span className="text-sm text-muted-foreground">Processing...</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="cropTypeMarket" className="block text-sm font-medium text-muted-foreground mb-1">
            Crop Type:
          </label>
          <input 
            type="text" 
            id="cropTypeMarket" 
            value={cropTypeInput} 
            onChange={(e) => setCropTypeInput(e.target.value)} 
            placeholder="e.g., Maize"
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
        <button 
          onClick={handleFetchInsights} 
          disabled={isLoading || isLoadingMarketData}
          className={`px-4 py-2 rounded-md font-medium ${
            isLoading || isLoadingMarketData 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isLoading || isLoadingMarketData ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Fetching...
            </>
          ) : (
            'Get Market Insights'
          )}
        </button>
      </div>

      {marketDataError && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{marketDataError.message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoadingMarketData && (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      )}

      {marketData && marketData.listings && (
        <div style={{ marginTop: '20px' }}>
          <h4>Market Listings for {cropTypeInput.trim()}:</h4>
          {marketData.listings.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Crop</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price (KES/kg)</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantity (kg)</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Location</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Listed Date</th>
                  
                </tr>
              </thead>
              <tbody>
                {marketData.listings.map((listing: MarketListing, index: number) => (
                  <tr key={listing.id || index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.crop_type}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.price_per_kg_ksh}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.quantity_kg}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.location_text || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(listing.listing_date).toLocaleDateString()}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No market listings found for the specified crop type.</p>
          )}

          {/* Placeholders for future analytics */}
          {marketData.priceTrends && (
             <div style={{marginTop: '20px'}}>
                <h4>Price Trends:</h4>
                <pre>{JSON.stringify(marketData.priceTrends, null, 2)}</pre>
             </div>
          )}
          {marketData.demandIndicator && (
             <div style={{marginTop: '20px'}}>
                <h4>Demand Indicator:</h4>
                <p>{marketData.demandIndicator}</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketInsightsDashboard;
