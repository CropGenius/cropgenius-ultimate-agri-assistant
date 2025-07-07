/**
 * 🚀 CROPGENIUS APP - Trillion-Dollar Entry Point
 * iPhone 20 Pro level app with glassmorphism magic
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileLayout } from './components/mobile/MobileLayout';
import './App.css';

// React Query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className=\"App min-h-screen overflow-hidden\">
        <MobileLayout />
      </div>
    </QueryClientProvider>
  );
}

export default App;