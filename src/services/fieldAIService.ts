
import { supabase } from "@/integrations/supabase/client";

// Types for field AI insights
export interface FieldInsight {
  field_id: string;
  generated_at: string;
  crop_rotation: {
    suggestions: string[];
    reasoning: string;
  };
  disease_risks: {
    current_crop: string;
    risks: { disease: string; risk: number }[];
  };
  soil_health: {
    soil_type: string;
    recommendations: string[];
  };
  tasks: {
    suggestions: string[];
    priority_level: 'high' | 'normal' | 'low';
  };
  yield_potential: {
    estimate: number;
    factors: { factor: string; impact: 'positive' | 'negative' | 'neutral' }[];
  };
}

export interface AIAnalysisRequest {
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

// Get AI insights for a field
export const getFieldInsights = async (
  params: AIAnalysisRequest
): Promise<{ data: FieldInsight | null; error: string | null }> => {
  try {
    // Check if we have recent insights in the database first
    const { data: existingInsights, error: fetchError } = await supabase
      .from('field_insights')
      .select('insights, created_at')
      .eq('field_id', params.field_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If we have insights less than 12 hours old, return them
    if (existingInsights && !fetchError) {
      const createdAt = new Date(existingInsights.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 12) {
        return { data: existingInsights.insights as FieldInsight, error: null };
      }
    }
    
    // Get fresh insights from the edge function
    const { data: freshInsights, error } = await supabase.functions
      .invoke('field-ai-insights', {
        body: JSON.stringify(params)
      });
    
    if (error) {
      console.error('Error invoking field-ai-insights:', error);
      throw new Error(error.message || 'Failed to get field AI insights');
    }
    
    return { data: freshInsights as FieldInsight, error: null };
  } catch (error: any) {
    console.error('Error in getFieldInsights:', error);
    return { 
      data: null, 
      error: error.message || 'An unexpected error occurred while getting field insights'
    };
  }
};

// Get task recommendations for a field
export const getFieldTasks = async (
  fieldId: string,
  userId: string
): Promise<{ data: string[]; error: string | null }> => {
  try {
    const { data, error } = await getFieldInsights({
      field_id: fieldId,
      user_id: userId
    });
    
    if (error || !data) {
      throw new Error(error || 'Failed to get field insights');
    }
    
    return { data: data.tasks.suggestions, error: null };
  } catch (error: any) {
    console.error('Error in getFieldTasks:', error);
    return { data: [], error: error.message };
  }
};

// Get crop rotation suggestions for a field
export const getCropRotationSuggestions = async (
  fieldId: string,
  userId: string
): Promise<{ data: string[]; error: string | null }> => {
  try {
    const { data, error } = await getFieldInsights({
      field_id: fieldId,
      user_id: userId
    });
    
    if (error || !data) {
      throw new Error(error || 'Failed to get field insights');
    }
    
    return { data: data.crop_rotation.suggestions, error: null };
  } catch (error: any) {
    console.error('Error in getCropRotationSuggestions:', error);
    return { data: [], error: error.message };
  }
};

// Get disease risk analysis for a field
export const getDiseaseRiskAnalysis = async (
  fieldId: string,
  userId: string
): Promise<{ data: { disease: string; risk: number }[]; error: string | null }> => {
  try {
    const { data, error } = await getFieldInsights({
      field_id: fieldId,
      user_id: userId
    });
    
    if (error || !data) {
      throw new Error(error || 'Failed to get field insights');
    }
    
    return { data: data.disease_risks.risks, error: null };
  } catch (error: any) {
    console.error('Error in getDiseaseRiskAnalysis:', error);
    return { data: [], error: error.message };
  }
};

// Get soil health recommendations
export const getSoilHealthRecommendations = async (
  fieldId: string,
  userId: string,
  soilType?: string
): Promise<{ data: string[]; error: string | null }> => {
  try {
    const params: AIAnalysisRequest = {
      field_id: fieldId,
      user_id: userId
    };
    
    if (soilType) {
      params.soil_type = soilType;
    }
    
    const { data, error } = await getFieldInsights(params);
    
    if (error || !data) {
      throw new Error(error || 'Failed to get field insights');
    }
    
    return { data: data.soil_health.recommendations, error: null };
  } catch (error: any) {
    console.error('Error in getSoilHealthRecommendations:', error);
    return { data: [], error: error.message };
  }
};
