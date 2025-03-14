
import { supabase } from "@/integrations/supabase/client";

export type ChatCategory = "all" | "crops" | "diseases" | "machinery" | "market";

export interface ChatResponse {
  response: string;
  source: string;
  timestamp: string;
  usingFallback?: boolean;
}

export const fetchAIResponse = async (message: string, category: ChatCategory = "all"): Promise<string> => {
  try {
    console.log(`Sending message to AI in category: ${category}`);
    
    // Try to call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, category },
    });
    
    if (error) {
      console.error("Error calling AI chat function:", error);
      throw new Error(error.message);
    }
    
    console.log("AI Response:", data);
    
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
  // In production, this would call a translation API
  // For now, we'll return the original message for English and a placeholder for other languages
  if (targetLanguage === "en") {
    return message;
  }
  
  try {
    // Call translation service through Supabase function (to be implemented)
    // For now, return a message indicating translation would happen
    return `[Translated to ${targetLanguage}]: ${message}`;
  } catch (error) {
    console.error("Translation error:", error);
    return message; // Fallback to original message
  }
};
