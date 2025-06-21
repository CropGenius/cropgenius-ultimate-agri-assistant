// src/agents/CropScanAgent.ts
import { uploadCropImage, UploadedFileResponse } from '../services/storageService';

/**
 * @file CropScanAgent.ts
 * @description Handles crop image analysis using Google Gemini Vision API.
 * Includes functionalities for sending images for analysis, processing results,
 * and saving scan data to Supabase.
 */

import { supabase } from '../services/supabaseClient';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Gemini Vision API endpoint supporting multimodal (image+text) requests
const GEMINI_VISION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

// --- Interface Definitions ---

export interface CropScanInput {
  imageFile?: File; // For direct file upload
  imageBase64?: string; // For when image is already base64 encoded
  farmId: string;
  fieldId: string;
  userId: string;
  latitude?: number;
  longitude?: number;
}

export interface GeminiVisionRequestPayload {
  contents: [
    {
      parts: (
        | { text: string }
        | { inline_data: { mime_type: string; data: string } }
      )[];
    }
  ];
  // generationConfig?: { ... }; // Optional: Add generation config if needed
  // safetySettings?: { ... }; // Optional: Add safety settings if needed
}

// Define a more specific type for Gemini's response structure based on documentation
export interface GeminiVisionResponse {
  candidates?: {
    content?: {
      parts?: { text: string }[];
    };
    // finishReason?: string;
    // safetyRatings?: any[];
  }[];
  // promptFeedback?: any;
}

export interface ProcessedCropScanResult {
  imageUrl?: string; // URL from Supabase storage after upload
  diseaseDetected?: string | null;
  pestDetected?: string | null;
  nutrientDeficiency?: string | null;
  confidence?: number; // If provided by AI
  recommendations?: string;
  rawAiResponse: GeminiVisionResponse; // Store the full AI response for audit/future use
  latitude?: number;
  longitude?: number;
  scannedAt: Date;
}

// --- Helper Functions ---

// Function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Result is like "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
        // We need to strip the "data:mime/type;base64," part
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Function to convert File to base64 (if needed by API and not handled by SDK)









// --- Core Agent Functions ---

/**
 * Analyzes a crop image using Gemini Vision API.
 * Note: This function currently does not handle image upload to Supabase storage.
 * The imageBase64 should be provided directly.
 */
