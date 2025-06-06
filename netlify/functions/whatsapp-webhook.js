// netlify/functions/whatsapp-webhook.js
// Handles incoming WhatsApp messages via Twilio webhooks

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Twilio authentication (for webhook validation)
const twilioAccountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.VITE_TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.VITE_TWILIO_WHATSAPP_NUMBER;

// Security validation for Twilio webhooks
const validateTwilioRequest = (headers, body) => {
  // In production, implement proper Twilio webhook validation here
  // using the X-Twilio-Signature header and your auth token
  // https://www.twilio.com/docs/usage/webhooks/webhooks-security

  return true; // For initial implementation
};

exports.handler = async function (event, context) {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Validate the request is from Twilio
  if (!validateTwilioRequest(event.headers, event.body)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden - Invalid Twilio signature' }),
    };
  }

  try {
    // Parse the incoming webhook data
    const formData = new URLSearchParams(event.body);
    const messageData = {
      From: formData.get('From'),
      Body: formData.get('Body'),
      MessageSid: formData.get('MessageSid'),
      NumMedia: formData.get('NumMedia') || '0',
      MediaUrl0: formData.get('MediaUrl0') || null,
    };

    // Extract phone number (remove whatsapp: prefix)
    const phoneNumber = messageData.From.replace('whatsapp:', '');

    // Look up user by phone number
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id, preferred_language')
      .eq('phone_number', phoneNumber)
      .single();

    // Log the incoming message to the database
    const { data: messageRecord, error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        phone_number: phoneNumber,
        message_content: messageData.Body,
        message_sid: messageData.MessageSid,
        direction: 'inbound',
        user_id: userData?.user_id || null,
        has_media: messageData.NumMedia > '0',
        processed: false,
        message_type: determineMessageType(messageData.Body),
      })
      .select();

    if (messageError) {
      console.error('Error logging incoming WhatsApp message:', messageError);
    }

    // For immediate response, we'll return a simple acknowledgment
    // The actual message processing will happen asynchronously
    const initialResponse = generateQuickResponse(
      messageData.Body,
      userData?.preferred_language || 'en'
    );

    // Trigger async processing (will be handled by background processes)
    await supabase.rpc('process_incoming_whatsapp', {
      phone_number: phoneNumber,
      message_content: messageData.Body,
      message_sid: messageData.MessageSid,
      has_media: messageData.NumMedia > '0',
    });

    // Respond with TwiML format that Twilio expects
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${initialResponse}</Message>
</Response>`,
    };
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

// Determine the type of incoming message for categorization
function determineMessageType(message) {
  const normalizedMessage = message.trim().toLowerCase();

  if (normalizedMessage.startsWith('weather')) return 'weather';
  if (
    normalizedMessage.startsWith('task') ||
    normalizedMessage.startsWith('todo')
  )
    return 'task';
  if (
    normalizedMessage.startsWith('market') ||
    normalizedMessage.startsWith('price')
  )
    return 'market';
  if (normalizedMessage.startsWith('help') || normalizedMessage === '?')
    return 'help';
  if (normalizedMessage.startsWith('scan')) return 'scan';

  return 'chat';
}

// Generate a quick acknowledgment response while the full processing happens asynchronously
function generateQuickResponse(message, language = 'en') {
  const messageType = determineMessageType(message);

  // Quick responses in different languages
  const responses = {
    en: {
      weather: "I'm checking the weather for you now...",
      task: 'Retrieving your tasks...',
      market: 'Fetching the latest market prices...',
      help: "Here's how I can help you...",
      scan: 'To scan your crops, please use the CropGenius app.',
      chat: "I'm thinking about your question...",
    },
    sw: {
      weather: 'Ninaangalia hali ya hewa sasa...',
      task: 'Napata kazi zako...',
      market: 'Ninapata bei za soko...',
      help: 'Hivi ndivyo ninavyoweza kukusaidia...',
      scan: 'Kutumia huduma ya uchunguzi wa mimea, tafadhali tumia programu ya CropGenius.',
      chat: 'Nafikiria swali lako...',
    },
    fr: {
      weather: 'Je vérifie la météo pour vous...',
      task: 'Je récupère vos tâches...',
      market: 'Je cherche les derniers prix du marché...',
      help: 'Voici comment je peux vous aider...',
      scan: "Pour scanner vos cultures, veuillez utiliser l'application CropGenius.",
      chat: 'Je réfléchis à votre question...',
    },
  };

  // Default to English if language not supported
  const languageResponses = responses[language] || responses.en;

  return languageResponses[messageType] || languageResponses.chat;
}
