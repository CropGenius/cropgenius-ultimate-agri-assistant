import React from 'react';
import FarmPlanner from '../components/FarmPlanner';
import ErrorBoundary from '@/components/error/ErrorBoundary';

const FarmPlanningPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Farm Planning</h1>
          <p className="text-gray-600 mt-1">
            Generate and manage your AI-powered farm plans with intelligent task scheduling.
          </p>
        </div>
        <FarmPlanner />
      </div>
    </ErrorBoundary>
  );
};

export default FarmPlanningPage;
