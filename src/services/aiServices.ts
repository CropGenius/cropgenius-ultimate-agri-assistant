import { supabase } from '@/integrations/supabase/client';

export interface CropScanResult {
  disease: string;
  confidence: number;
  severity: number;
  treatment: {
    immediate: string[];
    followup: string[];
  };
  prevention: string[];
  economic_impact: {
    potential_loss: string;
    treatment_cost: string;
    time_sensitive: boolean;
  };
  monitoring: string;
}

export interface YieldPrediction {
  predicted_yield: number;
  predicted_revenue: number;
  confidence_score: number;
  yield_per_hectare: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
  risk_assessment: {
    weather_risk: string;
    disease_risk: string;
    market_risk: string;
  };
  optimization_tips: string[];
}

export interface FarmPlan {
  plan_summary: string;
  total_expected_revenue: number;
  total_estimated_costs: number;
  net_profit_projection: number;
  roi_percentage: number;
  crop_allocation: Record<string, any>;
  timeline: Array<{
    week: number;
    tasks: string[];
    priority: string;
  }>;
  resource_requirements: Record<string, any>;
  risk_mitigation: string[];
  optimization_recommendations: string[];
  sustainability_practices: string[];
}

class AIServices {
  private async callFunction(functionName: string, data: any) {
    const { data: result, error } = await supabase.functions.invoke(functionName, {
      body: data,
    });

    if (error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }

    return result;
  }

  async chatWithAI(message: string, conversationId?: string): Promise<{ response: string; tokensUsed: number }> {
    return this.callFunction('ai-chat', {
      message,
      conversationId,
      context: {}
    });
  }

  async detectCropDisease(
    imageData: string,
    cropType: string,
    fieldId: string
  ): Promise<CropScanResult & { scanId: string; tokensUsed: number }> {
    return this.callFunction('crop-disease-detector', {
      imageData,
      cropType,
      fieldId
    });
  }

  async predictYield(
    fieldId: string,
    cropType: string,
    plantingDate: string,
    expectedHarvest: string,
    fieldSize: number,
    soilType: string,
    irrigationType: string
  ): Promise<YieldPrediction & { predictionId: string; tokensUsed: number }> {
    return this.callFunction('yield-predictor', {
      fieldId,
      cropType,
      plantingDate,
      expectedHarvest,
      fieldSize,
      soilType,
      irrigationType
    });
  }

  async generateFarmPlan(
    farmId: string,
    season: string,
    goals: string[],
    cropTypes: string[],
    farmSize: number,
    budget?: number
  ): Promise<FarmPlan & { planId: string; tokensUsed: number }> {
    return this.callFunction('farm-planner', {
      farmId,
      season,
      goals,
      cropTypes,
      farmSize,
      budget
    });
  }

  async getUserAIUsage(): Promise<{ totalTokens: number; recentUsage: any[] }> {
    const { data: logs, error } = await supabase
      .from('ai_service_logs')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Error fetching AI usage: ${error.message}`);
    }

    const totalTokens = logs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;
    
    return {
      totalTokens,
      recentUsage: logs || []
    };
  }
}

export const aiServices = new AIServices();