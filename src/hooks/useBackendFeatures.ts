import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBackendFeatures = () => {
  const [features, setFeatures] = useState({
    whatsapp_bot: false,
    market_intelligence: false,
    yield_prediction: false,
    intelligence_hub: false,
    referral_system: false,
    credit_management: false,
    field_analysis: false,
    disease_oracle: false,
    ai_insights_cron: false
  });

  const activateAllFeatures = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const allFeatures = {
      whatsapp_bot: true,
      market_intelligence: true,
      yield_prediction: true,
      intelligence_hub: true,
      referral_system: true,
      credit_management: true,
      field_analysis: true,
      disease_oracle: true,
      ai_insights_cron: true,
      backend_access: true,
      pro_features: true,
      activation_date: new Date().toISOString()
    };

    await supabase.from('user_memory').upsert({
      user_id: user.id,
      memory_data: allFeatures
    });

    await supabase.functions.invoke('restore-credits', {
      body: { userId: user.id, amount: 1000, description: 'Backend activation bonus' }
    });

    setFeatures(allFeatures);
    return true;
  };

  useEffect(() => {
    const loadFeatures = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_memory')
        .select('memory_data')
        .eq('user_id', user.id)
        .single();

      if (data?.memory_data) {
        setFeatures(prev => ({ ...prev, ...data.memory_data }));
      }
    };
    loadFeatures();
  }, []);

  return { features, activateAllFeatures };
};