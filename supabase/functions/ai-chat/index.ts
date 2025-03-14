
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In production, we would use these API keys securely from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'DEMO_KEY'; 

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, category } = await req.json();
    
    console.log(`Processing AI chat request in category: ${category}`);
    console.log(`User message: ${message}`);
    
    // Call Gemini API for a realistic response
    let aiResponse;
    let usingFallback = false;
    
    try {
      // Set up context based on the category
      const contextByCategory = {
        all: "You are an agricultural AI assistant helping farmers with general farming questions.",
        crops: "You are a crop management specialist AI assisting farmers with detailed crop cultivation advice.",
        diseases: "You are a plant pathology expert AI helping farmers identify and treat crop diseases.",
        machinery: "You are a farm machinery expert AI assisting farmers with equipment selection and maintenance.",
        market: "You are an agricultural market analyst AI helping farmers with pricing and market trends."
      };
      
      const context = contextByCategory[category] || contextByCategory.all;
      const systemPrompt = `${context} Provide specific, actionable advice for farmers in Africa, with a focus on sustainable practices. Keep responses concise (max 150 words). Base answers on scientific agricultural knowledge.`;
      
      // Make the API request to Gemini
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiResponse = data.candidates[0].content.parts[0].text;
      } else {
        // If no valid response, throw an error to trigger fallback
        throw new Error("Invalid Gemini API response format");
      }
    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      usingFallback = true;
      
      // Fallback responses by category if API call fails
      const fallbackResponses = {
        'all': "Based on agricultural research, crop rotation is essential for soil health and pest management. For your farm size, consider dividing fields into 3-4 sections and rotating cereals, legumes, and other crops annually. This naturally breaks pest cycles and improves soil fertility without heavy chemical inputs, potentially increasing yields by 15-20% within two seasons.",
        'crops': "For optimal maize cultivation in your region, plant at 75cm between rows and 25-30cm within rows. Apply nitrogen fertilizer as a top dressing when plants reach knee height (V6-V8 stage), approximately 30-35 days after emergence. Given current rainfall patterns, consider drought-tolerant varieties like Katumani or SAWA. Intercropping with beans or cowpeas can maximize land use and add nitrogen to soil.",
        'diseases': "Your description suggests Tomato Late Blight (Phytophthora infestans). This fungal disease spreads rapidly in humid conditions above 90% and temperatures of 15-25°C. Immediately remove and destroy affected leaves, apply copper-based fungicide (Bordeaux mixture) every 7-10 days, and improve air circulation between plants. For prevention, use resistant varieties like 'Mountain Magic' and maintain proper plant spacing.",
        'machinery': "For a 2-5 hectare farm, a two-wheel tractor (12-15 HP) offers better cost-efficiency than a four-wheel tractor. The Kukje EF453T model (approximately 3,200 USD) provides excellent versatility with attachments for plowing, harrowing, and transportation. Maintenance costs average 200-250 USD annually with proper care. For smaller plots, consider the Amir walking tractor, which costs less but still handles multiple farm operations effectively.",
        'market': "Current maize prices are trending upward by 12-15% across East Africa markets due to lower regional production and increased demand. Based on five-year historical data, prices typically peak 3-4 months post-harvest. Consider storage if you have proper facilities, as projections indicate a potential 18-22% price increase within the next quarter. For immediate sales, target urban wholesale markets for 5-8% premium over local markets."
      };
      
      aiResponse = fallbackResponses[category] || fallbackResponses['all'];
    }
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        source: usingFallback ? "AI Agricultural Assistant (offline mode)" : "Gemini AI Agricultural Expert",
        timestamp: new Date().toISOString(),
        usingFallback: usingFallback
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
      JSON.stringify({ 
        error: "Failed to process your request. Please try again.", 
        details: error.message 
      }),
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
