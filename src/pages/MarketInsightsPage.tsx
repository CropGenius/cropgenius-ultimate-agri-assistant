// src/pages/MarketInsightsPage.tsx

import { FC } from 'react';
import MarketInsightsDashboard from '../components/MarketInsightsDashboard';
// import MainLayout from '../layouts/MainLayout'; // Assuming a MainLayout exists

const MarketInsightsPage: FC = () => {
  return (
    // <MainLayout title="Smart Market Insights">
    //   <MarketInsightsDashboard />
    // </MainLayout>
    // For now, without assuming MainLayout:
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>Smart Market Insights</h1>
        <p>Access real-time market data and trends for your crops.</p>
      </header>
      <MarketInsightsDashboard />
    </div>
  );
};

export default MarketInsightsPage;
