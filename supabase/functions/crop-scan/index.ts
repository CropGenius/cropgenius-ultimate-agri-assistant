
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define common crop diseases by crop type for more realistic response generation
const cropDiseases = {
  tomato: [
    { name: "Late Blight", scientific: "Phytophthora infestans", severity: "high", treatments: ["copper-based fungicide", "remove affected leaves", "improve air circulation"] },
    { name: "Early Blight", scientific: "Alternaria solani", severity: "medium", treatments: ["neem oil", "crop rotation", "mulching"] },
    { name: "Septoria Leaf Spot", scientific: "Septoria lycopersici", severity: "medium", treatments: ["fungicide application", "remove lower leaves", "avoid overhead watering"] },
  ],
  maize: [
    { name: "Gray Leaf Spot", scientific: "Cercospora zeae-maydis", severity: "high", treatments: ["resistant varieties", "fungicide application", "crop rotation"] },
    { name: "Northern Corn Leaf Blight", scientific: "Exserohilum turcicum", severity: "medium", treatments: ["foliar fungicides", "resistant hybrids", "tillage practices"] },
    { name: "Common Rust", scientific: "Puccinia sorghi", severity: "low", treatments: ["fungicide sprays", "resistant varieties", "early planting"] },
  ],
  coffee: [
    { name: "Coffee Leaf Rust", scientific: "Hemileia vastatrix", severity: "high", treatments: ["copper fungicides", "shade management", "resistant varieties"] },
    { name: "Coffee Berry Disease", scientific: "Colletotrichum kahawae", severity: "high", treatments: ["copper-based fungicides", "pruning", "plant spacing"] },
    { name: "Brown Eye Spot", scientific: "Cercospora coffeicola", severity: "medium", treatments: ["balanced fertilization", "fungicides", "shade management"] },
  ],
  banana: [
    { name: "Panama Disease", scientific: "Fusarium oxysporum", severity: "critical", treatments: ["resistant varieties", "quarantine measures", "avoid infected soil"] },
    { name: "Black Sigatoka", scientific: "Mycosphaerella fijiensis", severity: "high", treatments: ["fungicide application", "leaf pruning", "proper spacing"] },
    { name: "Banana Bunchy Top", scientific: "Banana bunchy top virus", severity: "critical", treatments: ["aphid control", "remove infected plants", "use clean planting material"] },
  ]
};

