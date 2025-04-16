
import React, { useState, useEffect } from 'react';
import WelcomeBackCard from '@/components/welcome/WelcomeBackCard';
import GeniusBadge from '@/components/badges/GeniusBadge';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import InviteModal from '@/components/referrals/InviteModal';

const WelcomeSection = () => {
  const { memory, isInitialized } = useMemoryStore();
  const { user, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
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
      <div className="w-full mb-6 space-y-4">
        <Skeleton className="w-full h-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="w-full h-28 rounded-lg" />
          <Skeleton className="w-full h-28 rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Show welcome section for logged in users
  return showWelcome ? (
    <div className="w-full mb-6 space-y-4">
      <WelcomeBackCard />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Show badge if user has completed actions */}
        {memory.lastFieldCount > 0 && (
          <GeniusBadge type="smart_farmer" />
        )}
        
        {/* Invite friends card */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-blue-500 opacity-10" />
          
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invite Friends
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Get 7 days Pro access for each farmer who joins
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {memory.invitesSent ? `${memory.invitesSent} invited · ${memory.invitesSent * 7} days Pro` : 'No invites sent yet'}
              </div>
              <Button 
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                variant="secondary"
              >
                Invite & Get Pro
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <InviteModal 
        open={isInviteModalOpen} 
        onOpenChange={setIsInviteModalOpen} 
      />
    </div>
  ) : null;
};

export default WelcomeSection;
