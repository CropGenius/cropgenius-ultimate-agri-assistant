/**
 * 🚀 CROPGENIUS APP - Trillion-Dollar Entry Point
 * iPhone 20 Pro level app with glassmorphism magic + offline intelligence
 */

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MobileLayout } from './components/mobile/MobileLayout';
import { setupOfflinePersistence, OfflineManager } from './lib/offlineStorage';
import './App.css';

// Enhanced React Query client with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});

setupOfflinePersistence(queryClient);

function App() {
  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    
    const unsubscribe = offlineManager.subscribe((isOnline) => {
      if (isOnline) {
        queryClient.refetchQueries();
        console.log('🟢 Back online - syncing data...');
      } else {
        console.log('🔴 Offline mode - using cached data');
      }
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App min-h-screen overflow-hidden">
        <MobileLayout />
      </div>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;