export const analyzeCropImage = async (
  imageBase64: string, 
  mimeType: string = 'image/jpeg', // e.g., 'image/png', 'image/jpeg'
  promptText: string = 'Analyze this crop image for diseases, pests, or nutrient deficiencies. Provide a summary of findings and actionable recommendations for a farmer in East Africa. If multiple issues are present, list them. If no issues are found, state that clearly.'
): Promise<GeminiVisionResponse> => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured.');
    throw new Error('Gemini API key is missing.');
  }
  if (!imageBase64) {
    throw new Error('Image data (base64) is required for analysis.');
  }

  const payload: GeminiVisionRequestPayload = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(GEMINI_VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errorData = await response.json();
        console.error('Gemini API Error Response:', errorData);
        // Accessing nested error message if available, common in Google API errors
        errorDetail = errorData.error?.message || errorData.message || response.statusText;
      } catch (e) {
        // If parsing errorData fails, use the original statusText
        console.error('Failed to parse Gemini API error response:', e);
      }
      throw new Error(`Gemini API request failed: ${response.status} - ${errorDetail}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in analyzeCropImage:', error);
    throw error;
  }
};

/**
 * Processes the raw response from Gemini into a structured format.
 * This is a placeholder and needs to be adapted based on actual Gemini response structure.
 */
/**
 * Processes the raw response from Gemini into a structured format.
 * IMPORTANT: This is a very basic parsing attempt. For production, it's highly recommended to:
 * 1. Prompt Gemini to return a structured JSON object directly.
 * 2. Or, use a more robust NLP library or series of prompts to extract entities accurately.
 * The current string splitting is fragile and likely to break with slight variations in Gemini's output.
 */
export const processGeminiResponse = (
  geminiResponse: GeminiVisionResponse
): Partial<ProcessedCropScanResult> => {
  const aiTextResponse = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis text found.';
  
  // Basic parsing - this needs to be much more sophisticated
  // Ideally, prompt Gemini to return structured JSON or use functions.
  let diseaseDetected: string | null = null;
  let pestDetected: string | null = null;
  let nutrientDeficiency: string | null = null;

  if (aiTextResponse.toLowerCase().includes('disease:')) {
    diseaseDetected = aiTextResponse.split('disease:')[1]?.split('\n')[0]?.trim();
  }
  if (aiTextResponse.toLowerCase().includes('pest:')) {
    pestDetected = aiTextResponse.split('pest:')[1]?.split('\n')[0]?.trim();
  }
  if (aiTextResponse.toLowerCase().includes('nutrient deficiency:')) {
    nutrientDeficiency = aiTextResponse.split('nutrient deficiency:')[1]?.split('\n')[0]?.trim();
  }

  return {
    diseaseDetected,
    pestDetected,
    nutrientDeficiency,
    recommendations: aiTextResponse, // For now, use the full text as recommendation
    rawAiResponse: geminiResponse,
  };
};

/**
 * Saves the processed crop scan result to Supabase.
 */
export const saveCropScanResult = async (
  scanData: Omit<ProcessedCropScanResult, 'scannedAt' | 'rawAiResponse'> & { 
    farmId: string; 
    fieldId: string; 
    userId: string; 
    rawAiResponse: any; // Storing raw response as JSONB
    imageUrl: string; // This MUST be the URL from Supabase Storage
  }
): Promise<any> => {
  const dbEntry = {
    field_id: scanData.fieldId,
    user_id: scanData.userId,
    image_url: scanData.imageUrl,
    scan_results: {
      disease_detected: scanData.diseaseDetected,
      pest_detected: scanData.pestDetected,
      nutrient_deficiency: scanData.nutrientDeficiency,
      recommendations: scanData.recommendations,
      // confidence: scanData.confidence, // Add if available
      raw_ai_response: scanData.rawAiResponse, // Store the full AI response
    },
    latitude: scanData.latitude,
    longitude: scanData.longitude,
    scanned_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('crop_scans').insert(dbEntry).select();
    if (error) {
      console.error('Supabase error saving crop scan data:', error);
      throw error;
    }
    console.log('Crop scan data saved to Supabase:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in saveCropScanResult:', error);
    throw error;
  }
};

/**
 * Main orchestrator function for performing a crop scan.
 * This function handles image upload, AI analysis, and saving results to the database.
 */
export const performCropScanAndSave = async (
  input: CropScanInput
): Promise<ProcessedCropScanResult & { id: string; imageUrl: string }> => {
  const { imageFile, imageBase64: inputBase64, userId, farmId, fieldId, latitude, longitude } = input;

  if (!userId || !farmId || !fieldId) {
    throw new Error('User ID, Farm ID, and Field ID are required to perform a crop scan.');
  }

  if (!imageFile && !inputBase64) {
    throw new Error('Either an imageFile or imageBase64 string must be provided.');
  }

  let uploadedImage: UploadedFileResponse | null = null;
  let base64ForAnalysis: string;
  let mimeType: string = 'image/jpeg'; // Default MIME type

  if (imageFile) {
    // 1. Upload image to Supabase Storage
    try {
      console.log(`Uploading image for user ${userId}, field ${fieldId}...`);
      uploadedImage = await uploadCropImage(imageFile, userId, { farmId, fieldId });
      console.log('Image uploaded successfully:', uploadedImage.publicUrl);
      mimeType = imageFile.type || mimeType; // Get MIME type from file if available
    } catch (uploadError) {
      console.error('Failed to upload crop image:', uploadError);
      throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
    }

    // 2. Convert file to base64 for Gemini API
    try {
      base64ForAnalysis = await fileToBase64(imageFile);
    } catch (base64Error) {
      console.error('Failed to convert image to base64:', base64Error);
      throw new Error(`Image processing failed: ${base64Error instanceof Error ? base64Error.message : String(base64Error)}`);
    }
  } else if (inputBase64) {
    base64ForAnalysis = inputBase64;
    // If only base64 is provided, we can't get the original file's MIME type easily.
    // Assume JPEG or allow it to be passed in CropScanInput if necessary.
    // Also, if only base64 is provided, we can't upload it to storage unless we reconstruct a File/Blob.
    // For now, this flow assumes if inputBase64 is used, imageUrl might be pre-existing or not applicable for this specific call.
    // However, our DB schema for crop_scans requires an image_url. So, this path needs careful consideration.
    // For a robust solution, if inputBase64 is primary, we might need to skip upload or require a separate imageUrl.
    // Let's enforce imageFile for now to ensure upload and consistent imageUrl.
    console.warn('Received base64 input directly. This flow path assumes image is already stored or URL is handled separately.');
    throw new Error('Direct base64 input without a File object is not fully supported for new scans requiring upload. Please provide an imageFile.');
  }
  else {
    throw new Error('Invalid input: No image data provided.'); // Should be caught by earlier check
  }

  if (!uploadedImage) {
      throw new Error('Image URL from storage is missing after upload attempt.');
  }

  // 3. Analyze image with Gemini
  let geminiResponse: GeminiVisionResponse;
  try {
    console.log('Sending image to Gemini for analysis...');
    // Consider making the prompt more dynamic or configurable if needed
    const prompt = `Analyze this crop image from a farm in East Africa. Identify potential diseases, pests, or nutrient deficiencies. Provide a concise summary of findings and actionable recommendations for the farmer. If multiple issues are present, list them clearly. If no significant issues are found, state that. Format the key findings (disease, pest, deficiency) clearly, for example: "Disease: Late Blight", "Pest: Aphids".`;
    geminiResponse = await analyzeCropImage(base64ForAnalysis, mimeType, prompt);
    console.log('Gemini analysis received.');
  } catch (analysisError) {
    console.error('Failed to analyze crop image with Gemini:', analysisError);
    throw new Error(`AI analysis failed: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`);
  }

  // 4. Process Gemini response
  const processedAiData = processGeminiResponse(geminiResponse);

  // 5. Save scan result to Supabase
  try {
    console.log('Saving crop scan result to Supabase...');
    const savedScan = await saveCropScanResult({
      ...processedAiData,
      farmId, // Already in scope
      fieldId,
      userId,
      imageUrl: uploadedImage.publicUrl, // Use the URL from Supabase Storage
      rawAiResponse: geminiResponse, // Storing the full response
      latitude,
      longitude,
    });
    console.log('Crop scan saved successfully, ID:', savedScan.id);
    return { ...savedScan, ...processedAiData, imageUrl: uploadedImage.publicUrl, scannedAt: new Date(savedScan.scanned_at) };
  } catch (dbError) {
    console.error('Failed to save crop scan result to Supabase:', dbError);
    throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
  }
};

console.log('CropScanAgent.ts loaded. Gemini API Key available:', !!GEMINI_API_KEY);
