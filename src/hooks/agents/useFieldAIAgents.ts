import { useCallback, useState, useEffect } from 'react';
import { useCropScanAgent } from './useCropScanAgent';
import { useYieldPredictorAgent } from './useYieldPredictorAgent';
import { useApp } from '@/context/AppContext';
import { diagnostics } from '@/utils/diagnosticService';
import { toast } from 'sonner';

export interface FieldAIAgents {
  // Crop Scan
  cropScanImage: File | null;
  setCropScanImage: (file: File | null) => void;
  performCropScan: () => Promise<void>;
  cropScanResult: any | null;
  isScanning: boolean;
  scanError: Error | null;
  recentScans: any[];

  // Yield Prediction
  predictYield: () => Promise<void>;
  yieldPrediction: any | null;
  isPredicting: boolean;
  predictionError: Error | null;

  // Field Insights
  refreshInsights: () => Promise<void>;
  insights: string[];
  isFetchingInsights: boolean;
  insightsError: Error | null;

  // Field Risks
  refreshRisks: () => Promise<void>;
  risks: any;
  isFetchingRisks: boolean;
  risksError: Error | null;
}

export const useFieldAIAgents = (fieldId: string): FieldAIAgents => {
  const { currentFarmId } = useApp();

  // Initialize individual agents
  const {
    scanResult: cropScanResult,
    performCropScan: agentPerformCropScan,
    isLoading: isScanning,
    error: scanError,
    recentScans,
    setScanImage,
  } = useCropScanAgent();

  const {
    predictYield: agentPredictYield,
    prediction: yieldPrediction,
    isLoading: isPredicting,
    error: predictionError,
  } = useYieldPredictorAgent();

  // Local state
  const [cropScanImage, setCropScanImage] = useState<File | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isFetchingInsights, setIsFetchingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<Error | null>(null);
  const [risks, setRisks] = useState<any>({ hasRisks: false, risks: [] });
  const [isFetchingRisks, setIsFetchingRisks] = useState<boolean>(false);
  const [risksError, setRisksError] = useState<Error | null>(null);

  // Set scan image in the agent when it changes
  useEffect(() => {
    if (cropScanImage) {
      setScanImage(cropScanImage);
    }
  }, [cropScanImage, setScanImage]);

  // Perform crop scan
  const performCropScan = useCallback(async () => {
    if (!cropScanImage) {
      toast.error('Please select an image first');
      return;
    }

    if (!fieldId) {
      toast.error('Field ID is required');
      return;
    }

    try {
      await agentPerformCropScan({
        fieldId,
        imageFile: cropScanImage,
        farmId: currentFarmId || '',
      });

      toast.success('Crop scan completed successfully');
    } catch (error) {
      console.error('Error performing crop scan:', error);
      toast.error('Failed to perform crop scan');
      throw error;
    }
  }, [cropScanImage, fieldId, currentFarmId, agentPerformCropScan]);

  // Predict yield
  const predictYield = useCallback(async () => {
    if (!fieldId) {
      toast.error('Field ID is required');
      return;
    }

    try {
      await agentPredictYield({
        fieldId,
        farmId: currentFarmId || '',
      });
    } catch (error) {
      console.error('Error predicting yield:', error);
      toast.error('Failed to predict yield');
      throw error;
    }
  }, [fieldId, currentFarmId, agentPredictYield]);

  // Fetch field insights
  const refreshInsights = useCallback(async () => {
    if (!fieldId) return;

    setIsFetchingInsights(true);
    setInsightsError(null);

    try {
      // This would be replaced with actual API call to get insights
      // For now, we'll simulate a delay and return mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock insights - in a real app, this would come from your backend
      const mockInsights = [
        'Optimal planting density detected for current crops.',
        'Soil moisture levels are ideal for the current growth stage.',
        'Consider rotating crops next season to improve soil health.',
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsightsError(
        error instanceof Error ? error : new Error('Failed to fetch insights')
      );
      toast.error('Failed to load field insights');
    } finally {
      setIsFetchingInsights(false);
    }
  }, [fieldId]);

  // Fetch field risks
  const refreshRisks = useCallback(async () => {
    if (!fieldId) return;

    setIsFetchingRisks(true);
    setRisksError(null);

    try {
      // This would be replaced with actual API call to get risks
      // For now, we'll simulate a delay and return mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock risks - in a real app, this would come from your backend
      const mockRisks = {
        hasRisks: true,
        risks: [
          {
            type: 'Pest Alert',
            description:
              'Increased risk of fall armyworm detected in your region.',
            severity: 'high',
            recommendations: [
              'Monitor fields for signs of infestation',
              'Consider applying recommended pesticides',
              'Use pheromone traps for early detection',
            ],
          },
          {
            type: 'Weather Warning',
            description: 'Heavy rainfall expected in the next 48 hours.',
            severity: 'medium',
            recommendations: [
              'Ensure proper drainage in fields',
              'Delay any planned pesticide applications',
              'Harvest any ripe crops if possible',
            ],
          },
        ],
      };

      setRisks(mockRisks);
    } catch (error) {
      console.error('Error fetching risks:', error);
      setRisksError(
        error instanceof Error ? error : new Error('Failed to fetch risks')
      );
      toast.error('Failed to load field risks');
    } finally {
      setIsFetchingRisks(false);
    }
  }, [fieldId]);

  // Initial data fetch
  useEffect(() => {
    if (fieldId) {
      refreshInsights();
      refreshRisks();
    }
  }, [fieldId, refreshInsights, refreshRisks]);

  return {
    // Crop Scan
    cropScanImage,
    setCropScanImage,
    performCropScan,
    cropScanResult,
    isScanning,
    scanError,
    recentScans: recentScans || [],

    // Yield Prediction
    predictYield,
    yieldPrediction,
    isPredicting,
    predictionError,

    // Field Insights
    refreshInsights,
    insights,
    isFetchingInsights,
    insightsError,

    // Field Risks
    refreshRisks,
    risks,
    isFetchingRisks,
    risksError,
  };
};
