import { supabase } from "@/services/supabaseClient";
import { z } from "zod";

// Zod schema for validating the ScanResult from the API
const treatmentProductSchema = z.object({
  name: z.string(),
  price: z.string(), // Assuming price might include currency symbols or text
  effectiveness: z.number(),
  availability: z.string(),
});

export const scanResultSchema = z.object({
  diseaseDetected: z.string(),
  confidenceLevel: z.number(),
  severity: z.enum(["low", "medium", "high", "critical"]), // Added "critical"
  affectedArea: z.number(),
  recommendedTreatments: z.array(z.string()),
  preventiveMeasures: z.array(z.string()),
  similarCasesNearby: z.number().optional(), // Made optional as it might not always be available
  estimatedYieldImpact: z.number().optional(), // Made optional
  treatmentProducts: z.array(treatmentProductSchema).optional(), // Made optional
  source: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(), // Validate as ISO datetime string
  additionalInfo: z.string().optional(),
  usingFallback: z.boolean().optional(),
  locationContext: z.object({ // Added locationContext
    region: z.string(),
    riskLevel: z.string(),
    spreadPotential: z.string(),
  }).optional(), // Made optional as fallback might not provide it
});

export type ScanResult = z.infer<typeof scanResultSchema>;


export const analyzeCropImage = async (
  imageFile: File,
  cropId?: string,
  location?: { lat: number; lng: number }
): Promise<ScanResult> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    console.log("Calling crop-scan edge function with payload:", { userId, cropId, location: location ? `${location.lat},${location.lng}`: undefined });
    const { data: apiResponse, error } = await supabase.functions.invoke('crop-scan', {
      body: {
        image: base64Image,
        userId, // Pass userId for RLS or logging if needed by function
        cropId, // Optional: pass cropId if available
        location: location ? `${location.lat},${location.lng}` : undefined, // Pass location as string "lat,lng"
      }
    });

    if (error) {
      console.error("Error calling crop-scan function:", error);
      // Attempt to parse Supabase Edge Function error for better message
      let detailedError = error.message;
      if (error.context && typeof error.context.body === 'string') {
        try {
            const parsedBody = JSON.parse(error.context.body);
            if(parsedBody.error) detailedError = parsedBody.error;
        } catch(e) { /* ignore parsing error */ }
      }
      throw new Error(detailedError);
    }

    console.log("Raw crop scan response from function:", apiResponse);
    const validationResult = scanResultSchema.safeParse(apiResponse);

    if (!validationResult.success) {
      console.error("Invalid scan result data from API:", validationResult.error.flatten());
      throw new Error("Invalid data structure received from crop scan API. Please contact support.");
    }
    
    return validationResult.data;

  } catch (error) {
    console.error("Error analyzing crop image:", error);
    // If Zod validation fails or any other error occurs during the primary attempt, use fallback.
    // The console will show the specific error (API error or Zod validation error).
    // if (error instanceof Error && error.message.startsWith("Invalid data structure")) {
    //     // Decide if this specific error should prevent fallback. For now, let it fallback.
    //     // throw error;
    // }

    console.warn("Using fallback crop analysis method due to error: ", error.message);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter fallback delay

    // Fallback data should also conform to the schema
    const fallbackData: ScanResult = {
      diseaseDetected: "Late Blight (Simulated Fallback)",
      confidenceLevel: 95.0,
      severity: "medium",
      affectedArea: 30,
      recommendedTreatments: [
        "Apply generic fungicide.",
        "Remove affected parts.",
      ],
      preventiveMeasures: [
        "Ensure good air circulation.",
        "Use certified seeds next season.",
      ],
      similarCasesNearby: 0, // Optional, so can be omitted or set to 0
      estimatedYieldImpact: 25, // Optional
      treatmentProducts: [], // Optional
      source: "AI Crop Analysis (Fallback Mode)",
      timestamp: new Date().toISOString(),
      usingFallback: true,
    };
    // Ensure fallback data is valid (optional, but good for dev)
    // scanResultSchema.parse(fallbackData);
    return fallbackData;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
