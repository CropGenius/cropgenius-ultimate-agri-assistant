
// Use import types for TypeScript type checking
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Type definitions
interface Field {
  id: string;
  soil_type?: string;
  soil_properties?: {
    ph_level?: number;
    [key: string]: any;
  };
  boundary?: {
    coordinates?: { lat: number; lng: number }[];
    [key: string]: any;
  };
  irrigation_type?: string;
  [key: string]: any;
}

interface WeatherData {
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  location?: { lat: number; lng: number };
  recorded_at?: string;
  [key: string]: any;
}

interface NearbyCrop {
  crop_name: string;
  count: number;
  [key: string]: any;
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the field ID from the request
    const { fieldId } = await req.json();
    
    if (!fieldId) {
      return new Response(
        JSON.stringify({ error: 'Field ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Connect to Supabase database to get field information
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!;
    const pool = new postgres.Pool(databaseUrl, 3, true);
    
    try {
      const connection = await pool.connect();
      
      try {
        // Fetch field data
        const fieldResult = await connection.queryObject(`
          SELECT f.*, 
                 soil_type, 
                 boundary,
                 s.properties as soil_properties
          FROM fields f
          LEFT JOIN soil_types s ON f.soil_type = s.name
          WHERE f.id = $1
        `, [fieldId]);
        
        const field = fieldResult.rows[0];
        
        if (!field) {
          return new Response(
            JSON.stringify({ error: 'Field not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Get weather data for the field location if available
        let weatherData = null;
        if (field.boundary && field.boundary.coordinates && field.boundary.coordinates.length > 0) {
          const centerPoint = getCenterPoint(field.boundary.coordinates);
          const weatherResult = await connection.queryObject(`
            SELECT * FROM weather_data
            WHERE ST_DWithin(
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              ST_SetSRID(ST_MakePoint(
                (location->>'lng')::float, 
                (location->>'lat')::float
              ), 4326)::geography,
              50000 -- 50km radius
            )
            ORDER BY recorded_at DESC
            LIMIT 1
          `, [centerPoint.lng, centerPoint.lat]);
          
          if (weatherResult.rows.length > 0) {
            weatherData = weatherResult.rows[0];
          }
        }
        
        // Get nearby crops data
        const nearbyCropsResult = await connection.queryObject(`
          SELECT crop_name, COUNT(*) as count
          FROM field_crops fc
          JOIN fields f ON fc.field_id = f.id
          WHERE f.id != $1
            AND f.user_id = (SELECT user_id FROM fields WHERE id = $1)
          GROUP BY crop_name
          ORDER BY count DESC
          LIMIT 5
        `, [fieldId]);
        
        // Generate insights based on available data
        const insights = generateInsights(field, weatherData, nearbyCropsResult.rows);
        
        return new Response(
          JSON.stringify({ 
            fieldId, 
            insights,
            analysisTimestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } finally {
        connection.release();
      }
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('Error in field-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to calculate center point of polygon
function getCenterPoint(coordinates: { lat: number, lng: number }[]) {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  const sum = coordinates.reduce(
    (acc, curr) => ({ lat: acc.lat + curr.lat, lng: acc.lng + curr.lng }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  };
}

// Generate insights based on available data
function generateInsights(
  field: Field, 
  weatherData: WeatherData | null, 
  nearbyCrops: NearbyCrop[]
): string[] {
  const insights: string[] = [];
  
  // Soil insights
  if (field.soil_type) {
    const soilType = field.soil_type;
    const soilProps = field.soil_properties;
    
    let crops = "various crops";
    if (soilType === "Clay Loam" || soilType === "Silty Clay Loam") {
      crops = "maize, rice, and wheat";
    } else if (soilType === "Sandy Loam" || soilType === "Loamy Sand") {
      crops = "cassava, sweet potatoes, and groundnuts";
    } else if (soilType === "Silt Loam") {
      crops = "vegetables and legumes";
    }
    
    insights.push(`Your soil type (${soilType}) is generally suitable for ${crops}.`);
    
    if (soilProps) {
      if (soilProps.ph_level) {
        const ph = soilProps.ph_level;
        if (ph < 5.5) {
          insights.push(`Soil pH is acidic (${ph}). Consider lime application to raise pH for better nutrient availability.`);
        } else if (ph > 7.5) {
          insights.push(`Soil pH is alkaline (${ph}). Some crops may face micronutrient deficiencies.`);
        } else {
          insights.push(`Soil pH (${ph}) is in optimal range for most crops.`);
        }
      }
    }
  }
  
  // Weather insights
  if (weatherData) {
    const temp = weatherData.temperature ?? 0;
    const humidity = weatherData.humidity ?? 0;
    const precip = weatherData.precipitation ?? 0;
    
    if (temp > 30) {
      insights.push(`High temperatures detected (${temp}°C). Consider drought-resistant varieties and increased irrigation.`);
    }
    
    if (humidity > 80 && temp > 25) {
      insights.push(`High humidity and temperature conditions increase risk of fungal diseases. Monitor crops regularly.`);
    }
    
    if (precip < 2 && field.irrigation_type === "rainfed") {
      insights.push(`Low rainfall detected. Rainfed fields may need supplemental irrigation in coming days.`);
    }
  }
  
  // Crop suggestions based on nearby fields
  if (nearbyCrops && nearbyCrops.length > 0) {
    const popularCrops = nearbyCrops.map(c => c.crop_name).slice(0, 3).join(", ");
    insights.push(`Nearby farmers are successfully growing ${popularCrops} in similar conditions.`);
  }
  
  // Add general rotation advice
  insights.push("Consider crop rotation to improve soil health and reduce pest pressure.");
  
  // If few insights, add a generic one
  if (insights.length < 3) {
    insights.push("Regular soil testing and field monitoring will help optimize your farming decisions.");
  }
  
  return insights;
}
