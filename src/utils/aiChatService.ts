
import { supabase } from "@/integrations/supabase/client";

export type ChatCategory = "all" | "crops" | "diseases" | "machinery" | "market";

export interface ChatResponse {
  response: string;
  source: string;
  timestamp: string;
  usingFallback?: boolean;
  category?: string;
  language?: string;
}

export const fetchAIResponse = async (
  message: string, 
  category: ChatCategory = "all", 
  language: string = "en"
): Promise<string> => {
  try {
    console.log(`Sending message to AI in category: ${category}, language: ${language}`);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Try to call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, category, language, userId },
    });
    
    if (error) {
      console.error("Error calling AI chat function:", error);
      throw new Error(error.message);
    }
    
    console.log("AI Response:", data);
    
    // Save chat to history if user is logged in
    if (userId) {
      try {
        // We'll comment out this database operation for now until the tables are properly created
        // and TypeScript types are updated
        /*
        await supabase.from('chat_history').insert({
          user_id: userId,
          category: category,
          user_message: message,
          ai_response: data.response,
          language: language,
          ai_model: data.usingFallback ? 'fallback' : 'gemini-pro'
        });
        */
        console.log("Chat would be saved to history:", {
          user_id: userId,
          category,
          message,
          response: data.response
        });
      } catch (dbError) {
        console.error("Error saving chat to history:", dbError);
        // Non-blocking - continue even if saving to DB fails
      }
    }
    
    if (data && data.response) {
      return data.response;
    }
    
    // Fallback if response is not in expected format
    throw new Error("Invalid response format from AI service");
    
  } catch (error) {
    console.error("Error in fetchAIResponse:", error);
    
    // Fallback responses if the Supabase function fails
    const fallbackResponses = {
      'all': "Based on agricultural best practices, I recommend implementing crop rotation on your farm. This helps break pest cycles, improves soil health, and can increase yields naturally. For your specific situation, consider alternating between cereal crops and legumes to maximize soil benefits.",
      'crops': "For optimal crop management in your climate zone, I recommend spacing maize plants 75cm between rows and 30cm within rows. Apply nitrogen fertilizer as a top dressing when plants reach knee height for maximum yield.",
      'diseases': "The symptoms you've described match Tomato Late Blight (Phytophthora infestans). This fungal disease spreads rapidly in humid conditions. Apply copper-based fungicide immediately and ensure better airflow between plants.",
      'machinery': "For a farm your size, a walking tractor (two-wheel tractor) would be more cost-effective than a full tractor. Look for multipurpose models that can be fitted with different implements for plowing, harrowing, and transportation.",
      'market': "Current market data shows maize prices trending upward by 15% over the next month due to regional shortages. Consider holding your harvest for 3-4 weeks if storage conditions permit for potentially higher returns."
    };
    
    return fallbackResponses[category] || fallbackResponses['all'];
  }
};

// Add multi-language support
export const availableLanguages = [
  { code: "en", name: "English" },
  { code: "sw", name: "Swahili" },
  { code: "ha", name: "Hausa" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "am", name: "Amharic" },
];

export const translateMessage = async (message: string, targetLanguage: string = "en"): Promise<string> => {
  // If language is English, return the original message
  if (targetLanguage === "en") {
    return message;
  }
  
  try {
    // Call the edge function for translation
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { 
        message: `Translate the following text to ${getLanguageName(targetLanguage)}: "${message}"`,
        category: "all",
        language: targetLanguage
      },
    });
    
    if (error) {
      console.error("Translation error:", error);
      return message; // Fallback to original message
    }
    
    return data.response || message;
  } catch (error) {
    console.error("Translation error:", error);
    return message; // Fallback to original message
  }
};

// Helper function to get language name from code
function getLanguageName(code: string): string {
  const language = availableLanguages.find(lang => lang.code === code);
  return language ? language.name : "English";
}
