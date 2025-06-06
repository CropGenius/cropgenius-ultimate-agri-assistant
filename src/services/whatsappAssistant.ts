// src/services/whatsappAssistant.ts

/**
 * @file WhatsApp Assistant Integration with Twilio
 * @description Provides two-way messaging capabilities for farmers via WhatsApp,
 * including automated alerts, notifications, and command processing.
 */

import { supabase } from './supabaseClient';
import { generateChatResponse } from '../agents/AIChatAgent';

// Twilio API configuration
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

// API endpoint for Twilio WhatsApp messaging
const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

// Interfaces for WhatsApp messaging
export interface WhatsAppMessage {
  phoneNumber: string; // Must include country code and be in E.164 format
  message: string;
  mediaUrl?: string[]; // Optional media attachments
  userId?: string; // If known, the CropGenius user ID
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface AlertConfig {
  alertType: 'weather' | 'task' | 'market' | 'crop' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  farmId?: string;
  fieldId?: string;
  cropType?: string;
  dueDate?: Date;
}

// Enum for command types that can be processed from incoming messages
enum CommandType {
  WEATHER = 'weather',
  TASKS = 'tasks',
  MARKET = 'market',
  HELP = 'help',
  SCAN = 'scan',
  FORECAST = 'forecast',
  UNKNOWN = 'unknown',
}

/**
 * Sends a WhatsApp message via Twilio API
 * @param messageData The message data to send
 * @returns A promise that resolves to the message response
 */
export const sendWhatsAppMessage = async (
  messageData: WhatsAppMessage
): Promise<MessageResponse> => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.error('Twilio configuration missing. Check environment variables.');
    return { success: false, error: 'Twilio configuration missing' };
  }

  try {
    // Format the data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
    formData.append('To', `whatsapp:${messageData.phoneNumber}`);
    formData.append('Body', messageData.message);

    // Add media URLs if present
    if (messageData.mediaUrl && messageData.mediaUrl.length > 0) {
      messageData.mediaUrl.forEach((url) => {
        formData.append('MediaUrl', url);
      });
    }

    // Send the message via Twilio API
    const response = await fetch(TWILIO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (response.ok) {
      // Log message in our database for analytics and history
      await logWhatsAppMessage({
        phone_number: messageData.phoneNumber,
        message_content: messageData.message,
        direction: 'outbound',
        user_id: messageData.userId || null,
        has_media: !!messageData.mediaUrl && messageData.mediaUrl.length > 0,
        message_sid: responseData.sid,
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: responseData.sid,
      };
    } else {
      console.error('Error sending WhatsApp message:', responseData);
      return {
        success: false,
        error: responseData.message || 'Failed to send WhatsApp message',
      };
    }
  } catch (error) {
    console.error('Exception in sendWhatsAppMessage:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error sending WhatsApp message',
    };
  }
};

/**
 * Processes an incoming WhatsApp message from a webhook
 * @param webhookData The webhook payload from Twilio
 * @returns The response to send back
 */
export const processIncomingMessage = async (
  webhookData: any
): Promise<string> => {
  try {
    const {
      From: from,
      Body: message,
      NumMedia: numMedia,
      MediaUrl0: mediaUrl,
      MessageSid: messageSid,
    } = webhookData;

    // Extract phone number from 'whatsapp:+1234567890' format
    const phoneNumber = from.replace('whatsapp:', '');

    // Check if this phone is associated with a user
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id, preferred_language')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error finding user by phone number:', userError);
    }

    // Log the incoming message
    await logWhatsAppMessage({
      phone_number: phoneNumber,
      message_content: message,
      direction: 'inbound',
      user_id: userData?.user_id || null,
      has_media: numMedia > 0,
      message_sid: messageSid,
      created_at: new Date().toISOString(),
    });

    // Parse the command from the message
    const command = parseCommand(message);

    // Generate a response based on the command
    let responseMessage: string;

    if (userData?.user_id) {
      // User is identified - personalize response
      switch (command.type) {
        case CommandType.WEATHER:
          responseMessage = await handleWeatherCommand(
            userData.user_id,
            command.params
          );
          break;
        case CommandType.TASKS:
          responseMessage = await handleTasksCommand(
            userData.user_id,
            command.params
          );
          break;
        case CommandType.MARKET:
          responseMessage = await handleMarketCommand(
            userData.user_id,
            command.params
          );
          break;
        case CommandType.SCAN:
          responseMessage =
            "To scan your crops, please use the CropGenius app and take a photo. I'll analyze it instantly.";
          break;
        case CommandType.HELP:
          responseMessage = getHelpMessage(userData.preferred_language || 'en');
          break;
        default:
          // For unknown commands, use the AI Chat to generate a response
          responseMessage = await generateChatResponse(
            message,
            userData.user_id
          );
      }
    } else {
      // User not identified - provide onboarding information
      responseMessage = getOnboardingMessage(command.type === CommandType.HELP);
    }

    return responseMessage;
  } catch (error) {
    console.error('Error processing incoming WhatsApp message:', error);
    return "I'm sorry, I couldn't process your message. Please try again later or contact support.";
  }
};

