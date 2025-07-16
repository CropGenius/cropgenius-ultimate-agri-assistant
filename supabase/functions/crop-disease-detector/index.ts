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
    const { imageData, cropType, fieldId } = await req.json();
    
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

    // AI-powered crop disease analysis
    const systemPrompt = `You are CropGenius AI, the world's most advanced crop disease detection system specialized for African agriculture.

ANALYZE THE IMAGE PROVIDED AND PROVIDE:
1. Disease identification (be specific)
2. Confidence level (percentage)
3. Severity assessment (1-10 scale)
4. Immediate treatment recommendations
5. Prevention strategies
6. Economic impact assessment
7. Timeframe for treatment
8. Follow-up monitoring advice

CROP TYPE: ${cropType}
REGION: African farming conditions

RESPONSE FORMAT (JSON):
{
  "disease": "Disease name or 'Healthy'",
  "confidence": 95,
  "severity": 7,
  "severity_description": "Moderate to severe infection",
  "treatment": {
    "immediate": ["Action 1", "Action 2"],
    "followup": ["Follow-up 1", "Follow-up 2"]
  },
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "economic_impact": {
    "potential_loss": "30-50% yield reduction if untreated",
    "treatment_cost": "Estimated $50-100 per hectare",
    "time_sensitive": true
  },
  "monitoring": "Check plants daily for 2 weeks after treatment"
}

Be precise, practical, and consider African farming conditions and available resources.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `Analyze this ${cropType} plant for diseases and health issues.` },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    let analysis;
    
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON parsing fails
      analysis = {
        disease: "Analysis Error",
        confidence: 0,
        severity: 0,
        treatment: { immediate: [], followup: [] },
        prevention: [],
        economic_impact: { potential_loss: "Unknown", treatment_cost: "Unknown", time_sensitive: false },
        monitoring: "Unable to analyze image"
      };
    }

    // Save scan result to database
    const scanResult = {
      user_id: user.id,
      field_id: fieldId,
      image_url: imageData,
      crop: cropType,
      disease: analysis.disease,
      confidence: analysis.confidence,
      severity: analysis.severity,
      status: 'analyzed',
      economic_impact: analysis.economic_impact?.potential_loss || 0,
    };

    const { data: savedScan, error } = await supabase
      .from('scans')
      .insert(scanResult)
      .select()
      .single();

    if (error) {
      console.error('Error saving scan:', error);
    }

    // If disease detected, create task automatically
    if (analysis.disease !== 'Healthy' && analysis.confidence > 70) {
      const priority = analysis.severity > 7 ? 1 : analysis.severity > 4 ? 2 : 3;
      
      const taskResult = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          field_id: fieldId,
          title: `Treat ${analysis.disease}`,
          description: `AI detected ${analysis.disease} with ${analysis.confidence}% confidence. Severity: ${analysis.severity}/10. ${analysis.treatment.immediate.join('. ')}`,
          status: 'pending',
          priority,
          created_by: user.id,
        });
    }

    // Log AI usage
    await supabase
      .from('ai_service_logs')
      .insert({
        user_id: user.id,
        service_type: 'crop-disease-detection',
        request_data: { cropType, fieldId },
        response_data: analysis,
        tokens_used: data.usage?.total_tokens || 0,
        success: true
      });

    return new Response(JSON.stringify({
      ...analysis,
      scanId: savedScan?.id,
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crop-disease-detector function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});