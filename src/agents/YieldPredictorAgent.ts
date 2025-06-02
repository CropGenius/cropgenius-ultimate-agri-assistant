// src/agents/YieldPredictorAgent.ts
import { supabase } from '../services/supabaseClient';
import { ProcessedCurrentWeather, ProcessedForecastItem } from './WeatherAgent'; // Assuming ProcessedForecastItem is exported
import { ProcessedCropScanResult } from './CropScanAgent';

// Core types for yield prediction
export interface YieldPredictionInput {
  fieldId: string;
  cropType: string;
  plantingDate: Date;
  historicalYield?: number | null;
  soilData?: {
    ph?: number;
    organicMatter?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  } | null;
  weatherData: {
    current: ProcessedCurrentWeather | null; // Can be null if not available
    forecast: ProcessedForecastItem[] | null; // Can be null
  };
  cropHealth?: {
    latestScan: ProcessedCropScanResult | null;
    diseasePressure?: number; // 0-1 scale
    pestPressure?: number;    // 0-1 scale
  } | null;
  managementPractices?: {
    irrigation?: boolean;
    fertilizerApplied?: boolean;
    pestControl?: boolean;
  } | null;
  userId?: string; // For user-specific models or data, if applicable
  farmId?: string; // Optional: Unique identifier for the farm, if available and useful for context
}

export interface YieldPredictionResult {
  predictedYieldKgPerHa: number;
  confidenceScore: number;     // 0-1 scale
  keyFactors: {
    weatherImpact: string; // e.g., 'Positive', 'Neutral', 'Slightly Negative'
    soilImpact: string;
    healthImpact: string;
    managementImpact: string;
  };
  recommendations: string[];
  predictionDate: string; // ISO string for date of prediction
  harvestDateEstimate: string; // ISO string for estimated harvest date
  rawGeminiResponse?: any; // Optional: for debugging or advanced use cases
}

export interface StoredYieldPrediction extends YieldPredictionResult {
  id: string;
  fieldId: string;
  cropType: string;
  plantingDate: string; // ISO string
  createdAt: string;      // ISO string
  updatedAt: string;      // ISO string
  userId?: string;
}

// Cache for predictions to minimize API calls
const predictionCache = new Map<string, {
  timestamp: number;
  data: Promise<YieldPredictionResult>;
}>();

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const buildGeminiPrompt = (input: YieldPredictionInput): string => {
  // Enhanced prompt for more structured and reliable JSON output
  return `
    Analyze the provided agricultural data to predict crop yield for ${input.cropType}.
    The target region is East Africa, focusing on smallholder farm contexts.

    Input Data:
    - Field ID: ${input.fieldId}
    - Crop Type: ${input.cropType}
    - Planting Date: ${input.plantingDate.toISOString().split('T')[0]}
    - Historical Yield (kg/ha, if available): ${input.historicalYield ?? 'N/A'}
    - Soil Data (if available): pH ${input.soilData?.ph ?? 'N/A'}, Organic Matter ${input.soilData?.organicMatter ?? 'N/A'}%, NPK (${input.soilData?.nitrogen ?? 'N/A'}-${input.soilData?.phosphorus ?? 'N/A'}-${input.soilData?.potassium ?? 'N/A'})
    - Current Weather: Temp ${input.weatherData.current?.temperatureCelsius?.toFixed(1) ?? 'N/A'}°C, Humidity ${input.weatherData.current?.humidityPercent ?? 'N/A'}%, Desc ${input.weatherData.current?.weatherDescription ?? 'N/A'}
    - Weather Forecast (next 7 days summary):
        Avg Temp: ${input.weatherData.forecast ? (input.weatherData.forecast.reduce((sum, day) => sum + day.temperatureCelsius, 0) / input.weatherData.forecast.length).toFixed(1) : 'N/A'}°C
        Total Rain: ${input.weatherData.forecast ? input.weatherData.forecast.reduce((sum, day) => sum + (day.rainLastHourMm || 0), 0).toFixed(1) : 'N/A'}mm
    - Crop Health (if available): Disease ${input.cropHealth?.latestScan?.diseaseDetected ?? 'N/A'}, Pest ${input.cropHealth?.latestScan?.pestDetected ?? 'N/A'}, Nutrient Deficiency ${input.cropHealth?.latestScan?.nutrientDeficiency ?? 'N/A'}
        Disease Pressure (0-1): ${input.cropHealth?.diseasePressure ?? 'N/A'}
        Pest Pressure (0-1): ${input.cropHealth?.pestPressure ?? 'N/A'}
    - Management Practices (if available): Irrigation ${input.managementPractices?.irrigation ?? 'N/A'}, Fertilizer ${input.managementPractices?.fertilizerApplied ?? 'N/A'}, Pest Control ${input.managementPractices?.pestControl ?? 'N/A'}

    Output a JSON object with the following structure. Do NOT include any text outside this JSON object:
    {
      "predictedYieldKgPerHa": number, // Predicted yield in kilograms per hectare
      "confidenceScore": number, // Confidence in the prediction, from 0.0 (low) to 1.0 (high)
      "keyFactors": {
        "weatherImpact": "string", // e.g., "Positive", "Neutral", "Slightly Negative"
        "soilImpact": "string",
        "healthImpact": "string",
        "managementImpact": "string"
      },
      "recommendations": ["string"], // 2-3 actionable recommendations for yield improvement
      "predictionDate": "YYYY-MM-DD", // Today's date
      "harvestDateEstimate": "YYYY-MM-DD" // Estimated harvest date based on planting and crop type
    }
  `;
};

