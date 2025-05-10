
import { z } from "zod";

// Safe field input schema with improved auto-correction and validation
export const safeFieldInputSchema = z.object({
  name: z.string()
    .min(1, "Field name required")
    .max(100, "Field name too long")
    .transform((val) => {
      // Sanitize: remove emojis, control chars, and dangerous symbols
      const sanitized = val
        .replace(/[^\p{L}\p{N}\p{Z}\p{P}]/gu, '') // Remove emojis and special chars
        .replace(/[^\w\s'-]/g, "") // Keep only alphanumeric, spaces, hyphens, apostrophes
        .trim();
      return sanitized || "Untitled Field";
    }),
  
  size: z.coerce.number()
    .min(0.01, "Area must be greater than 0")
    .max(5000, "Area too large (max 5000)")
    .catch(1.0), // Default to 1 if invalid
  
  size_unit: z.string()
    .default("hectares")
    .transform(val => {
      // Normalize size units
      const validUnits = ["hectares", "acres", "square_meters"];
      return validUnits.includes(val) ? val : "hectares";
    }),

  boundary: z.any().optional().catch(null),
  
  location: z.any().optional().catch(null),
  
  crop_type: z.string()
    .min(1, "Crop type required")
    .max(50, "Crop name too long")
    .transform(val => val?.trim() || "Unknown Crop")
    .catch("Unknown Crop"),
  
  soil_type: z.string().optional()
    .transform(val => val?.trim() || null)
    .catch(null),

  irrigation_type: z.string().optional()
    .transform(val => val?.trim() || null)
    .catch(null),

  location_description: z.string().optional()
    .transform(val => val?.trim() || null)
    .catch(null),
});

// Enhanced sanitization function with more comprehensive cleaning
export function sanitizeFieldData(rawData: any) {
  // Handle completely null/undefined input
  if (!rawData) {
    return {
      name: "Untitled Field",
      size: 1.0,
      size_unit: "hectares",
      boundary: null,
      location: null,
      crop_type: "Unknown Crop",
      soil_type: null,
      irrigation_type: null,
      location_description: null,
    };
  }

  // Sanitize text fields to handle special characters
  const sanitizeName = (name: any): string => {
    if (!name) return "Untitled Field";
    
    // Convert to string, remove emojis and dangerous characters
    return String(name)
      .replace(/[^\p{L}\p{N}\p{Z}\p{P}]/gu, '')  // Remove emojis and special chars
      .replace(/[^\w\s'-]/g, "")  // Keep only alphanumeric, spaces, hyphens, apostrophes
      .trim() || "Untitled Field";
  };

  const sanitizeSize = (size: any): number => {
    const num = Number(size);
    if (isNaN(num) || num <= 0) return 1.0;
    return Math.min(Math.max(num, 0.01), 5000); // Clamp between 0.01 and 5000
  };
  
  const sanitizeSizeUnit = (unit: any): string => {
    const validUnits = ["hectares", "acres", "square_meters"];
    return validUnits.includes(String(unit)) ? String(unit) : "hectares";
  };

  const sanitizeString = (str: any, defaultVal: string | null = null): string | null => {
    if (str === undefined || str === null) return defaultVal;
    return String(str).trim() || defaultVal;
  };
  
  return {
    name: sanitizeName(rawData.name),
    size: sanitizeSize(rawData.size),
    size_unit: sanitizeSizeUnit(rawData.size_unit),
    boundary: rawData.boundary || null,
    location: rawData.location || null,
    crop_type: sanitizeString(rawData.crop_type, "Unknown Crop"),
    soil_type: sanitizeString(rawData.soil_type),
    irrigation_type: sanitizeString(rawData.irrigation_type),
    location_description: sanitizeString(rawData.location_description),
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

// Helper function to check online status
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Function to verify farm ownership or create a new farm if needed
export const verifyOrCreateFarm = async (supabase: any, userId: string): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  try {
    // Try to get user's existing farms
    const { data, error } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
      
    // If farm exists, return it
    if (data?.id) {
      return data.id;
    }
    
    // No farm found or error, create a new default farm
    console.log("No farm found for user, creating default farm");
    const { data: newFarm, error: createError } = await supabase
      .from('farms')
      .insert({
        name: 'My Farm',
        user_id: userId,
        size_unit: 'hectares'
      })
      .select()
      .single();
      
    if (createError || !newFarm?.id) {
      console.error("Failed to auto-create fallback farm:", createError?.message);
      
      // Last resort - generate a temporary farm ID to avoid blocking the user
      return `temp-farm-${Date.now()}`;
    }
    
    return newFarm.id;
  } catch (error) {
    console.error("Error in farm ownership verification:", error);
    // Never block the user - return a temporary farm ID
    return `temp-farm-${Date.now()}`;
  }
};