/**
 * Parse a command from a message
 * @param message The message text
 * @returns The command type and parameters
 */
const parseCommand = (
  message: string
): { type: CommandType; params: string[] } => {
  const normalizedMessage = message.trim().toLowerCase();

  // Basic command parsing logic
  if (normalizedMessage.startsWith('weather')) {
    return {
      type: CommandType.WEATHER,
      params: normalizedMessage.split(' ').slice(1),
    };
  } else if (normalizedMessage.startsWith('forecast')) {
    return {
      type: CommandType.FORECAST,
      params: normalizedMessage.split(' ').slice(1),
    };
  } else if (
    normalizedMessage.startsWith('tasks') ||
    normalizedMessage.startsWith('todo')
  ) {
    return {
      type: CommandType.TASKS,
      params: normalizedMessage.split(' ').slice(1),
    };
  } else if (
    normalizedMessage.startsWith('market') ||
    normalizedMessage.startsWith('prices')
  ) {
    return {
      type: CommandType.MARKET,
      params: normalizedMessage.split(' ').slice(1),
    };
  } else if (
    normalizedMessage.startsWith('help') ||
    normalizedMessage === '?'
  ) {
    return { type: CommandType.HELP, params: [] };
  } else if (normalizedMessage.startsWith('scan')) {
    return { type: CommandType.SCAN, params: [] };
  } else {
    return { type: CommandType.UNKNOWN, params: [] };
  }
};

/**
 * Handle a weather command
 * @param userId The user ID
 * @param params Command parameters
 * @returns Response message
 */
const handleWeatherCommand = async (
  userId: string,
  params: string[]
): Promise<string> => {
  try {
    // Get the user's farms
    const { data: farms, error: farmError } = await supabase
      .from('farms')
      .select('id, name, latitude, longitude')
      .eq('user_id', userId);

    if (farmError || !farms || farms.length === 0) {
      return "You don't have any farms registered. Please add a farm in the CropGenius app.";
    }

    // For simplicity, use the first farm if no specific farm is mentioned
    const farm = farms[0];

    // Get current weather data for the farm location
    const { data: weatherData, error: weatherError } = await supabase
      .from('weather_data')
      .select('*')
      .eq('farm_id', farm.id)
      .eq('data_type', 'current')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (weatherError || !weatherData) {
      return `I couldn't retrieve the latest weather for your farm "${farm.name}". Please check the app for details.`;
    }

    // Format weather information
    return (
      `*Current Weather for ${farm.name}*\n\n` +
      `🌡️ Temperature: ${weatherData.temperature_celsius}°C\n` +
      `💧 Humidity: ${weatherData.humidity_percent}%\n` +
      `🌬️ Wind: ${weatherData.wind_speed_mps} m/s\n` +
      `🌦️ Conditions: ${weatherData.weather_description}\n\n` +
      `Last updated: ${new Date(weatherData.recorded_at).toLocaleTimeString()}`
    );
  } catch (error) {
    console.error('Error handling weather command:', error);
    return "I'm having trouble getting the weather information right now. Please try again later.";
  }
};

