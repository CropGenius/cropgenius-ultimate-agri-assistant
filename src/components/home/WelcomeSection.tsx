
import React, { useState, useEffect } from 'react';
import WelcomeBackCard from '@/components/welcome/WelcomeBackCard';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const WelcomeSection = () => {
  const { memory, isInitialized } = useMemoryStore();
  const { user, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Show welcome if user is logged in and memory is initialized
    if (!isLoading && user && isInitialized) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [user, isLoading, isInitialized]);
  
  // Don't show anything if not logged in
  if (!user) return null;
  
  // Show skeleton while loading
  if (!isInitialized || isLoading) {
    return (
      <div className="w-full mb-6">
        <Skeleton className="w-full h-48 rounded-lg" />
      </div>
    );
  }
  
  // Only show welcome card for logged in users
  return showWelcome ? (
    <div className="w-full mb-6">
      <WelcomeBackCard />
    </div>
  ) : null;
};

export default WelcomeSection;
