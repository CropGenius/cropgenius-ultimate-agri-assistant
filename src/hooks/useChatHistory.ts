import { supabase } from '@/services/supabaseClient';

export const useChatHistory = () => {
  const getChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  };

  const saveChatMessage = async (message: string, response: string, userId: string) => {
    try {
      const { error } = await supabase.from('chat_history').insert({
        user_id: userId,
        message,
        response,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  };

  return { getChatHistory, saveChatMessage };
};
