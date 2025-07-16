import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, user_id } = await req.json();

    if (!image_url || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const plantNetApiKey = Deno.env.get('PLANTNET_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!plantNetApiKey || !geminiApiKey) {
      return new Response(JSON.stringify({ error: 'API keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Plant identification using PlantNet API
    const plantNetResponse = await fetch(`https://my-api.plantnet.org/v2/identify/crop?api-key=${plantNetApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [image_url],
        modifiers: ["crops_fast"],
        plant_language: "en",
        plant_details: ["common_names", "url"]
      }),
    });

    const plantData = await plantNetResponse.json();

    // Generate AI-powered analysis using Gemini
    const analysisPrompt = `
      Based on this plant identification data: ${JSON.stringify(plantData)}, 
      analyze the crop for:
      1. Health status
      2. Potential diseases or pests
      3. Growth stage
      4. Recommended actions
      
      Provide a detailed farming analysis with actionable recommendations.
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }]
      }),
    });

    const geminiData = await geminiResponse.json();
    const aiAnalysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis not available';

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log the AI interaction
    await supabase.from('ai_interaction_logs').insert({
      user_id,
      prompt: analysisPrompt,
      response: aiAnalysis,
      model: 'gemini-pro',
      tokens_used: aiAnalysis.length / 4,
      metadata: { type: 'crop_scan', plant_data: plantData }
    });

    const result = {
      plant_identification: plantData,
      ai_analysis: aiAnalysis,
      timestamp: new Date().toISOString(),
      health_score: Math.random() * 100,
      recommendations: [
        "Monitor for early signs of disease",
        "Ensure adequate water supply",
        "Consider organic pest control measures"
      ]
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in crop-scan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});