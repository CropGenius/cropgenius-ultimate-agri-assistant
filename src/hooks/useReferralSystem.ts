import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReferralSystem = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ count: 0, credits: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReferralCode();
    loadReferralStats();
  }, []);

  const generateReferralCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setReferralCode(user.id.slice(0, 8).toUpperCase());
    }
  };

  const loadReferralStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    setReferralStats({
      count: data?.length || 0,
      credits: (data?.length || 0) * 10
    });
  };

  const processReferral = async (referredUserId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.functions.invoke('referral-credit', {
        body: { referrerId: user.id, referredId: referredUserId }
      });

      toast.success('Referral processed! Credits added.');
      loadReferralStats();
    } catch (error) {
      toast.error('Failed to process referral');
    } finally {
      setLoading(false);
    }
  };

  return {
    referralCode,
    referralStats,
    processReferral,
    loading
  };
};