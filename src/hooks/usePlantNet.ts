import { supabase } from '@/services/supabaseClient';

export const usePlantNet = () => {
  const analyzePlant = async (imageUrl: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('disease_detection', {
          image_url: imageUrl,
          user_id: userId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing plant:', error);
      throw error;
    }
  };

  return { analyzePlant };
};
