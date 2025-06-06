// src/components/MarketInsightsDashboard.tsx

import React, { useState } from 'react';
import { useSmartMarketAgent } from '../hooks/agents/useSmartMarketAgent';
import { MarketDataInput, MarketListing } from '../agents/SmartMarketAgent';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, WifiOff, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import diagnostics from '../utils/diagnosticService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { MarketErrorBoundary } from './ErrorBoundary';

const MarketInsightsDashboard: React.FC = () => {
  // Use the specialized Smart Market Agent hook directly
  const {
    getMarketInsights,
    marketData,
    isLoading: isLoadingMarketData,
    error: marketDataError,
  } = useSmartMarketAgent();

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
      // Error is already handled in the hook's state (error)
      console.error('Market insights fetching failed:', error);
      diagnostics.logError(error, {
        source: 'MarketInsightsDashboard',
        operation: 'getMarketInsights',
        context: { cropType: cropTypeInput },
      });
    }
  };

  const isOffline = useOfflineStatus();

  // Offline fallback UI
  if (isOffline) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-yellow-500" />
            Offline Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You're currently offline. Market insights require an internet
            connection to retrieve the latest data.
          </p>
          <p className="text-sm text-muted-foreground">
            Previously cached market data may be available in the offline
            storage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <MarketErrorBoundary>
      <div className="space-y-6">
        <h2>Smart Market Insights</h2>

        <div className="mb-6 flex items-center gap-4">
          <div>
            <label htmlFor="cropTypeMarket" className="mr-2">
              Crop Type:
            </label>
            <Input
              type="text"
              id="cropTypeMarket"
              value={cropTypeInput}
              onChange={(e) => setCropTypeInput(e.target.value)}
              placeholder="e.g., Maize"
              className="py-2 pl-10 text-sm"
            />
          </div>
          {/* Optional Location Input for future enhancement 
          <div>
            <label htmlFor="locationMarket" className="mr-2">Location (Optional):</label>
            <Input 
              type="text" 
              id="locationMarket" 
              value={locationInput} 
              onChange={(e) => setLocationInput(e.target.value)} 
              placeholder="e.g., Nairobi"
              className="py-2 pl-10 text-sm"
            />
          </div>
          */}
          <Button
            onClick={handleFetchInsights}
            disabled={isLoadingMarketData}
            className="py-2 px-4 text-sm"
          >
            {isLoadingMarketData ? 'Fetching...' : 'Get Market Insights'}
          </Button>
        </div>

        {marketDataError && (
          <Card className="border-red-500 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-500">
                    Error retrieving market data
                  </p>
                  <p className="text-sm text-red-400">
                    {marketDataError.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {marketData && marketData.listings && (
          <div className="mt-6">
            <h4>Market Listings for {cropTypeInput.trim()}:</h4>
            {marketData.listings.length > 0 ? (
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableHeader>Crop</TableHeader>
                    <TableHeader>Price (KES/kg)</TableHeader>
                    <TableHeader>Quantity (kg)</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Listed Date</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketData.listings.map(
                    (listing: MarketListing, index: number) => (
                      <TableRow key={listing.id || index}>
                        <TableCell>{listing.crop_type}</TableCell>
                        <TableCell>{listing.price_per_kg_ksh}</TableCell>
                        <TableCell>{listing.quantity_kg}</TableCell>
                        <TableCell>{listing.location_text || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(listing.listing_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <p>No market listings found for the specified crop type.</p>
            )}

            {/* Placeholders for future analytics */}
            {marketData.priceTrends && (
              <div className="mt-6">
                <h4>Price Trends:</h4>
                <pre>{JSON.stringify(marketData.priceTrends, null, 2)}</pre>
              </div>
            )}
            {marketData.demandIndicator && (
              <div className="mt-6">
                <h4>Demand Indicator:</h4>
                <p>{marketData.demandIndicator}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MarketErrorBoundary>
  );
};

export default MarketInsightsDashboard;
