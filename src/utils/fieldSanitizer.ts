
import { z } from "zod";

// Safe field input schema with auto-correction hooks
export const safeFieldInputSchema = z.object({
  name: z.string()
    .min(1, "Field name required")
    .max(100)
    .transform((val) => val.replace(/[^a-zA-Z0-9\s'-]/g, "").trim() || "Untitled Field"),
  
  size: z.coerce.number()
    .min(0.01, "Area must be > 0")
    .max(5000, "Area too large")
    .catch(1.0), // Default to 1 if invalid

  size_unit: z.string()
    .default("hectares"),

  boundary: z.any().optional(),
  
  location: z.any().optional(),
  
  crop_type: z.string()
    .min(1, "Crop type required")
    .max(50)
    .catch("Unknown Crop"),
  
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  location_description: z.string().optional(),
});

// Sanitize field data regardless of schema validation
export function sanitizeFieldData(rawData: any) {
  return {
    name: rawData.name ? String(rawData.name).replace(/[^a-zA-Z0-9\s'-]/g, "").trim() || "Untitled Field" : "Untitled Field",
    size: Number(rawData.size) > 0 ? Number(rawData.size) : 1.0,
    size_unit: rawData.size_unit || "hectares",
    boundary: rawData.boundary || null,
    location: rawData.location || null,
    crop_type: rawData.crop_type || "Unknown Crop",
    soil_type: rawData.soil_type || null,
    irrigation_type: rawData.irrigation_type || null,
    location_description: rawData.location_description || null,
  };
}

// Log field errors without blocking
export async function logFieldError(supabase: any, userId: string, errorType: string, rawInput: any, errorDetails?: any) {
  try {
    await supabase.from("field_errors").insert([{ 
      user_id: userId, 
      error_type: errorType,
      raw_input: rawInput, 
      error_details: errorDetails,
      created_at: new Date().toISOString()
    }]);
  } catch (error) {
    // Silent failure - don't block main flow
    console.error("Error logging field error:", error);
  }
}
