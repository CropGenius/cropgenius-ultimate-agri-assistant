// src/pages/FarmPlanningPage.tsx

import React from 'react';
import FarmPlanner from '../components/FarmPlanner';
// import MainLayout from '../layouts/MainLayout'; // Assuming a MainLayout exists for consistent page structure

const FarmPlanningPage: React.FC = () => {
  return (
    // <MainLayout title="AI Farm Planning">
    //   <FarmPlanner />
    // </MainLayout>
    // For now, without assuming MainLayout:
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>AI Farm Planning</h1>
        <p>Generate and manage your AI-powered farm plans.</p>
      </header>
      <FarmPlanner />
    </div>
  );
};

export default FarmPlanningPage;
