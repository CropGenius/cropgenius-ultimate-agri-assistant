import React from 'react';
import Layout from '@/components/Layout';
import { CropHealthAnalyzer } from '@/components/crop-health/CropHealthAnalyzer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CropHealth: React.FC = () => {
  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-crop-green-700">Crop Health Analysis</h1>
          <p className="text-gray-600">Upload a photo of your crop for AI-powered disease and pest detection</p>
        </div>
        
        <CropHealthAnalyzer />
      </div>
    </Layout>
  );
};

// Wrap the component with error boundary
export default function CropHealthWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CropHealth />
    </ErrorBoundary>
  );
} 