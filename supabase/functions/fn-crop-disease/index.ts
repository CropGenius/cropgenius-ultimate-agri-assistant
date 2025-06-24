// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Sentry from "https://deno.land/x/sentry/index.mjs";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// Note: Supabase client import might be needed if saving results to DB directly here.
// import { createClient } from '@supabase/supabase-js';

// --- Sentry Initialization ---
const sentryDsn = Deno.env.get("SENTRY_DSN");
if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn });
}

// --- Environment Variables & API Keys ---
const PLANTNET_API_KEY = Deno.env.get("PLANTNET_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// --- API Endpoints ---
const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify';
const GEMINI_VISION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Zod Schemas for Input and Output ---
const GeoLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  region: z.string().optional(),
  country: z.string().optional(),
});

const FnCropDiseaseInputSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required."),
  cropType: z.string().optional(),
  location: GeoLocationSchema.optional(),
});

const TreatmentProductSchema = z.object({
  name: z.string(),
  price: z.string(),
  effectiveness: z.number(),
  availability: z.string(),
});

const LocalSupplierSchema = z.object({
  name: z.string(),
  location: z.string(),
  distance_km: z.number(),
  contact: z.string(),
  products_available: z.array(z.string()),
  price_range: z.string(),
});

const FnCropDiseaseOutputSchema = z.object({
  disease_name: z.string(),
  scientific_name: z.string().optional(),
  confidence: z.number(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  affected_area_percentage: z.number().optional(),
  crop_type: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  immediate_actions: z.array(z.string()).optional(),
  preventive_measures: z.array(z.string()).optional(),
  recommended_products: z.array(z.string()).optional(),
  local_suppliers: z.array(LocalSupplierSchema).optional(),
  estimated_yield_impact: z.number().optional(),
  treatment_cost_estimate: z.number().optional(),
  recovery_timeline: z.string().optional(),
  similar_cases_nearby: z.number().optional(),
  source_api: z.enum(["plantnet", "gemini", "fallback", "unknown"]),
  timestamp: z.string().datetime({ offset: true }),
  locationContext: z.object({
    region: z.string(),
    riskLevel: z.string(),
    spreadPotential: z.string(),
  }).optional(),
});
type FnCropDiseaseOutput = z.infer<typeof FnCropDiseaseOutputSchema>;

// --- Placeholder for AFRICAN_CROPS_DISEASES (from CropDiseaseIntelligence.ts) ---
// This should be managed more robustly, e.g., from a DB table or a shared config file.
const AFRICAN_CROPS_DISEASES = {
  maize: { /* ... structure from original file ... */ },
  cassava: { /* ... */ },
  beans: { /* ... */ },
  // default or unknown crop type
  unknown: {
    common_diseases: ['General Leaf Spot', 'Root Rot'],
    treatments: {
      'General Leaf Spot': {
        immediate: ['Remove affected leaves', 'Ensure good air circulation'],
        preventive: ['Water at base of plant', 'Use disease-resistant varieties if known'],
        products: ['General fungicide']
      },
    }
  }
};


// --- Core Logic (Adapted from CropDiseaseIntelligence.ts) ---

async function detectDiseaseWithPlantNetLogic(
  imageBase64: string,
  cropType: string = "unknown",
  location?: z.infer<typeof GeoLocationSchema>
): Promise<FnCropDiseaseOutput> {
  if (!PLANTNET_API_KEY) {
    throw new Error('PlantNet API key is not configured for this function.');
  }

  const imageBlob = await fetch(`data:image/jpeg;base64,${imageBase64}`).then(r => r.blob());
  const formData = new FormData();
  formData.append('images', imageBlob, 'crop_image.jpg');
  // PlantNet API params might need adjustment based on their V2 API for crops
  // formData.append('organs', 'leaf'); // Example: specify organ if relevant

  const response = await fetch(`${PLANTNET_API_URL}/crops?api-key=${PLANTNET_API_KEY}`, { // Ensure URL is correct
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PlantNet API Error:", errorText);
    throw new Error(`PlantNet API error: ${response.status} - ${errorText}`);
  }

  const plantNetResult = await response.json(); // Define PlantNetResponse type if needed

  if (!plantNetResult.results || plantNetResult.results.length === 0) {
    throw new Error('No disease identification results from PlantNet');
  }

  const topResult = plantNetResult.results[0];
  const confidence = Math.round(topResult.score * 100);
  const detectedDiseaseName = topResult.species?.commonNames?.[0] || topResult.species?.scientificNameWithoutAuthor || "Unknown Disease";

  // Simplified processing for now, more details from original agent can be added
  const treatmentData = getTreatmentRecommendationsLogic(detectedDiseaseName, cropType, location);

  return {
    disease_name: detectedDiseaseName,
    scientific_name: topResult.species?.scientificNameWithoutAuthor,
    confidence: confidence,
    severity: calculateDiseaseSeverityLogic(confidence, cropType, detectedDiseaseName),
    crop_type: cropType,
    immediate_actions: treatmentData.immediate_actions,
    preventive_measures: treatmentData.preventive_measures,
    recommended_products: treatmentData.recommended_products,
    source_api: "plantnet",
    timestamp: new Date().toISOString(),
    // Other fields can be populated similarly or with more logic
    affected_area_percentage: estimateAffectedAreaLogic(confidence),
    estimated_yield_impact: calculateYieldImpactLogic(calculateDiseaseSeverityLogic(confidence, cropType, detectedDiseaseName), cropType),
    // ... more fields
  };
}

async function detectDiseaseWithGeminiLogic(
  imageBase64: string,
  cropType: string = "unknown",
  location?: z.infer<typeof GeoLocationSchema>
): Promise<FnCropDiseaseOutput> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured for this function.');
  }
  const prompt = `Analyze this ${cropType} crop image from ${location?.region || 'Africa'} for diseases. Provide: 1. Disease name. 2. Confidence (%). 3. Severity (low/medium/high/critical). Output as JSON: {"disease_name": "...", "confidence": ..., "severity": "..." ... other fields based on FnCropDiseaseOutputSchema if possible ...}.`;

  const response = await fetch(GEMINI_VISION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }] }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  const geminiResult = await response.json();
  const analysisText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!analysisText) {
    throw new Error("No analysis text from Gemini.");
  }

  // Basic parsing, ideally Gemini would return structured JSON matching the schema
  try {
    const parsedJson = JSON.parse(analysisText); // Assuming Gemini can be prompted for JSON
     return FnCropDiseaseOutputSchema.parse({ // Validate and coerce
        ...parsedJson,
        crop_type: cropType,
        source_api: "gemini",
        timestamp: new Date().toISOString(),
     });
  } catch (e) {
     console.error("Error parsing Gemini JSON response or validating schema:", e, analysisText);
     // Fallback parsing if Gemini doesn't return perfect JSON
     return {
        disease_name: analysisText.substring(0,100), // Placeholder
        confidence: 50,
        severity: "medium",
        crop_type: cropType,
        source_api: "gemini",
        timestamp: new Date().toISOString(),
     }
  }
}

