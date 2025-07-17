import React from 'react';
import MarketInsightsDashboard from '../components/MarketInsightsDashboard';
import ErrorBoundary from '@/components/error/ErrorBoundary';

const MarketInsightsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Smart Market Insights</h1>
          <p className="text-gray-600 mt-1">
            Access real-time market data, price trends, and AI-powered insights for your crops.
          </p>
        </div>
        <MarketInsightsDashboard />
      </div>
    </ErrorBoundary>
  );
};

export default MarketInsightsPage;
