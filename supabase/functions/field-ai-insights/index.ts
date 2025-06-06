// Edge Function: field-ai-insights
// This function generates AI-powered insights for fields including crop rotation suggestions,
// pest/disease risks, soil health, and task recommendations based on field data

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface FieldAIRequest {
  field_id: string;
  user_id: string;
  location?: { lat: number; lng: number };
  soil_type?: string;
  crop_history?: Array<{
    crop_name: string;
    planting_date: string;
    harvest_date?: string;
  }>;
  current_weather?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
  };
}

// Mock crop rotation rules - in production would use ML model
const cropRotationRules = {
  maize: ['beans', 'cowpeas', 'groundnuts', 'soybeans'],
  rice: ['beans', 'mungbeans', 'vegetables'],
  cassava: ['maize', 'groundnuts', 'vegetables'],
  beans: ['maize', 'sorghum', 'millet'],
  tomatoes: ['onions', 'carrots', 'leafy greens'],
  groundnuts: ['maize', 'sorghum', 'cassava'],
  soybeans: ['maize', 'sorghum', 'sweet potatoes'],
  sweet_potatoes: ['maize', 'beans', 'vegetables'],
  cotton: ['maize', 'groundnuts', 'cowpeas'],
  vegetables: ['maize', 'millet', 'groundnuts'],
};

// Mock disease risk rules
const diseaseRiskRules = {
  maize: {
    high_temp_high_humidity: ['Fall Armyworm', 'Maize Streak Virus'],
    high_rainfall: ['Gray Leaf Spot', 'Northern Corn Leaf Blight'],
  },
  tomatoes: {
    high_humidity: ['Late Blight', 'Early Blight'],
    high_temp: ['Bacterial Wilt', 'Tomato Yellow Leaf Curl Virus'],
  },
  rice: {
    high_humidity: ['Rice Blast', 'Bacterial Leaf Blight'],
    high_rainfall: ['Rice Blast', 'Sheath Blight'],
  },
};

// Soil health recommendations based on soil type
const soilHealthRecommendations = {
  clay: [
    'Add organic matter to improve drainage',
    'Consider deep tillage to break compacted layers',
    'Plant cover crops like clover or rye to improve structure',
  ],
  sandy: [
    'Add compost to improve water retention',
    'Use mulch to reduce water evaporation',
    'Consider adding clay amendments to improve nutrient retention',
  ],
  loam: [
    'Maintain organic matter with regular compost additions',
    'Practice minimal tillage to preserve soil structure',
    'Rotate deep and shallow rooted crops',
  ],
  silt: [
    'Add organic matter to improve structure',
    'Avoid overworking when wet to prevent compaction',
    'Use cover crops to prevent erosion',
  ],
};

// Task generation based on crop type and growth stage
function generateTasks(crop: string, plantingDate: string): string[] {
  const tasks = [];
  const now = new Date();
  const plantDate = new Date(plantingDate);
  const daysSincePlanting = Math.floor(
    (now.getTime() - plantDate.getTime()) / (1000 * 3600 * 24)
  );

  // Generate generic tasks based on days since planting
  if (daysSincePlanting < 0) {
    tasks.push(`Prepare land for ${crop} planting`);
    tasks.push(`Purchase ${crop} seeds or seedlings`);
    tasks.push('Check soil fertility and consider soil testing');
  } else if (daysSincePlanting < 7) {
    tasks.push('Monitor for germination issues');
    tasks.push('Check for pest damage on young plants');
    tasks.push('Ensure adequate soil moisture');
  } else if (daysSincePlanting < 30) {
    tasks.push('Apply first round of fertilizer if needed');
    tasks.push('Thin seedlings if necessary');
    tasks.push('Begin regular pest monitoring');
  } else if (daysSincePlanting < 60) {
    tasks.push('Apply second round of fertilizer if needed');
    tasks.push('Control weeds around plants');
    tasks.push('Check for disease symptoms');
  } else {
    tasks.push('Monitor crop maturity indicators');
    tasks.push('Prepare for harvest logistics');
    tasks.push('Assess market conditions for optimal selling time');
  }

  // Add crop-specific tasks
  switch (crop.toLowerCase()) {
    case 'maize':
      if (daysSincePlanting > 40 && daysSincePlanting < 70) {
        tasks.push('Check for Fall Armyworm damage');
        tasks.push('Ensure adequate soil moisture during tasseling');
      }
      break;
    case 'tomatoes':
      if (daysSincePlanting > 30) {
        tasks.push('Consider staking or trellising plants');
        tasks.push('Monitor for blossom end rot symptoms');
      }
      break;
    // Add more crop-specific logic as needed
  }

  return tasks;
}

// Calculate disease risk based on weather conditions
function calculateDiseaseRisk(
  crop: string,
  weather: any
): { disease: string; risk: number }[] {
  const risks = [];

  // Default to unknown if crop not in our database
  if (!diseaseRiskRules[crop]) {
    return [{ disease: 'Unknown', risk: 0 }];
  }

  // Check temperature and humidity conditions
  if (weather.temperature > 28 && weather.humidity > 70) {
    const diseases = diseaseRiskRules[crop].high_temp_high_humidity || [];
    diseases.forEach((disease) => {
      risks.push({ disease, risk: 0.8 });
    });
  }

  // Check rainfall conditions
  if (weather.rainfall > 20) {
    // 20mm is significant rainfall
    const diseases = diseaseRiskRules[crop].high_rainfall || [];
    diseases.forEach((disease) => {
      risks.push({ disease, risk: 0.7 });
    });
  }

  return risks.length > 0
    ? risks
    : [{ disease: 'Low risk currently', risk: 0.1 }];
}