// Helper functions (simplified versions from original agent)
function getTreatmentRecommendationsLogic(diseaseName: string, cropType: string, _location?: any) {
  const cropKey = cropType.toLowerCase() as keyof typeof AFRICAN_CROPS_DISEASES;
  const cropData = AFRICAN_CROPS_DISEASES[cropKey] || AFRICAN_CROPS_DISEASES.unknown;
  const treatment = cropData.treatments[diseaseName as keyof typeof cropData.treatments];
  if (treatment) {
    return {
      symptoms: [`Disease identified: ${diseaseName}`],
      immediate_actions: treatment.immediate,
      preventive_measures: treatment.preventive,
      recommended_products: treatment.products
    };
  }
  return { /* default recommendations */
    immediate_actions: ['Consult expert'],
    preventive_measures: ['Monitor closely'],
    recommended_products: ['General purpose treatment']
  };
}
function calculateDiseaseSeverityLogic(confidence: number, _cropType: string, _diseaseName: string): "low" | "medium" | "high" | "critical" {
  if (confidence >= 90) return 'critical';
  if (confidence >= 75) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}
function estimateAffectedAreaLogic(confidence: number): number { return Math.min(Math.round(confidence * 0.7), 100); }
function calculateYieldImpactLogic(severity: string, _cropType: string): number {
  const impactMap: any = { low: 5, medium: 15, high: 35, critical: 60 };
  return impactMap[severity] || 10;
}


// --- Main Handler ---
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawInput = await req.json();
    const validationResult = FnCropDiseaseInputSchema.safeParse(rawInput);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ success: false, error: validationResult.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const input = validationResult.data;
    let result: FnCropDiseaseOutput;

    try {
      console.log("Attempting PlantNet analysis...");
      result = await detectDiseaseWithPlantNetLogic(input.imageBase64, input.cropType, input.location);
    } catch (plantNetError) {
      console.warn("PlantNet failed, attempting Gemini fallback:", plantNetError.message);
      Sentry.captureException(plantNetError, { level: "warning", extra: { fallbackTo: "Gemini" } });
      try {
        result = await detectDiseaseWithGeminiLogic(input.imageBase64, input.cropType, input.location);
      } catch (geminiError) {
        console.error("Gemini fallback also failed:", geminiError.message);
        Sentry.captureException(geminiError, { level: "error", extra: { context: "Gemini fallback after PlantNet failure" } });
        // Final fallback if all APIs fail
        result = {
          disease_name: "Analysis Inconclusive",
          confidence: 0,
          severity: "low",
          crop_type: input.cropType || "unknown",
          source_api: "fallback",
          timestamp: new Date().toISOString(),
          immediate_actions: ["Unable to analyze image. Please ensure image is clear and try again. If issue persists, consult a local expert."],
        };
      }
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Unhandled error in fn-crop-disease:", error);
    Sentry.captureException(error);
    return new Response(JSON.stringify({ success: false, error: { message: error.message || "Internal server error." } }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
