/**
 * 🚀 CROPGENIUS APP - Trillion-Dollar Entry Point
 * iPhone 20 Pro level app with glassmorphism magic + offline intelligence
 */

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { setupOfflinePersistence, OfflineManager } from './lib/offlineStorage';
import { AuthProvider } from './providers/AuthProvider';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Setup offline persistence
    setupOfflinePersistence(queryClient);
    
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
  }, [queryClient]);
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App min-h-screen overflow-hidden">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;