import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    if (!lat || !lng) {
      return new Response(JSON.stringify({ error: 'Missing lat/lng parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`
    );
    
    const data = await response.json();
    
    const result = {
      current: {
        temperature: Math.round(data.current_weather.temperature),
        humidity: data.hourly.relative_humidity_2m?.[0] || 50,
        rainfall: data.hourly.precipitation?.[0] || 0,
        condition: data.current_weather.weathercode < 3 ? 'Clear' : 'Cloudy',
        timestamp: new Date().toISOString()
      },
      forecast: data.daily.time.slice(1, 6).map((date: string, i: number) => ({
        date,
        temperature: {
          min: Math.round(data.daily.temperature_2m_min[i + 1]),
          max: Math.round(data.daily.temperature_2m_max[i + 1])
        },
        rainfall: data.daily.precipitation_sum[i + 1] || 0
      })),
      agricultural_advice: [
        "Monitor crops for optimal growing conditions",
        "Adjust irrigation based on rainfall predictions"
      ]
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});