const callGeminiAPI = async (prompt: string): Promise<any> => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured');
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY.');
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3, // Slightly more creative but still grounded
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        // responseMimeType: "application/json", // Enable if supported and helps
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API error:', response.status, errorBody);
    throw new Error(`Gemini API request failed: ${response.status} ${errorBody}`);
  }
  const data = await response.json();
  if (data.promptFeedback && data.promptFeedback.blockReason) {
    console.error('Gemini API prompt blocked:', data.promptFeedback.blockReason, data.promptFeedback.safetyRatings);
    throw new Error(`Gemini API prompt blocked: ${data.promptFeedback.blockReason}`);
  }
  return data;
};

const parseGeminiResponse = (geminiResponse: any, input: YieldPredictionInput): YieldPredictionResult => {
  try {
    const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('No text in Gemini response:', geminiResponse);
      throw new Error('No text content in Gemini API response');
    }

    const jsonMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    const parsed = JSON.parse(jsonStr);

    // Basic validation
    if (typeof parsed.predictedYieldKgPerHa !== 'number' || 
        typeof parsed.confidenceScore !== 'number' ||
        !parsed.keyFactors || 
        !Array.isArray(parsed.recommendations)) {
      console.warn('Gemini response missing key fields, using defaults.', parsed);
      throw new Error('Invalid response format from Gemini, missing required fields.');
    }

    return {
      predictedYieldKgPerHa: Math.max(0, parsed.predictedYieldKgPerHa),
      confidenceScore: Math.max(0, Math.min(1, parsed.confidenceScore)),
      keyFactors: {
        weatherImpact: parsed.keyFactors.weatherImpact || 'Neutral',
        soilImpact: parsed.keyFactors.soilImpact || 'Neutral',
        healthImpact: parsed.keyFactors.healthImpact || 'Neutral',
        managementImpact: parsed.keyFactors.managementImpact || 'Neutral',
      },
      recommendations: parsed.recommendations.slice(0, 3), // Max 3 recommendations
      predictionDate: parsed.predictionDate || new Date().toISOString().split('T')[0],
      harvestDateEstimate: parsed.harvestDateEstimate || new Date(input.plantingDate.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Default 90 days
      rawGeminiResponse: import.meta.env.DEV ? geminiResponse : undefined, // Only include raw in dev
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error, 'Raw response:', geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text);
    // Fallback structure
    return {
      predictedYieldKgPerHa: 0,
      confidenceScore: 0.1,
      keyFactors: {
        weatherImpact: 'Uncertain',
        soilImpact: 'Uncertain',
        healthImpact: 'Uncertain',
        managementImpact: 'Uncertain',
      },
      recommendations: ['Could not parse prediction. Check input data and API response.'],
      predictionDate: new Date().toISOString().split('T')[0],
      harvestDateEstimate: new Date(input.plantingDate.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      rawGeminiResponse: import.meta.env.DEV ? geminiResponse : undefined,
    };
  }
};

export const generateYieldPrediction = async (
  input: YieldPredictionInput
): Promise<YieldPredictionResult> => {
  const cacheKey = JSON.stringify({
    fieldId: input.fieldId,
    cropType: input.cropType,
    date: new Date().toISOString().split('T')[0] // Daily cache key component
  });

  const cached = predictionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const prompt = buildGeminiPrompt(input);
  const predictionPromise = callGeminiAPI(prompt)
    .then(response => parseGeminiResponse(response, input))
    .catch(error => {
      console.error('Yield prediction pipeline error:', error);
      // Return a fallback error-state prediction
      return {
        predictedYieldKgPerHa: 0,
        confidenceScore: 0,
        keyFactors: { weatherImpact: 'Error', soilImpact: 'Error', healthImpact: 'Error', managementImpact: 'Error' },
        recommendations: ['Error generating prediction. Please try again.'],
        predictionDate: new Date().toISOString().split('T')[0],
        harvestDateEstimate: new Date(input.plantingDate.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      } as YieldPredictionResult;
    });

  predictionCache.set(cacheKey, {
    timestamp: Date.now(),
    data: predictionPromise
  });

  return predictionPromise;
};

export const saveYieldPrediction = async (
  predictionData: YieldPredictionInput, // Original input for context
  predictionResult: YieldPredictionResult
): Promise<StoredYieldPrediction> => {
  const { data, error } = await supabase
    .from('yield_predictions')
    .insert({
      field_id: predictionData.fieldId,
      user_id: predictionData.userId, // Assuming userId is passed in input
      crop_type: predictionData.cropType,
      planting_date: predictionData.plantingDate.toISOString(),
      predicted_yield_kg_per_ha: predictionResult.predictedYieldKgPerHa,
      confidence_score: predictionResult.confidenceScore,
      key_factors: predictionResult.keyFactors,
      recommendations: predictionResult.recommendations,
      prediction_date: predictionResult.predictionDate,
      harvest_date_estimate: predictionResult.harvestDateEstimate,
      // raw_gemini_response: predictionResult.rawGeminiResponse, // Consider if storing this is necessary/secure
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving yield prediction to Supabase:', error);
    throw new Error(`Failed to save yield prediction: ${error.message}`);
  }
  return data as StoredYieldPrediction;
};

export const getHistoricalYieldPredictions = async (
  fieldId: string,
  userId?: string,
  limit: number = 10
): Promise<StoredYieldPrediction[]> => {
  let query = supabase
    .from('yield_predictions')
    .select('*')
    .eq('field_id', fieldId)
    .order('prediction_date', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching historical yield predictions:', error);
    throw new Error(`Failed to fetch historical predictions: ${error.message}`);
  }
  return data as StoredYieldPrediction[];
};
