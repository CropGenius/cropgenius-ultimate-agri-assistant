import { useState, useCallback } from 'react';
import { cropHealthService, CropHealthAnalysis } from '@/services/cropHealthService';
import { useToast } from '@/hooks/use-toast';

export const useCropHealth = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CropHealthAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const analyzeCropHealth = useCallback(async (
    imageData: string,
    context: {
      region?: string;
      crop?: string;
      season?: string;
      symptoms?: string;
    } = {}
  ) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      const result = await cropHealthService.analyzeCropHealth(imageData, context);
      setAnalysis(result);
      
      toast.success('Crop health analysis complete', {
        description: `Identified ${result.crop} with ${result.diagnosis}`,
      });
      
      return result;
    } catch (error) {
      console.error('Error analyzing crop health:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze crop health';
      setError(new Error(errorMessage));
      toast.error('Analysis failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    analysis,
    error,
    analyzeCropHealth,
    reset
  };
}; 