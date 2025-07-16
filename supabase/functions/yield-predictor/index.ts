import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fieldId, cropType, plantingDate, expectedHarvest, fieldSize, soilType, irrigationType } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's location and historical data
    const { data: profile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', user.id)
      .single();

    // Get recent weather data for the location
    const { data: weatherData } = await supabase
      .from('weather_data')
      .select('*')
      .eq('location', profile?.location || 'Kenya')
      .order('created_at', { ascending: false })
      .limit(30);

    // Get historical yield data for similar crops
    const { data: historicalYields } = await supabase
      .from('yield_predictions')
      .select('*')
      .eq('crop_type', cropType)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get current crop prices
    const { data: marketPrices } = await supabase
      .from('crop_prices')
      .select('*')
      .eq('crop_name', cropType)
      .order('date', { ascending: false })
      .limit(30);

    const currentPrice = marketPrices?.[0]?.price_per_kg || 0;

    const systemPrompt = `You are CropGenius AI, the world's most advanced yield prediction system for African agriculture.

FIELD INFORMATION:
- Crop: ${cropType}
- Field Size: ${fieldSize} hectares
- Planting Date: ${plantingDate}
- Expected Harvest: ${expectedHarvest}
- Soil Type: ${soilType}
- Irrigation: ${irrigationType}
- Location: ${profile?.location || 'Kenya'}

HISTORICAL DATA:
- Recent Weather: ${weatherData?.length || 0} records
- Historical Yields: ${historicalYields?.length || 0} records
- Current Market Price: ${currentPrice} KES per kg

TASK: Predict yield and revenue for this field with high accuracy.

RESPONSE FORMAT (JSON):
{
  "predicted_yield": 4200,
  "predicted_revenue": 168000,
  "confidence_score": 0.87,
  "yield_per_hectare": 2100,
  "factors": {
    "positive": ["Good soil type", "Adequate irrigation", "Favorable weather"],
    "negative": ["Late planting", "Pest pressure expected"],
    "neutral": ["Average market conditions"]
  },
  "recommendations": [
    "Apply fertilizer at week 6 for 15% yield increase",
    "Monitor for pests during flowering stage",
    "Harvest 2 weeks early for premium pricing"
  ],
  "risk_assessment": {
    "weather_risk": "Low",
    "disease_risk": "Medium",
    "market_risk": "Low"
  },
  "optimization_tips": [
    "Precision timing of harvest can increase revenue by 20%",
    "Consider direct sales to reduce middleman costs"
  ]
}

Be precise, data-driven, and consider local African farming conditions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Predict yield and revenue for this ${cropType} field.` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    let prediction;
    
    try {
      prediction = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback prediction
      prediction = {
        predicted_yield: fieldSize * 2000,
        predicted_revenue: fieldSize * 2000 * currentPrice,
        confidence_score: 0.7,
        yield_per_hectare: 2000,
        factors: { positive: [], negative: [], neutral: [] },
        recommendations: [],
        risk_assessment: { weather_risk: "Medium", disease_risk: "Medium", market_risk: "Medium" },
        optimization_tips: []
      };
    }

    // Save prediction to database
    const { data: savedPrediction, error } = await supabase
      .from('yield_predictions')
      .insert({
        user_id: user.id,
        field_id: fieldId,
        crop_type: cropType,
        predicted_yield: prediction.predicted_yield,
        predicted_revenue: prediction.predicted_revenue,
        confidence_score: prediction.confidence_score,
        factors: prediction.factors,
        weather_data: weatherData,
        soil_data: { type: soilType, irrigation: irrigationType }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving prediction:', error);
    }

    // Log AI usage
    await supabase
      .from('ai_service_logs')
      .insert({
        user_id: user.id,
        service_type: 'yield-prediction',
        request_data: { fieldId, cropType, fieldSize },
        response_data: prediction,
        tokens_used: data.usage?.total_tokens || 0,
        success: true
      });

    return new Response(JSON.stringify({
      ...prediction,
      predictionId: savedPrediction?.id,
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yield-predictor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});