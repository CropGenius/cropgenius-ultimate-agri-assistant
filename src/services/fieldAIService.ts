
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
      return [
        "Ensure proper irrigation based on your local weather conditions",
        "Monitor for common pests in your region",
        "Consider soil testing for optimized fertilizer application"
      ];
    }
    
    return analysis.insights;
  } catch (error) {
    console.error("Error getting field recommendations:", error);
    return [
      "Optimize your planting schedule based on local weather patterns",
      "Consider crop rotation to improve soil health",
      "Apply fertilizers based on soil test recommendations"
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
    // In a real implementation, this would use the field analysis data
    // For now, we'll return placeholder data
    return {
      hasRisks: true,
      risks: [
        {
          name: "Fall Armyworm",
          likelihood: "medium",
          description: "Current humidity and temperature conditions favor this pest"
        },
        {
          name: "Fungal Blight",
          likelihood: "low",
          description: "Low risk due to current dry conditions"
        }
      ]
    };
  } catch (error) {
    console.error("Error checking field risks:", error);
    return {
      hasRisks: false,
      risks: []
    };
  }
};
