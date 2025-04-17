
import React, { useEffect, useState } from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';
import ProUpgradeModal from './ProUpgradeModal';

interface ProEligibilityCheckProps {
  children: React.ReactNode;
  triggerType?: 'weather' | 'market' | 'yield' | 'standard';
  forceShow?: boolean;
}

const ProEligibilityCheck: React.FC<ProEligibilityCheckProps> = ({ 
  children,
  triggerType = 'standard',
  forceShow = false
}) => {
  const { user } = useAuth();
  const { memory, shouldShowProUpgrade, markProPromptShown } = useMemoryStore();
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    // Check if we should show the Pro modal
    const checkAndShowProModal = async () => {
      if (!user) return;
      
      // Show modal if forced or if memory indicates it's time
      if (forceShow || shouldShowProUpgrade()) {
        setShowProModal(true);
        await markProPromptShown();
      }
    };
    
    checkAndShowProModal();
  }, [user, forceShow]);

  // Check if the user is a Pro user with active subscription
  const isPro = memory.proStatus;

  // Check if they're on a trial
  const isOnTrial = isPro && memory.proExpirationDate && new Date(memory.proExpirationDate) > new Date();
  
  // Calculate days left in trial if applicable
  const daysLeftInTrial = isOnTrial && memory.proExpirationDate ? 
    Math.ceil((new Date(memory.proExpirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <>
      {children}
      
      {/* Pro upgrade modal */}
      <ProUpgradeModal 
        open={showProModal} 
        onOpenChange={setShowProModal}
        variant={triggerType} 
      />
    </>
  );
};

export default ProEligibilityCheck;