/**
 * Handle a tasks command
 * @param userId The user ID
 * @param params Command parameters
 * @returns Response message
 */
const handleTasksCommand = async (
  userId: string,
  params: string[]
): Promise<string> => {
  try {
    // Query for tasks due today or in the future
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, description, priority, due_date, farm_id, completed')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(5);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return "I couldn't retrieve your tasks. Please check the app for details.";
    }

    if (!tasks || tasks.length === 0) {
      return "You don't have any upcoming tasks. Enjoy the break! 😊";
    }

    // Format tasks into a readable message
    let response = '*Your Upcoming Tasks*\n\n';

    tasks.forEach((task, index) => {
      const dueDate = new Date(task.due_date).toLocaleDateString();
      const priority =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

      response += `${index + 1}. ${task.title}\n`;
      response += `   📅 Due: ${dueDate}\n`;
      response += `   🔔 Priority: ${priority}\n`;
      if (task.description) {
        response += `   📝 ${task.description}\n`;
      }
      response += '\n';
    });

    response += 'View all tasks in the CropGenius app.';
    return response;
  } catch (error) {
    console.error('Error handling tasks command:', error);
    return "I'm having trouble getting your tasks right now. Please try again later.";
  }
};

/**
 * Handle a market command
 * @param userId The user ID
 * @param params Command parameters
 * @returns Response message
 */
const handleMarketCommand = async (
  userId: string,
  params: string[]
): Promise<string> => {
  try {
    // Get user's crops from their farms and fields
    const { data: fields, error: fieldsError } = await supabase
      .from('fields')
      .select('id, name, current_crop')
      .eq('user_id', userId);

    if (fieldsError) {
      console.error('Error fetching fields:', fieldsError);
      return "I couldn't retrieve your farm data. Please check the app for details.";
    }

    // Extract unique crop types
    const cropTypes = [
      ...new Set(fields?.map((field) => field.current_crop).filter(Boolean)),
    ];

    if (cropTypes.length === 0) {
      return "I don't have information about what crops you're growing. Please update your fields in the app.";
    }

    // Get market listings for the user's crops
    const { data: listings, error: listingsError } = await supabase
      .from('market_listings')
      .select('*')
      .in('crop_type', cropTypes)
      .order('price', { ascending: false })
      .limit(10);

    if (listingsError || !listings || listings.length === 0) {
      return `I couldn't find any recent market prices for your crops (${cropTypes.join(', ')}). Please check the app for more details.`;
    }

    // Group listings by crop type
    const listingsByType: Record<string, any[]> = {};
    listings.forEach((listing) => {
      if (!listingsByType[listing.crop_type]) {
        listingsByType[listing.crop_type] = [];
      }
      listingsByType[listing.crop_type].push(listing);
    });

    // Format market information
    let response = '*Latest Market Prices*\n\n';

    Object.entries(listingsByType).forEach(([cropType, cropListings]) => {
      response += `*${cropType}*\n`;

      // Calculate average price
      const avgPrice =
        cropListings.reduce((sum, listing) => sum + listing.price, 0) /
        cropListings.length;
      response += `📊 Avg Price: ${avgPrice.toFixed(2)} per ${cropListings[0].unit}\n`;

      // Show top 3 listings
      response += 'Best Prices:\n';
      cropListings.slice(0, 3).forEach((listing) => {
        response += `- ${listing.price} (${listing.location})\n`;
      });

      response += '\n';
    });

    response +=
      'Check the CropGenius app for more market insights and price trends.';
    return response;
  } catch (error) {
    console.error('Error handling market command:', error);
    return "I'm having trouble getting market data right now. Please try again later.";
  }
};

/**
 * Get help message in the specified language
 * @param language Language code
 * @returns Formatted help message
 */
