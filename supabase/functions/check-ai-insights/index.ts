
// AI Insights checker - periodically scans for new insights based on farm data
// This could be triggered by a CRON job in production

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from request (if specific user check) or scan all users
    let userId: string | null = null;
    
    try {
      const body = await req.json();
      userId = body.userId || null;
    } catch {
      // No body or invalid body, scan all users
    }
    
    console.log(`Checking AI insights for ${userId ? 'user ' + userId : 'all users'}`);
    
    // Query to get users to check
    let usersQuery = supabase.from("user_memory").select("user_id, memory_data");
    
    // If user ID provided, only check that user
    if (userId) {
      usersQuery = usersQuery.eq("user_id", userId);
    }
    
    // Get user data
    const { data: users, error: usersError } = await usersQuery;
    
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    
    console.log(`Found ${users.length} users to check`);
    
    // Process each user
    const insights = [];
    
    for (const user of users) {
      const memory = user.memory_data;
      const lastInsightTime = memory.lastInsightShown 
        ? new Date(memory.lastInsightShown).getTime() 
        : 0;
      
      const now = new Date().getTime();
      const hoursSinceLastInsight = (now - lastInsightTime) / (1000 * 60 * 60);
      
      // Only generate new insights if it's been at least 12 hours
      if (hoursSinceLastInsight < 12) {
        console.log(`Skipping user ${user.user_id} - insights checked ${hoursSinceLastInsight.toFixed(1)} hours ago`);
        continue;
      }
      
      // Get user's fields
      const { data: fields, error: fieldsError } = await supabase
        .from("fields")
        .select("*")
        .eq("user_id", user.user_id);
      
      if (fieldsError) {
        console.error(`Error fetching fields for user ${user.user_id}:`, fieldsError);
        continue;
      }
      
      if (!fields || fields.length === 0) {
        console.log(`User ${user.user_id} has no fields, skipping`);
        continue;
      }
      
      // Generate insights based on fields
      // In a real implementation, this would make API calls to weather services,
      // analyze crop data, etc.
      
      // For demo purposes, we'll create a sample insight
      const field = fields[0];
      const insight = {
        userId: user.user_id,
        fieldId: field.id,
        type: Math.random() > 0.5 ? "weather" : "market",
        message: Math.random() > 0.5 
          ? `Rainfall expected in the next 48 hours in ${field.location_description || 'your area'}. Optimal time for planting.`
          : `Market prices for ${field.crop_type || 'crops'} are trending upward. Consider preparing for harvest.`,
        priority: Math.random() > 0.7 ? "high" : "medium",
        createdAt: new Date().toISOString()
      };
      
      // Store the insight
      const { error: insertError } = await supabase
        .from("farm_insights")
        .insert([insight]);
      
      if (insertError) {
        console.error(`Error storing insight for user ${user.user_id}:`, insertError);
        continue;
      }
      
      insights.push(insight);
      
      // Update user's memory with last insight time
      const { error: updateError } = await supabase
        .from("user_memory")
        .update({ 
          memory_data: {
            ...memory,
            lastInsightShown: new Date().toISOString()
          }
        })
        .eq("user_id", user.user_id);
      
      if (updateError) {
        console.error(`Error updating memory for user ${user.user_id}:`, updateError);
      }
      
      // If user has WhatsApp opt-in, send WhatsApp message
      if (memory.whatsappOptIn) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const anon_key = Deno.env.get("SUPABASE_ANON_KEY") || "";
        
        try {
          // Call the WhatsApp notification function
          // In a production environment, this would be done via a queue or message broker
          await fetch(`${supabaseUrl}/functions/v1/whatsapp-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${anon_key}`
            },
            body: JSON.stringify({
              userId: user.user_id,
              phone: memory.whatsappPhone || "",
              message: insight.message,
              insightType: insight.type
            })
          });
        } catch (whatsappError) {
          console.error(`Error sending WhatsApp message for user ${user.user_id}:`, whatsappError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${insights.length} insights for ${users.length} users`,
        insights 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in check-ai-insights function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
