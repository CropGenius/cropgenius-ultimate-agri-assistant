import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { LockKeyhole, Zap, Eye } from 'lucide-react';
import ProUpgradeModal from './ProUpgradeModal';

interface ProFeatureLockProps {
  children: React.ReactNode;
  feature: 'weather' | 'market' | 'yield' | 'standard';
  title?: string;
  description?: string;
}

const ProFeatureLock = ({ 
  children, 
  feature,
  title = 'Pro Feature',
  description = 'Unlock this premium feature with CROPGenius Pro'
}: ProFeatureLockProps) => {
  const { memory } = useMemoryStore();
  const [showContent, setShowContent] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Check if user is a Pro user with active subscription
  const isPro = memory.proStatus;
  
  // Check if they're on a trial
  const isOnTrial = isPro && memory.proExpirationDate && new Date(memory.proExpirationDate) > new Date();
  
  // Calculate days left in trial if applicable
  const daysLeftInTrial = isOnTrial && memory.proExpirationDate ? 
    Math.ceil((new Date(memory.proExpirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Check if trial expired
  const isTrialExpired = memory.proTrialUsed && !isOnTrial;

  // If they are on Pro or trial, show the content directly
  if (isPro || showContent) {
    return (
      <div className="relative">
        {/* Show the actual content */}
        {children}
        
        {/* If on trial, show days remaining */}
        {isOnTrial && (
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">
            {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} of Pro left
          </div>
        )}
      </div>
    );
  }
  
  // Otherwise, show the locked content
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/5 dark:bg-black/30 z-10 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg text-center max-w-sm">
          <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-3">
            <LockKeyhole className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="space-y-2">
            {isTrialExpired ? (
              <Button 
                onClick={() => setShowProModal(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button 
                onClick={() => setShowContent(true)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Feature
              </Button>
            )}
            
            {!isTrialExpired && (
              <Button 
                variant="outline"
                onClick={() => setShowProModal(true)}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Get Pro Access
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Show blurred content in background */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Pro upgrade modal */}
      <ProUpgradeModal 
        open={showProModal} 
        onOpenChange={setShowProModal} 
        variant={feature}
      />
    </Card>
  );
};

export default ProFeatureLock;
