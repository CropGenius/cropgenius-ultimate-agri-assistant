// src/agents/AIFarmPlanAgent.ts

/**
 * @file AIFarmPlanAgent.ts
 * @description Agent for generating AI-driven farm plans and tasks using Gemini.
 */

import { supabase } from '../services/supabaseClient';
import { ProcessedCurrentWeather, ProcessedForecastItem } from './WeatherAgent';
import { MarketListing } from './SmartMarketAgent'; // For market context

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// --- Interface Definitions ---

export interface FarmTask {
  id?: string; // Optional: if stored and retrieved from DB
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string; // ISO date string
  category:
    | 'Planting'
    | 'Irrigation'
    | 'Fertilization'
    | 'PestControl'
    | 'Harvesting'
    | 'SoilPreparation'
    | 'Monitoring'
    | 'Other';
  status?: 'Pending' | 'InProgress' | 'Completed';
  assignedTo?: string; // Optional: user ID or name
  farmId?: string; // To link task to a farm
  fieldId?: string; // Optional: to link task to a specific field
  userId?: string; // User who owns or is assigned the task
}

export interface FarmPlanInput {
  farmId: string;
  userId: string;
  cropTypes: string[]; // e.g., ['Maize', 'Beans']
  currentSeason: string; // e.g., 'Long Rains 2024', 'Short Rains 2023'
  farmSizeAcres?: number;
  soilData?: any; // Simplified for now, could be { ph: number, organicMatter: number, ... }
  weatherContext?: {
    current?: ProcessedCurrentWeather | null;
    forecast?: ProcessedForecastItem[] | null;
  };
  marketContext?: {
    relevantListings?: MarketListing[];
    // Future: priceTrends, demandSignals
  };
  userGoals?: string[]; // e.g., ['Maximize yield', 'Improve soil health', 'Minimize water usage']
  // Add other relevant farm-specific data
}

export interface FarmPlanOutput {
  planSummary: string;
  tasks: FarmTask[];
  suggestedPlantingDates?: Record<string, string>; // cropType: ISO date string
  resourceWarnings?: string[]; // e.g., ['Low water availability expected', 'High pest pressure for Maize']
  rawGeminiResponse?: any; // For debugging and audit
}

// --- Helper: Build Prompt for Gemini ---
const buildFarmPlanPrompt = (input: FarmPlanInput): string => {
  let prompt = `As an expert agronomist and farm manager for a farm in East Africa, generate a comprehensive and actionable farm plan.
  Farm ID: ${input.farmId}\nUser ID: ${input.userId}\nCrop(s) of Interest: ${input.cropTypes.join(', ')}\nCurrent Season: ${input.currentSeason}\n`;

  if (input.farmSizeAcres)
    prompt += `Farm Size: ${input.farmSizeAcres} acres\n`;
  if (input.userGoals && input.userGoals.length > 0)
    prompt += `User Goals: ${input.userGoals.join(', ')}\n`;

  if (input.soilData) {
    prompt += `Soil Data: ${JSON.stringify(input.soilData)}\n`;
  }
  if (input.weatherContext?.current) {
    prompt += `Current Weather: ${input.weatherContext.current.weatherDescription}, Temp: ${input.weatherContext.current.temperatureCelsius}°C\n`;
  }
  if (
    input.weatherContext?.forecast &&
    input.weatherContext.forecast.length > 0
  ) {
    const nextForecast = input.weatherContext.forecast[0];
    prompt += `Next Day Forecast: ${nextForecast.weatherDescription}, Max Temp: ${nextForecast.tempMaxCelsius}°C, Min Temp: ${nextForecast.tempMinCelsius}°C\n`;
  }
  if (
    input.marketContext?.relevantListings &&
    input.marketContext.relevantListings.length > 0
  ) {
    const topListing = input.marketContext.relevantListings[0];
    prompt += `Market Context Example (${topListing.crop_type}): Price KES ${topListing.price_per_kg_ksh}/kg, Quantity ${topListing.quantity_kg}kg listed on ${topListing.listing_date}.\n`;
  }

  prompt += `\nPlease provide:
1. A brief Plan Summary (2-3 sentences).
2. A list of prioritized Tasks for the next 1-2 weeks. For each task, specify: title, description, priority (High, Medium, Low), category (e.g., Planting, Irrigation, PestControl, SoilPreparation, Monitoring), and an estimated due date if applicable.
3. Suggested Planting Dates for each crop, if it's planting season.
4. Any Resource Warnings based on the provided context (e.g., water, pest pressure).

Format the tasks as a JSON array of objects. Each task object should have 'title', 'description', 'priority', 'category', and 'dueDate' (optional ISO string) keys.
Example Task JSON: 
[{"title": "Prepare Field A for Maize", "description": "Clear debris and till the soil.", "priority": "High", "category": "SoilPreparation", "dueDate": "2024-03-15"}]
Ensure the entire response is a single JSON object with keys: 'planSummary', 'tasks' (JSON array as described), 'suggestedPlantingDates' (object), and 'resourceWarnings' (array of strings).
`;
  return prompt;
};

