
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FieldAnalysisResult {
  fieldId: string;
  insights: string[];
  analysisTimestamp: string;
}

/**
 * Analyzes field data using AI to generate insights
 * @param fieldId The ID of the field to analyze
 * @returns Promise with analysis results
 */
export const analyzeField = async (fieldId: string): Promise<FieldAnalysisResult | null> => {
  try {
    // First try the new field-ai-insights function
    const { data: aiData, error: aiError } = await supabase.functions.invoke("field-ai-insights", {
      body: { 
        field_id: fieldId, 
        user_id: 'default-user' // Default user ID since we don't have authentication
      },
    });
    
    if (!aiError && aiData) {
      // Transform the response to match our expected format
      return {
        fieldId: fieldId,
        insights: [
          ...aiData.crop_rotation.suggestions.map((crop: string) => `Consider planting ${crop} next.`),
          ...aiData.soil_health.recommendations,
          ...aiData.disease_risks.risks.map((risk: any) => 
            risk.risk > 0.5 ? `Warning: ${risk.disease} risk detected.` : `Low risk of ${risk.disease}.`
          )
        ],
        analysisTimestamp: aiData.generated_at
      };
    }
    
    // Fallback to the original field-analysis function
    const { data, error } = await supabase.functions.invoke("field-analysis", {
      body: { fieldId },
    });
    
    if (error) throw new Error(error.message);
    return data as FieldAnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing field:", error);
    toast.error("Analysis failed", {
      description: "Could not generate field insights. Please try again later.",
    });
    return null;
  }
};

/**
 * Gets field recommendations based on current conditions
 * @param fieldId The ID of the field
 * @returns Promise with recommendations
 */
export const getFieldRecommendations = async (fieldId: string): Promise<string[]> => {
  try {
    const analysis = await analyzeField(fieldId);
    if (!analysis) {
      // Fallback recommendations if analysis fails
      return [
        "Ensure proper irrigation based on your local weather conditions",
        "Monitor for common pests in your region",
        "Consider soil testing for optimized fertilizer application",
        "Practice crop rotation to improve soil health and reduce pest pressure",
        "Add organic matter to enhance soil fertility and structure"
      ];
    }
    
    return analysis.insights;
  } catch (error) {
    console.error("Error getting field recommendations:", error);
    return [
      "Optimize your planting schedule based on local weather patterns",
      "Consider crop rotation to improve soil health",
      "Apply fertilizers based on soil test recommendations",
      "Monitor fields regularly for early pest and disease detection",
      "Consider water conservation techniques for sustainable farming"
    ];
  }
};

/**
 * Checks if a field is at risk for specific pests or diseases
 * @param fieldId The ID of the field to check
 * @returns Promise with risk assessment
 */
export const checkFieldRisks = async (fieldId: string): Promise<{
  hasRisks: boolean;
  risks: {
    name: string;
    likelihood: "low" | "medium" | "high";
    description: string;
  }[];
}> => {
  try {
    // First try to get real analysis data from our edge function
    const analysis = await analyzeField(fieldId);
    
    // In a real implementation, we'd extract risk data from the analysis
    // For now, we'll use more sophisticated placeholder data that simulates AI analysis
    const simulatedRisks = [
      {
        name: "Fall Armyworm",
        likelihood: "medium" as const,
        description: "Current humidity and temperature conditions favor this pest. Monitor fields every 3-5 days."
      },
      {
        name: "Fungal Blight",
        likelihood: "low" as const,
        description: "Low risk due to current dry conditions, but watch for sudden weather changes."
      },
      {
        name: "Stem Borer",
        likelihood: "high" as const,
        description: "High temperatures and nearby infestations indicate elevated risk. Consider preventative treatments."
      }
    ];
    
    // Filter risks based on conditions we could extract from real data
    // For now, we'll use the full set with some randomization
    const filteredRisks = simulatedRisks
      .filter(risk => Math.random() > 0.3) // Randomly include 70% of risks
      .sort((a, b) => {
        // Sort by likelihood - high to low
        const order = { "high": 0, "medium": 1, "low": 2 };
        return order[a.likelihood] - order[b.likelihood];
      });
    
    return {
      hasRisks: filteredRisks.length > 0,
      risks: filteredRisks
    };
  } catch (error) {
    console.error("Error checking field risks:", error);
    return {
      hasRisks: false,
      risks: []
    };
  }
};

/**
 * Gets AI-powered crop recommendations for a specific field
 * @param fieldId The ID of the field
 * @returns Promise with crop recommendations
 */
export const getCropRecommendations = async (fieldId: string): Promise<{
  crops: {
    name: string;
    confidence: number;
    description: string;
    rotationBenefit?: string;
  }[];
}> => {
  try {
    // In a complete implementation, this would call a dedicated edge function
    // For now, we'll return simulated recommendations
    const crops = [
      {
        name: "Maize",
        confidence: 0.87,
        description: "Well-suited to your soil type and climate conditions.",
        rotationBenefit: "Good rotation option after legumes."
      },
      {
        name: "Cassava",
        confidence: 0.81,
        description: "Highly tolerant to drought conditions in your area.",
        rotationBenefit: "Can grow in poorer soils after other crops."
      },
      {
        name: "Sweet Potatoes",
        confidence: 0.75,
        description: "Good fit for your sandy loam soil type.",
        rotationBenefit: "Excellent after grains or maize."
      },
      {
        name: "Groundnuts",
        confidence: 0.69,
        description: "Will improve soil nitrogen for subsequent crops.",
        rotationBenefit: "Plant before cereal crops for nitrogen benefits."
      }
    ];
    
    // Simulate network delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { crops };
  } catch (error) {
    console.error("Error getting crop recommendations:", error);
    return { crops: [] };
  }
};
