
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In production, we would use these API keys securely from environment variables
// const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY'); 
// const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, category } = await req.json();
    
    console.log(`Processing AI chat request in category: ${category}`);
    console.log(`User message: ${message}`);
    
    // In production, this would call the appropriate AI model API
    // For now, we'll just simulate a response
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample responses for different categories
    const responses = {
      'all': "Based on my agricultural database, your question about general farming practices suggests that crop rotation would be beneficial in your case. Alternating crops helps break pest cycles and improves soil health naturally.",
      'crops': "For optimal crop management in your climate zone, I recommend spacing maize plants 75cm between rows and 30cm within rows. Apply nitrogen fertilizer as a top dressing when plants reach knee height for maximum yield.",
      'diseases': "The symptoms you've described match Tomato Late Blight (Phytophthora infestans). This fungal disease spreads rapidly in humid conditions. Apply copper-based fungicide immediately and ensure better airflow between plants.",
      'machinery': "For a farm your size, a walking tractor (two-wheel tractor) would be more cost-effective than a full tractor. Look for multipurpose models that can be fitted with different implements for plowing, harrowing, and transportation.",
      'market': "Current market data shows maize prices trending upward by 15% over the next month due to regional shortages. Consider holding your harvest for 3-4 weeks if storage conditions permit for potentially higher returns."
    };
    
    // Select response based on category, defaulting to 'all'
    const responseText = responses[category] || responses['all'];
    
    return new Response(
      JSON.stringify({ 
        response: responseText,
        source: "AI Agricultural Assistant",
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing AI chat request:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process your request. Please try again." }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
