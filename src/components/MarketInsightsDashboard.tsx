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
  } = useAIAgentHub();

  const [cropTypeInput, setCropTypeInput] = useState<string>('');
  // const [locationInput, setLocationInput] = useState<string>(''); // Optional for future use

  const handleFetchInsights = async () => {
    if (!cropTypeInput.trim()) {
      alert('Please enter a crop type.');
      return;
    }

    const input: Omit<MarketDataInput, 'userId' | 'farmId'> = {
      cropType: cropTypeInput.trim(),
      // location: locationInput.trim() || undefined, // If location becomes a direct input
    };

    try {
      await getMarketInsights(input);
    } catch (error) {
      // Error is already set in the hook's state (marketDataError)
      console.error('Market insights fetching failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Smart Market Insights</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <label htmlFor="cropTypeMarket" style={{ marginRight: '5px' }}>Crop Type:</label>
          <input 
            type="text" 
            id="cropTypeMarket" 
            value={cropTypeInput} 
            onChange={(e) => setCropTypeInput(e.target.value)} 
            placeholder="e.g., Maize"
            style={{ padding: '8px', minWidth: '200px' }}
          />
        </div>
        {/* Optional Location Input for future enhancement 
        <div>
          <label htmlFor="locationMarket" style={{ marginRight: '5px' }}>Location (Optional):</label>
          <input 
            type="text" 
            id="locationMarket" 
            value={locationInput} 
            onChange={(e) => setLocationInput(e.target.value)} 
            placeholder="e.g., Nairobi"
            style={{ padding: '8px' }}
          />
        </div>
        */}
        <button 
          onClick={handleFetchInsights} 
          disabled={isLoadingMarketData}
          style={{ padding: '8px 15px', fontSize: '16px', cursor: 'pointer' }}
        >
          {isLoadingMarketData ? 'Fetching...' : 'Get Market Insights'}
        </button>
      </div>

      {marketDataError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <p>Error fetching market insights: {marketDataError.message}</p>
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
