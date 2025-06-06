// src/agents/AIChatAgent.ts

/**
 * @file AI Chat Agent for CropGenius
 * @description Provides intelligent conversational capabilities using Google's Gemini API
 * for both in-app chat and WhatsApp integration.
 */

import { supabase } from '../services/supabaseClient';

// Type definitions
export interface ChatMessage {
  id?: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
  context?: ChatContext;
}

export interface ChatContext {
  farmId?: string;
  fieldId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  weatherContext?: any;
  cropTypes?: string[];
  previousInteractions?: number;
}

export interface ChatResponse {
  content: string;
  followUpActions?: Array<{
    type: 'weather_check' | 'task_reminder' | 'crop_scan' | 'market_check';
    description: string;
  }>;
}

// Constants for Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generates an AI response to a user's chat message
 * @param userMessage The user's message
 * @param userId The user's ID
 * @param context Optional context about the user's farms, fields, etc.
 * @returns A promise that resolves to the AI response
 */
export const generateChatResponse = async (
  userMessage: string,
  userId: string,
  context?: ChatContext
): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return "I'm sorry, but I'm unable to respond right now. Please try again later.";
    }

    // Save the user message to the database
    const userMessageObj: ChatMessage = {
      user_id: userId,
      content: userMessage,
      role: 'user',
      created_at: new Date().toISOString(),
      context,
    };

    const { error: saveError } = await supabase
      .from('chat_logs')
      .insert(userMessageObj);

    if (saveError) {
      console.error('Error saving user message:', saveError);
    }

    // Get chat history for context
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
    }

    // Gather user-specific context for more personalized responses
    let userContext = await gatherUserContext(userId, context);

    // Build the prompt with all context
    const prompt = buildChatPrompt(
      userMessage,
      chatHistory?.reverse() || [],
      userContext
    );

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(
        `Gemini API error: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const responseData = await response.json();
    const aiResponseText =
      responseData.candidates[0]?.content?.parts[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    // Save the AI response to the database
    const aiMessageObj: ChatMessage = {
      user_id: userId,
      content: aiResponseText,
      role: 'assistant',
      created_at: new Date().toISOString(),
      context,
    };

    const { error: aiSaveError } = await supabase
      .from('chat_logs')
      .insert(aiMessageObj);

    if (aiSaveError) {
      console.error('Error saving AI response:', aiSaveError);
    }

    return aiResponseText;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "I'm sorry, but I encountered an error. Please try again later.";
  }
};

/**
 * Builds a comprehensive prompt for the AI with user context and chat history
 * @param userMessage The current user message
 * @param chatHistory Previous chat messages
 * @param userContext Additional context about the user
 * @returns A formatted prompt string
 */
const buildChatPrompt = (
  userMessage: string,
  chatHistory: ChatMessage[],
  userContext: any
): string => {
  // Start with the system context
  let prompt = `You are CropGenius, an intelligent farming assistant designed to help African farmers. 
You provide knowledgeable, practical advice about farming practices, crop management, weather interpretation, 
market insights, and general agricultural guidance. Be concise, clear, and practical in your responses.

CURRENT DATE: ${new Date().toISOString().split('T')[0]}
`;

  // Add user-specific context if available
  if (userContext) {
    prompt += `\nUSER CONTEXT:
- Farms: ${userContext.farms?.map((f: any) => f.name).join(', ') || 'No farms found'}
- Main crops: ${userContext.crops?.join(', ') || 'Unknown'}
- Location: ${userContext.location || 'Unknown'}
- Current weather: ${userContext.currentWeather || 'Unknown'}
- Recent tasks: ${userContext.recentTasks || 'None recorded'}
`;
  }

  // Add chat history for context
  if (chatHistory.length > 0) {
    prompt += '\nCHAT HISTORY:\n';
    chatHistory.forEach((msg) => {
      prompt += `${msg.role === 'user' ? 'Farmer' : 'CropGenius'}: ${msg.content}\n`;
    });
  }

  // Add the current query
  prompt += `\nCurrent query from farmer: ${userMessage}\n\nCropGenius's response:`;

  return prompt;
};

/**
 * Gathers relevant context about the user to improve response quality
 * @param userId The user's ID
 * @param additionalContext Any additional context provided
 * @returns A context object with user information
 */
const gatherUserContext = async (
  userId: string,
  additionalContext?: ChatContext
): Promise<any> => {
  try {
    const context: any = {};

    // Get user's farms
    const { data: farms } = await supabase
      .from('farms')
      .select('id, name, location, latitude, longitude')
      .eq('user_id', userId);

    if (farms && farms.length > 0) {
      context.farms = farms;

      // Use the first farm for location context if no specific location provided
      if (
        !additionalContext?.location &&
        farms[0].latitude &&
        farms[0].longitude
      ) {
        context.location = `${farms[0].location || 'Unknown location'} (${farms[0].latitude.toFixed(2)}, ${farms[0].longitude.toFixed(2)})`;
      }
    }

    // Get user's fields and crops
    const { data: fields } = await supabase
      .from('fields')
      .select('id, name, area, current_crop')
      .eq('user_id', userId);

    if (fields && fields.length > 0) {
      context.fields = fields;

      // Extract unique crop types
      context.crops = [
        ...new Set(fields.map((f) => f.current_crop).filter(Boolean)),
      ];
    }

    // Get recent weather data
    if (farms && farms.length > 0) {
      const { data: weatherData } = await supabase
        .from('weather_data')
        .select('*')
        .eq('farm_id', farms[0].id)
        .eq('data_type', 'current')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (weatherData) {
        context.currentWeather = `${weatherData.temperature_celsius}°C, ${weatherData.weather_description}, ${weatherData.humidity_percent}% humidity`;
      }
    }

    // Get recent tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, priority, due_date')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('due_date', { ascending: true })
      .limit(3);

    if (tasks && tasks.length > 0) {
      context.recentTasks = tasks
        .map(
          (t) =>
            `${t.title} (${t.priority}, due: ${new Date(t.due_date).toLocaleDateString()})`
        )
        .join('; ');
    }

    // Merge with additional context if provided
    if (additionalContext) {
      return { ...context, ...additionalContext };
    }

    return context;
  } catch (error) {
    console.error('Error gathering user context:', error);
    return {};
  }
};

// Export the module
export default {
  generateChatResponse,
};
