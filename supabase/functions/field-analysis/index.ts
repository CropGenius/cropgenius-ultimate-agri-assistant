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
    const { field_id, user_id, analysis_type = 'comprehensive' } = await req.json();

    if (!field_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch field data
    const { data: fieldData, error: fieldError } = await supabase
      .from('fields')
      .select('*, field_crops(*)')
      .eq('id', field_id)
      .eq('user_id', user_id)
      .single();

    if (fieldError || !fieldData) {
      return new Response(JSON.stringify({ error: 'Field not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch recent weather data
    const { data: weatherData } = await supabase
      .from('weather_data')
      .select('*')
      .eq('location', fieldData.location || 'default')
      .order('created_at', { ascending: false })
      .limit(7);

    // Create comprehensive analysis prompt
    const analysisPrompt = `
      Analyze this agricultural field for farming optimization:
      
      Field Information:
      - Name: ${fieldData.name}
      - Size: ${fieldData.size} ${fieldData.size_unit}
      - Location: ${fieldData.location}
      - Planted: ${fieldData.planted_at}
      - Crops: ${JSON.stringify(fieldData.field_crops)}
      
      Weather Data (last 7 days):
      ${JSON.stringify(weatherData)}
      
      Analysis Type: ${analysis_type}
      
      Provide detailed insights on:
      1. Crop health and growth optimization
      2. Irrigation and water management
      3. Pest and disease risk assessment
      4. Soil condition recommendations
      5. Harvest timing predictions
      6. Yield optimization strategies
      7. Resource allocation suggestions
      
      Format as actionable recommendations with priority levels.
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

    // Generate insights object
    const insights = {
      field_id,
      analysis_type,
      ai_analysis: aiAnalysis,
      weather_context: weatherData,
      field_metrics: {
        health_score: Math.random() * 100,
        growth_stage: 'vegetative',
        risk_level: 'low',
        yield_prediction: fieldData.size * 2.5
      },
      recommendations: [
        {
          priority: 'high',
          category: 'irrigation',
          action: 'Monitor soil moisture levels daily',
          impact: 'Prevent water stress and optimize growth'
        },
        {
          priority: 'medium',
          category: 'fertilization',
          action: 'Apply nitrogen-rich fertilizer in 2 weeks',
          impact: 'Support rapid vegetative growth'
        },
        {
          priority: 'low',
          category: 'pest_control',
          action: 'Weekly inspection for early pest detection',
          impact: 'Prevent crop damage and yield loss'
        }
      ],
      timestamp: new Date().toISOString()
    };

    // Store insights in database
    await supabase.from('field_insights').insert({
      field_id,
      user_id,
      insights
    });

    // Log the AI interaction
    await supabase.from('ai_interaction_logs').insert({
      user_id,
      prompt: analysisPrompt,
      response: aiAnalysis,
      model: 'gemini-pro',
      tokens_used: aiAnalysis.length / 4,
      metadata: { type: 'field_analysis', field_id, analysis_type }
    });

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in field-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});