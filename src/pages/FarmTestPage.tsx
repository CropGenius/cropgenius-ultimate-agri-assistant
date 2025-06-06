import React from 'react';
import { FarmManagementTest } from '@/components/FarmManagementTest';
import { FarmProvider } from '@/hooks/useFarm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create a query client for the test page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function FarmTestPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Farm Management Test</h1>
          <FarmProvider>
            <FarmManagementTest />
          </FarmProvider>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default FarmTestPage;