const getHelpMessage = (language: string): string => {
  switch (language) {
    case 'sw': // Swahili
      return (
        `*Karibu kwa Msaidizi wa CropGenius!*\n\n` +
        `Unaweza kutumia amri zifuatazo:\n\n` +
        `- *weather* - Kupata hali ya hewa ya sasa\n` +
        `- *forecast* - Kupata utabiri wa hali ya hewa\n` +
        `- *tasks* - Angalia kazi za shamba zinazosubiri\n` +
        `- *market* - Angalia bei za soko za mazao yako\n` +
        `- *help* - Kupata usaidizi`
      );

    case 'fr': // French
      return (
        `*Bienvenue sur l'Assistant CropGenius!*\n\n` +
        `Vous pouvez utiliser les commandes suivantes:\n\n` +
        `- *weather* - Obtenir la météo actuelle\n` +
        `- *forecast* - Obtenir les prévisions météo\n` +
        `- *tasks* - Vérifier les tâches agricoles en attente\n` +
        `- *market* - Vérifier les prix du marché pour vos cultures\n` +
        `- *help* - Obtenir de l'aide`
      );

    default: // English
      return (
        `*Welcome to CropGenius Assistant!*\n\n` +
        `You can use the following commands:\n\n` +
        `- *weather* - Get current weather\n` +
        `- *forecast* - Get weather forecast\n` +
        `- *tasks* - Check pending farm tasks\n` +
        `- *market* - Check market prices for your crops\n` +
        `- *help* - Get help\n\n` +
        `You can also ask me questions about farming in natural language!`
      );
  }
};

/**
 * Get onboarding message for new users
 * @param isHelp Whether this is a help request
 * @returns Formatted onboarding message
 */
const getOnboardingMessage = (isHelp: boolean): string => {
  return (
    `*Welcome to CropGenius!*\n\n` +
    `I don't recognize your phone number yet. To use our WhatsApp assistant, please:\n\n` +
    `1. Download the CropGenius app\n` +
    `2. Create an account\n` +
    `3. Add your phone number to your profile\n\n` +
    `Once you've done that, I'll be able to provide personalized farming assistance right here on WhatsApp!\n\n` +
    `Download link: https://cropgenius.app/download`
  );
};

/**
 * Log a WhatsApp message to the database
 * @param messageData The message data to log
 */
const logWhatsAppMessage = async (messageData: {
  phone_number: string;
  message_content: string;
  direction: 'inbound' | 'outbound';
  user_id: string | null;
  has_media: boolean;
  message_sid: string;
  created_at: string;
}): Promise<void> => {
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData);

    if (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  } catch (error) {
    console.error('Exception logging WhatsApp message:', error);
  }
};

/**
 * Send an alert to a user via WhatsApp
 * @param userId The user ID
 * @param alertConfig The alert configuration
 * @returns The message response
 */
export const sendAlertToUser = async (
  userId: string,
  alertConfig: AlertConfig
): Promise<MessageResponse> => {
  try {
    // Get user's phone number from their profile
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('phone_number, preferred_language')
      .eq('user_id', userId)
      .single();

    if (userError || !userData?.phone_number) {
      console.error('Error finding user phone number:', userError);
      return { success: false, error: 'User phone number not found' };
    }

    // Format the alert message
    let alertMessage = `*CropGenius ${alertConfig.alertType.toUpperCase()} ALERT*\n\n`;

    // Add priority indicator
    if (alertConfig.priority === 'urgent') {
      alertMessage += '🚨 URGENT ACTION REQUIRED 🚨\n\n';
    } else if (alertConfig.priority === 'high') {
      alertMessage += '⚠️ HIGH PRIORITY ⚠️\n\n';
    }

    // Add main message
    alertMessage += alertConfig.message;

    // Add action instructions if applicable
    if (alertConfig.dueDate) {
      const dueDate = new Date(alertConfig.dueDate).toLocaleDateString();
      alertMessage += `\n\nAction needed by: ${dueDate}`;
    }

    // Send the alert via WhatsApp
    return await sendWhatsAppMessage({
      phoneNumber: userData.phone_number,
      message: alertMessage,
      userId,
    });
  } catch (error) {
    console.error('Error sending alert to user:', error);
    return { success: false, error: 'Failed to send alert' };
  }
};

// Export module for WhatsApp webhook handling
export default {
  sendWhatsAppMessage,
  processIncomingMessage,
  sendAlertToUser,
};