// Generate crop rotation suggestions based on previous crops
function generateCropRotations(prevCrops: string[]): string[] {
  // If no previous crops, suggest common starter crops
  if (!prevCrops || prevCrops.length === 0) {
    return ['maize', 'beans', 'groundnuts', 'sweet potatoes', 'cowpeas'];
  }

  const lastCrop = prevCrops[prevCrops.length - 1].toLowerCase();

  // Get suggestions based on last crop
  const suggestions = cropRotationRules[lastCrop] || [
    'maize',
    'beans',
    'cowpeas',
  ];

  // Filter out crops that have been grown in the last 2 cycles to avoid consecutive planting
  return suggestions.filter(
    (crop) =>
      !prevCrops
        .slice(-2)
        .map((c) => c.toLowerCase())
        .includes(crop)
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const {
      field_id,
      user_id,
      location,
      soil_type,
      crop_history,
      current_weather,
    } = (await req.json()) as FieldAIRequest;

    if (!field_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get field data if not provided in request
    let fieldData = { soil_type, crop_history };

    if (!soil_type || !crop_history) {
      // Fetch field data from database
      const { data: field, error: fieldError } = await supabase
        .from('fields')
        .select('soil_type')
        .eq('id', field_id)
        .eq('user_id', user_id)
        .single();

      if (fieldError) {
        throw new Error(`Error fetching field data: ${fieldError.message}`);
      }

      // Get crop history for this field
      const { data: crops, error: cropsError } = await supabase
        .from('field_crops')
        .select('crop_name, planting_date, harvest_date')
        .eq('field_id', field_id)
        .order('planting_date', { ascending: false });

      if (cropsError) {
        throw new Error(`Error fetching crop history: ${cropsError.message}`);
      }

      fieldData.soil_type = field?.soil_type || 'unknown';
      fieldData.crop_history = crops || [];
    }

    // Get weather data if not provided
    let weather = current_weather || {
      temperature: 25,
      humidity: 60,
      rainfall: 0,
    };

    if (!current_weather && location) {
      // In production, fetch real weather data from a weather API
      // For now, we'll use placeholder data
      weather = {
        temperature: 28,
        humidity: 75,
        rainfall: location.lat > 0 ? 15 : 5, // Simple mock based on hemisphere
      };
    }

    // Generate insights
    const prevCropNames = (fieldData.crop_history || []).map(
      (c) => c.crop_name
    );
    const currentOrLastCrop =
      prevCropNames.length > 0 ? prevCropNames[0] : 'unknown';

    // 1. Crop rotation suggestions
    const cropRotationSuggestions = generateCropRotations(prevCropNames);

    // 2. Disease risks
    const diseaseRisks = calculateDiseaseRisk(currentOrLastCrop, weather);

    // 3. Soil health recommendations
    const soilRecommendations =
      soilHealthRecommendations[fieldData.soil_type?.toLowerCase()] ||
      soilHealthRecommendations.loam; // Default to loam if unknown

    // 4. Task recommendations
    const lastPlantingDate =
      fieldData.crop_history && fieldData.crop_history.length > 0
        ? fieldData.crop_history[0].planting_date
        : new Date().toISOString().split('T')[0];

    const taskSuggestions = generateTasks(currentOrLastCrop, lastPlantingDate);

    // 5. Yield potential estimate (simplified algorithm)
    let yieldPotential = 0.7; // Base potential (70%)

    // Adjust based on soil type
    if (fieldData.soil_type === 'loam') yieldPotential += 0.1;
    if (fieldData.soil_type === 'clay' && currentOrLastCrop === 'rice')
      yieldPotential += 0.1;
    if (
      fieldData.soil_type === 'sandy' &&
      ['cassava', 'sweet_potatoes'].includes(currentOrLastCrop)
    )
      yieldPotential += 0.05;

    // Adjust based on weather
    if (weather.rainfall > 10 && weather.rainfall < 30) yieldPotential += 0.05;
    if (weather.temperature > 30 || weather.temperature < 15)
      yieldPotential -= 0.1;

    // Construct response
    const insights = {
      field_id,
      generated_at: new Date().toISOString(),
      crop_rotation: {
        suggestions: cropRotationSuggestions,
        reasoning: `Based on previous planting of ${prevCropNames.join(', ')}`,
      },
      disease_risks: {
        current_crop: currentOrLastCrop,
        risks: diseaseRisks,
      },
      soil_health: {
        soil_type: fieldData.soil_type,
        recommendations: soilRecommendations,
      },
      tasks: {
        suggestions: taskSuggestions,
        priority_level: diseaseRisks.some((r) => r.risk > 0.5)
          ? 'high'
          : 'normal',
      },
      yield_potential: {
        estimate: yieldPotential,
        factors: [
          {
            factor: 'soil_type',
            impact: fieldData.soil_type === 'loam' ? 'positive' : 'neutral',
          },
          {
            factor: 'weather',
            impact: weather.rainfall > 30 ? 'negative' : 'positive',
          },
        ],
      },
    };

    // Store insights in database for future reference
    const { error: insertError } = await supabase
      .from('field_insights')
      .insert({
        field_id,
        user_id,
        insights: insights,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error saving insights:', insertError);
      // Continue anyway as this shouldn't block the response
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing field insights:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
