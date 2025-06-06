import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      message,
      category = 'all',
      language = 'en',
      userId,
    } = await req.json();
    console.log(`Processing chat request: ${message}`);

    // In a real implementation, you'd call an AI service like OpenAI here
    // For now, we'll simulate a response based on the message content

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate contextual response based on the message and category
    let response = '';

    if (
      message.toLowerCase().includes('maize') ||
      message.toLowerCase().includes('plant')
    ) {
      response =
        'Based on your location and current climate data, the optimal planting window for maize is between April 15-30. Soil temperature should be at least 15°C for good germination.';
    } else if (
      message.toLowerCase().includes('tomato') ||
      message.toLowerCase().includes('blight')
    ) {
      response =
        'Tomato blight appears as dark spots on leaves that turn yellow, then brown. Look for white fuzzy growth on the underside of leaves in humid conditions. Apply copper-based fungicide early morning for best results.';
    } else if (
      message.toLowerCase().includes('fertilizer') ||
      message.toLowerCase().includes('bean')
    ) {
      response =
        'For beans, I recommend composted manure or fish emulsion. Apply 2-3 weeks after germination at a rate of 1/4 cup per plant. Avoid high-nitrogen fertilizers as beans fix their own nitrogen.';
    } else if (
      message.toLowerCase().includes('soil') ||
      message.toLowerCase().includes('health')
    ) {
      response =
        "To improve soil health: 1) Add organic matter like compost, 2) Use cover crops like clover between seasons, 3) Implement crop rotation, and 4) Maintain proper pH (6.0-7.0 for most crops). Your soil's current pH is around 6.3 based on your last test.";
    } else if (
      message.toLowerCase().includes('market') ||
      message.toLowerCase().includes('sell') ||
      message.toLowerCase().includes('coffee')
    ) {
      response =
        'Current coffee prices are strong at $238/kg. Based on market analysis, I recommend selling to the Nairobi Central Market where prices are 8% higher than local markets. Best selling window is within 5 days.';
    } else if (
      message.toLowerCase().includes('harvest') ||
      message.toLowerCase().includes('when')
    ) {
      response =
        'For your maize variety, optimal harvest time is when kernels are firm and the husks are dry. Based on your planting date and current growth stage, I estimate your fields will be ready for harvest between October 12-18.';
    } else if (
      message.toLowerCase().includes('protect') ||
      message.toLowerCase().includes('rain')
    ) {
      response =
        'To protect tomatoes from heavy rain: 1) Install row covers or small tunnels, 2) Apply preventative fungicide 24-48 hours before rainfall, 3) Ensure good drainage, and 4) Stake plants higher to keep fruit off ground. Rain expected Thursday.';
    } else {
      response =
        "I understand you're asking about " +
        message +
        ". Based on your farm data and current conditions, I'd recommend consulting our detailed guides in the Knowledge Base. Would you like me to provide more specific information?";
    }

    // Log the response and return it
    console.log(`AI response generated: ${response.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({
        response: response,
        source: 'CROPGenius AI',
        timestamp: new Date().toISOString(),
        category: category,
        language: language,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in AI chat function:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        response:
          "I'm having trouble processing your question right now. Please try again shortly.",
        source: 'Error Handler',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
