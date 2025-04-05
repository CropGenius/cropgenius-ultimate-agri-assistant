
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image, userId, cropId, location } = await req.json();
    console.log(`Processing crop scan for user ${userId || "anonymous"}`);
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a scan result (in a real implementation, this would come from an image analysis model)
    const scanResult = {
      diseaseDetected: "Late Blight (Phytophthora infestans)",
      confidenceLevel: 96.8,
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
      source: "CROPGenius AI Analysis",
      timestamp: new Date().toISOString()
    };

    console.log(`Scan result generated: ${scanResult.diseaseDetected} with ${scanResult.confidenceLevel}% confidence`);
    
    return new Response(
      JSON.stringify(scanResult),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in crop scan function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        message: "Failed to analyze crop image. Please try again."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
