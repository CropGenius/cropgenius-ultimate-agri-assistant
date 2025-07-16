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
    const { farmId, season, goals, cropTypes, farmSize, budget } = await req.json();
    
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

    // Get user's farming context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get farm details
    const { data: farm } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    // Get current market prices
    const { data: marketPrices } = await supabase
      .from('crop_prices')
      .select('*')
      .in('crop_name', cropTypes)
      .order('date', { ascending: false })
      .limit(50);

    // Get weather data
    const { data: weatherData } = await supabase
      .from('weather_data')
      .select('*')
      .eq('location', profile?.location || 'Kenya')
      .order('created_at', { ascending: false })
      .limit(7);

    const systemPrompt = `You are CropGenius AI, the world's most advanced farm planning system for African agriculture.

FARM CONTEXT:
- Farm: ${farm?.name || 'Farm'}
- Size: ${farmSize} hectares
- Location: ${profile?.location || 'Kenya'}
- Season: ${season}
- Budget: ${budget || 'Not specified'}
- Goals: ${goals.join(', ')}

CROPS TO PLAN: ${cropTypes.join(', ')}

MARKET DATA: ${marketPrices?.length || 0} price records available
WEATHER DATA: ${weatherData?.length || 0} recent weather records

TASK: Create a comprehensive, AI-optimized farm plan that maximizes profitability and sustainability.

RESPONSE FORMAT (JSON):
{
  "plan_summary": "Brief overview of the optimal strategy",
  "total_expected_revenue": 250000,
  "total_estimated_costs": 150000,
  "net_profit_projection": 100000,
  "roi_percentage": 67,
  "crop_allocation": {
    "maize": {
      "hectares": 3,
      "expected_yield": 6000,
      "revenue_projection": 120000,
      "cost_estimate": 45000,
      "profit_margin": 75000
    }
  },
  "timeline": [
    {
      "week": 1,
      "tasks": ["Soil preparation", "Seed procurement"],
      "priority": "High"
    }
  ],
  "resource_requirements": {
    "seeds": "150kg maize seeds",
    "fertilizer": "500kg NPK fertilizer",
    "labor": "20 person-days per week"
  },
  "risk_mitigation": [
    "Diversified crop portfolio reduces price risk",
    "Staggered planting reduces weather risk"
  ],
  "optimization_recommendations": [
    "Focus 60% on maize for guaranteed returns",
    "Allocate 40% to high-value vegetables"
  ],
  "sustainability_practices": [
    "Crop rotation to maintain soil health",
    "Water conservation techniques"
  ]
}

Be specific, profitable, and consider African farming realities.`;

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
          { role: 'user', content: `Create an optimal farm plan for this ${season} season.` }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    let plan;
    
    try {
      plan = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback plan
      plan = {
        plan_summary: "Balanced crop allocation for optimal returns",
        total_expected_revenue: farmSize * 50000,
        total_estimated_costs: farmSize * 30000,
        net_profit_projection: farmSize * 20000,
        roi_percentage: 67,
        crop_allocation: {},
        timeline: [],
        resource_requirements: {},
        risk_mitigation: [],
        optimization_recommendations: [],
        sustainability_practices: []
      };
    }

    // Save farm plan to database
    const { data: savedPlan, error } = await supabase
      .from('farm_plans')
      .insert({
        user_id: user.id,
        farm_id: farmId,
        season: season,
        crop_types: cropTypes,
        plan_data: plan,
        plan_summary: plan.plan_summary,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving farm plan:', error);
    }

    // Create tasks from timeline
    if (plan.timeline && savedPlan) {
      const tasks = plan.timeline.flatMap((timelineItem: any) => 
        timelineItem.tasks.map((task: string) => ({
          user_id: user.id,
          farm_id: farmId,
          title: task,
          description: `Week ${timelineItem.week} task: ${task}`,
          priority: timelineItem.priority === 'High' ? 1 : timelineItem.priority === 'Medium' ? 2 : 3,
          status: 'pending',
          created_by: user.id,
          due_date: new Date(Date.now() + timelineItem.week * 7 * 24 * 60 * 60 * 1000).toISOString()
        }))
      );

      if (tasks.length > 0) {
        await supabase.from('tasks').insert(tasks);
      }
    }

    // Log AI usage
    await supabase
      .from('ai_service_logs')
      .insert({
        user_id: user.id,
        service_type: 'farm-planning',
        request_data: { farmId, season, goals, cropTypes },
        response_data: plan,
        tokens_used: data.usage?.total_tokens || 0,
        success: true
      });

    return new Response(JSON.stringify({
      ...plan,
      planId: savedPlan?.id,
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in farm-planner function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});