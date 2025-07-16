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
    const { message, context, conversationId } = await req.json();
    
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

    // Get user's profile and farm data for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id);

    const { data: fields } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', user.id);

    // Build farming context
    const farmingContext = {
      profile,
      farms,
      fields,
      location: profile?.location || 'Kenya',
      crops: fields?.map(f => f.crop_type).filter(Boolean) || [],
    };

    const systemPrompt = `You are CropGenius AI, the world's most advanced farming intelligence system for African agriculture.

FARMER CONTEXT:
- Location: ${farmingContext.location}
- Crops: ${farmingContext.crops.join(', ') || 'Not specified'}
- Farm Size: ${profile?.farm_size || 'Not specified'} ${profile?.farm_units || ''}
- Number of Farms: ${farms?.length || 0}
- Number of Fields: ${fields?.length || 0}

CORE CAPABILITIES:
1. Expert agricultural advice for African farming conditions
2. Crop disease diagnosis and treatment recommendations
3. Weather-based farming guidance
4. Market price analysis and selling strategies
5. Yield optimization techniques
6. Soil health management
7. Pest and disease prevention
8. Water management and irrigation advice
9. Sustainable farming practices
10. Farm planning and crop rotation

RESPONSE STYLE:
- Be practical and actionable
- Consider local African farming conditions
- Provide specific, measurable recommendations
- Include economic impact when relevant
- Be encouraging and supportive
- Use simple, clear language
- Always prioritize farmer profitability and sustainability

SAFETY GUIDELINES:
- Never recommend harmful chemicals without proper safety warnings
- Always consider environmental impact
- Suggest consulting local agricultural extension officers for complex issues
- Recommend soil testing before major changes`;

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
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save conversation to database
    if (conversationId) {
      // Update existing conversation
      const { data: existingConv } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (existingConv) {
        const updatedMessages = [
          ...existingConv.messages,
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ];

        await supabase
          .from('ai_conversations')
          .update({ 
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      }
    } else {
      // Create new conversation
      const newMessages = [
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
      ];

      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          messages: newMessages,
          context: farmingContext
        });
    }

    // Log AI usage
    await supabase
      .from('ai_service_logs')
      .insert({
        user_id: user.id,
        service_type: 'chat',
        request_data: { message, context },
        response_data: { response: aiResponse },
        tokens_used: data.usage?.total_tokens || 0,
        success: true
      });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});