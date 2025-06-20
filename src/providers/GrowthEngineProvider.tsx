import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { toast } from 'sonner';
import { supabase } from '@/services/supabaseClient';
import OutOfCreditsModal from '@/components/growth/OutOfCreditsModal';
import LowCreditBanner from '@/components/growth/LowCreditBanner';
import OverdriveModal from '@/components/growth/OverdriveModal';
import { useAuthContext } from './AuthProvider';
import { captureEvent } from '@/analytics';

interface GrowthEngineContextType {
  registerAIUsage: () => void;
  inject_credit_modal: (state: 'out_of_credits' | 'low_credits') => void;
  trigger_referral_funnel: (userId: string) => void;
  activate_overdrive: (userId: string) => void;
}

const GrowthEngineContext = createContext<GrowthEngineContextType | undefined>(undefined);

export const useGrowthEngine = () => {
  const ctx = useContext(GrowthEngineContext);
  if (!ctx) throw new Error('useGrowthEngine must be used within GrowthEngineProvider');
  return ctx;
};

export const GrowthEngineProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const { balance } = useCredits();
  const [aiUsage, setAIUsage] = useState(0);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showLowBanner, setShowLowBanner] = useState(false);
  const [showOverdrive, setShowOverdrive] = useState(false);

  // === Helper Methods ===
  const logEvent = async (event: string, meta: Record<string, any> = {}) => {
    if (!user) return;
    await supabase.from('growth_log').insert({ user_id: user.id, event, meta });
    captureEvent(event, { user: user.id, ...meta });
  };

  const registerAIUsage = () => {
    setAIUsage((prev) => prev + 1);
  };

  // === State Trigger Effects ===
  useEffect(() => {
    if (!user) return;

    if (balance <= 0) {
      setShowOutModal(true);
      logEvent('out_of_credits');
    } else {
      setShowOutModal(false);
    }

    if (balance <= 2 && aiUsage > 0) {
      setShowLowBanner(true);
      logEvent('low_credits');
    } else {
      setShowLowBanner(false);
    }

    if (aiUsage >= 5 && !user?.user_metadata?.isPro) {
      setShowOverdrive(true);
      logEvent('overdrive_offer');
    }
  }, [balance, aiUsage, user]);

  // === Modular Public APIs ===
  const inject_credit_modal = (state: 'out_of_credits' | 'low_credits') => {
    if (state === 'out_of_credits') setShowOutModal(true);
    if (state === 'low_credits') setShowLowBanner(true);
  };

  const trigger_referral_funnel = async (userId: string) => {
    const shareLink = `${window.location.origin}?ref=${userId}`;
    await navigator.clipboard.writeText(shareLink);
    toast.success('Referral link copied! Share it to earn credits.');
    logEvent('referral_link_copied');
  };

  const activate_overdrive = async (userId: string) => {
    // In reality, hit Supabase function to grant trial credits or features
    toast.success('Overdrive activated for 24h!');
    logEvent('overdrive_activated');
  };

  const value: GrowthEngineContextType = {
    registerAIUsage,
    inject_credit_modal,
    trigger_referral_funnel,
    activate_overdrive,
  };

  return (
    <GrowthEngineContext.Provider value={value}>
      {children}
      {showOutModal && <OutOfCreditsModal onClose={() => setShowOutModal(false)} />}
      {showLowBanner && <LowCreditBanner credits={balance} />}
      {showOverdrive && <OverdriveModal onClose={() => setShowOverdrive(false)} />}
    </GrowthEngineContext.Provider>
  );
}; 