// Common agricultural regions in Africa for more realistic location-based recommendations
const regions = {
  kenya: ["Central Highlands", "Rift Valley", "Western Region", "Eastern Region", "Nyanza Basin"],
  nigeria: ["Northern Region", "Middle Belt", "Southern Region", "Niger Delta"],
  tanzania: ["Northern Highlands", "Central Plateau", "Southern Highlands", "Eastern Lowlands"],
  uganda: ["Northern Region", "Central Region", "Western Region", "Eastern Region"],
  ethiopia: ["Highland Plateaus", "Great Rift Valley", "Western Lowlands", "Eastern Highlands"]
};

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
    const { image, userId, cropType = "unknown", location } = await req.json();
    console.log(`Processing crop scan for user ${userId || "anonymous"}, crop type: ${cropType}`);
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Simulate AI processing time with realistic variation
    const processingTime = Math.floor(Math.random() * 1000) + 1500; // 1.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Generate a realistic scan result based on crop type
    const availableCrops = Object.keys(cropDiseases);
    const detectedCrop = cropType !== "unknown" ? cropType : availableCrops[Math.floor(Math.random() * availableCrops.length)];
    const diseases = cropDiseases[detectedCrop as keyof typeof cropDiseases] || cropDiseases.tomato;
    
    // Select a disease with weighted probability (more severe diseases are less common)
    const selectDisease = () => {
      const severityWeights = { "low": 0.5, "medium": 0.3, "high": 0.15, "critical": 0.05 };
      let totalWeight = 0;
      
      diseases.forEach(disease => {
        totalWeight += severityWeights[disease.severity as keyof typeof severityWeights];
      });
      
      let random = Math.random() * totalWeight;
      let selected = diseases[0];
      
      for (const disease of diseases) {
        const weight = severityWeights[disease.severity as keyof typeof severityWeights];
        if (random < weight) {
          selected = disease;
          break;
        }
        random -= weight;
      }
      
      return selected;
    };
    
    const selectedDisease = selectDisease();
    const diseaseConfidence = 85 + Math.floor(Math.random() * 15); // 85-99%
    const affectedArea = Math.floor(Math.random() * 50) + 10; // 10-59%
    
    // Generate region-specific recommendations
    const country = location?.country || ["kenya", "nigeria", "tanzania", "uganda", "ethiopia"][Math.floor(Math.random() * 5)];
    const availableRegions = regions[country as keyof typeof regions] || regions.kenya;
    const region = availableRegions[Math.floor(Math.random() * availableRegions.length)];
    
    const getLocalStores = () => {
      const storeNames = [
        "AgriCare Center", "Kilimo Stores", "Farmers' Market", "Green Harvest Supplies",
        "Rural AgriTech", "Farm Solutions", "EcoFarm Products", "Organic Growth Center"
      ];
      
      return storeNames[Math.floor(Math.random() * storeNames.length)];
    };
    
    // Generate personalized treatment products with realistic pricing
    const treatmentProducts = selectedDisease.treatments.map(treatment => {
      const basePrice = Math.floor(Math.random() * 1200) + 600;
      const productName = `${treatment.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")} Solution`;
      const effectiveness = Math.floor(Math.random() * 20) + 75; // 75-95%
      const distance = Math.floor(Math.random() * 8) + 1; // 1-9 km
      
      return {
        name: productName,
        price: `${basePrice} KES`,
        effectiveness,
        availability: `Available at ${getLocalStores()} (${distance}.${Math.floor(Math.random() * 10)}km away)`
      };
    });
    
    // Generate nearby cases data based on disease severity
    const similarCasesNearby = selectedDisease.severity === "high" || selectedDisease.severity === "critical" ? 
      Math.floor(Math.random() * 20) + 10 : // 10-30 for high/critical
      Math.floor(Math.random() * 10) + 1;   // 1-10 for low/medium
    
    // Calculate estimated yield impact based on severity and affected area
    const severityMultiplier = { "low": 0.5, "medium": 1.0, "high": 1.5, "critical": 2.0 };
    const estimatedYieldImpact = Math.floor(affectedArea * severityMultiplier[selectedDisease.severity as keyof typeof severityMultiplier]);
    
    const scanResult = {
      diseaseDetected: `${selectedDisease.name} (${selectedDisease.scientific})`,
      confidenceLevel: diseaseConfidence,
      severity: selectedDisease.severity,
      affectedArea,
      recommendedTreatments: selectedDisease.treatments.map(treatment => 
        treatment.charAt(0).toUpperCase() + treatment.slice(1) + (Math.random() > 0.5 ? " within 48 hours" : "")
      ),
      preventiveMeasures: [
        `Use disease-resistant ${detectedCrop} varieties in next planting`,
        `Rotate crops - avoid planting ${detectedCrop} in the same location for 2-3 years`,
        "Maintain proper plant spacing for better air circulation",
        "Monitor soil pH and nutrient levels regularly",
        "Apply preventive measures before rainy seasons"
      ].sort(() => Math.random() - 0.5).slice(0, 3),
      similarCasesNearby,
      estimatedYieldImpact,
      treatmentProducts,
      locationContext: {
        region,
        riskLevel: selectedDisease.severity === "high" || selectedDisease.severity === "critical" ? "High" : "Moderate",
        spreadPotential: selectedDisease.severity === "high" || selectedDisease.severity === "critical" ? "Rapid" : "Gradual"
      },
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
