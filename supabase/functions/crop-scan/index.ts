
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In production, these would be secure environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'DEMO_KEY';
const PLANT_ID_API_KEY = Deno.env.get('PLANT_ID_API_KEY') || 'DEMO_KEY';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("Processing crop scan request");
    
    // In production we would:
    // 1. Call the Plant.id API to identify the plant and detect diseases
    // 2. Use Gemini Vision API to enhance the results with additional context
    // 3. Call the Agrio database for treatment recommendations
    
    // For now, we'll return a simulated response
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random confidence level between 92 and 98
    const confidenceLevel = 92 + Math.random() * 6;
    
    // Return simulated AI analysis results
    return new Response(
      JSON.stringify({
        diseaseDetected: "Late Blight (Phytophthora infestans)",
        confidenceLevel: confidenceLevel,
        severity: "medium",
        affectedArea: 35,
        recommendedTreatments: [
          "Apply copper-based fungicide within 24 hours",
          "Remove and destroy affected leaves to prevent spread",
          "Increase plant spacing to improve air circulation"
        ],
        preventiveMeasures: [
          "Use disease-resistant tomato varieties in next planting",
          "Rotate crops - avoid planting tomatoes in the same location for 2 years",
          "Apply preventive fungicide during wet seasons"
        ],
        similarCasesNearby: 8,
        estimatedYieldImpact: 28,
        treatmentProducts: [
          {name: "Agro-Copper Fungicide", price: "1,200 KES", effectiveness: 92, availability: "Available at Kilimo Stores (2.3km away)"},
          {name: "Organic Neem Extract", price: "850 KES", effectiveness: 76, availability: "Available at Green Farmer Market (4.1km away)"},
          {name: "Bio-Protection Spray", price: "1,450 KES", effectiveness: 88, availability: "Available online - delivery in 2 days"}
        ],
        additionalInfo: "Late blight is a water mold that primarily affects potatoes and tomatoes. It spreads quickly in cool, wet conditions.",
        source: "AI Crop Analysis (Gemini + Plant.id)",
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
    console.error("Error processing crop scan request:", error);
    
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