// --- Core Agent Functions ---

/**
 * Generates a farm plan using Gemini API.
 */
export const generateFarmPlan = async (
  input: FarmPlanInput
): Promise<FarmPlanOutput> => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured.');
    throw new Error('Gemini API key is missing.');
  }

  const prompt = buildFarmPlanPrompt(input);
  console.log('Generating Farm Plan with Gemini. Prompt:', prompt);

  const requestPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    // Optional: Add generationConfig for temperature, topK, topP etc.
    // generationConfig: {
    //   temperature: 0.7,
    //   topK: 40,
    //   topP: 0.95,
    //   maxOutputTokens: 2048, // Adjust as needed
    // },
    // Optional: Add safetySettings
    // safetySettings: [ { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE'} ]
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // Try to parse error, but don't fail if it's not JSON
      console.error('Gemini API Error Response:', errorData);
      const errorMessage =
        errorData?.error?.message ||
        response.statusText ||
        'Gemini API request failed';
      throw new Error(
        `Gemini API request failed: ${response.status} - ${errorMessage}`
      );
    }

    const geminiResponse = await response.json();
    const rawTextResponse =
      geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawTextResponse) {
      console.error('No text response from Gemini:', geminiResponse);
      throw new Error(
        'Failed to get a valid response from Gemini for farm plan.'
      );
    }

    // Attempt to parse the JSON from the response
    // Gemini should be prompted to return a single JSON object as specified.
    try {
      const parsedResponse: FarmPlanOutput = JSON.parse(rawTextResponse);
      // Validate structure a bit
      if (!parsedResponse.planSummary || !Array.isArray(parsedResponse.tasks)) {
        console.error(
          'Parsed Gemini response lacks expected structure:',
          parsedResponse
        );
        throw new Error('Gemini response JSON structure is invalid.');
      }
      return { ...parsedResponse, rawGeminiResponse: geminiResponse };
    } catch (parseError) {
      console.error(
        'Failed to parse Gemini JSON response for farm plan:',
        parseError
      );
      console.error('Raw Gemini text response was:', rawTextResponse);
      // Fallback or more sophisticated error handling might be needed here.
      // For now, re-throw, or try to extract parts if possible.
      throw new Error('Failed to parse farm plan JSON from Gemini response.');
    }
  } catch (error) {
    console.error('Error in generateFarmPlan:', error);
    throw error;
  }
};

// --- Placeholder for saving plan/tasks to Supabase ---
export const saveFarmPlanAndTasks = async (
  plan: FarmPlanOutput,
  input: FarmPlanInput
): Promise<void> => {
  console.log(
    'Attempting to save farm plan and tasks for farm:',
    input.farmId,
    'user:',
    input.userId
  );
  // 1. Save the overall plan (if you have a farm_plans table)
  // 2. Save individual tasks to the 'tasks' table
  if (plan.tasks && plan.tasks.length > 0) {
    const tasksToInsert = plan.tasks.map((task) => ({
      ...task,
      farm_id: input.farmId,
      user_id: input.userId, // Or specific assignee if logic changes
      status: task.status || 'Pending',
      // Ensure all required fields for 'tasks' table are present
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();
    if (error) {
      console.error('Supabase error saving tasks:', error);
      throw error;
    }
    console.log('Tasks saved to Supabase:', data);
  } else {
    console.log('No tasks to save for this plan.');
  }
  // Add logic for saving plan summary if needed
};

console.log('AIFarmPlanAgent.ts loaded');
