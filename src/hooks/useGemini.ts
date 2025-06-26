import { supabase } from '@/services/supabaseClient';

export const useGemini = () => {
  const generateTreatmentAdvice = async (plant: string, disease: string) => {
    try {
      const { data, error } = await supabase
        .rpc('ai_chat', {
          message: `What is the best treatment for ${disease} in ${plant}?`,
          category: 'treatment'
        });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Error generating treatment advice:', error);
      throw error;
    }
  };

  const generateMarketAdvice = async (crop: string, region: string) => {
    try {
      const { data, error } = await supabase
        .rpc('ai_chat', {
          message: `What is the current market situation for ${crop} in ${region}?`,
          category: 'market'
        });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Error generating market advice:', error);
      throw error;
    }
  };

  return { generateTreatmentAdvice, generateMarketAdvice };
};
