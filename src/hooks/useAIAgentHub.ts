// src/hooks/useAIAgentHub.ts

/**
 * @file useAIAgentHub.ts
 * @description Central hook to coordinate AI agent activities and synthesize insights.
 * This hub will manage interactions between different AI agents (Weather, CropScan, Market, etc.)
 * and provide a unified interface for components to access AI-driven recommendations and data.
 */

import { useState, useCallback } from 'react';
import {
  getCurrentWeather as getCurrentWeatherInternal,
  getWeatherForecast as getWeatherForecastInternal,
  ProcessedCurrentWeather,
  ProcessedForecast
} from '../agents/WeatherAgent';
import {
  performCropScanAndSave as performCropScanInternal, // Corrected import
  CropScanInput,
  ProcessedCropScanResult
} from '../agents/CropScanAgent';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import {
  generateYieldPrediction as generateYieldPredictionInternal,
  saveYieldPrediction as saveYieldPredictionInternal,
  getHistoricalYieldPredictions as getHistoricalYieldPredictionsInternal,
  YieldPredictionInput,
  YieldPredictionResult,
  StoredYieldPrediction
} from '../agents/YieldPredictorAgent';
import {
  fetchMarketListings as fetchMarketListingsInternal,
  MarketDataInput,
  MarketDataOutput,
} from '../agents/SmartMarketAgent';
import {
  generateFarmPlan as generateFarmPlanInternal,
  saveFarmPlanAndTasks as saveFarmPlanAndTasksInternal,
  FarmPlanInput,
  FarmPlanOutput,
  FarmTask
} from '../agents/AIFarmPlanAgent';
// import { useAuth } from '../context/AuthContext'; // Assuming AuthContext provides user info
// import { supabase } from '../services/supabaseClient'; // Supabase client

// --- Agent-specific service imports (examples, to be created) ---
// import * as WeatherAgent from '../agents/WeatherAgent';
// import * as CropScanAgent from '../agents/CropScanAgent';
// import * as MarketAgent from '../agents/MarketAgent';
// import * as FarmPlanAgent from '../agents/FarmPlanAgent';

// --- Type Definitions (examples, to be expanded) ---

// interface AIAgentHubState {
//   farmHealthSummary: string | null;
//   smartMarketInsights: any | null; // Define more specific type later
//   aiDrivenTasks: any[]; // Define more specific type later
//   loading: boolean;
//   error: Error | null;
// }

// interface AIAgentHubActions {
//   refreshAllInsights: () => Promise<void>;
//   getFarmSpecificAdvice: (farmId: string) => Promise<any>;
//   // Add more actions as AI capabilities grow
// }

// const initialState: AIAgentHubState = {
//   farmHealthSummary: null,
//   smartMarketInsights: null,
//   aiDrivenTasks: [],
//   loading: false,
//   error: null,
// };

export const useAIAgentHub = () => {
  const { user, farmId: currentFarmId, session } = useAuth(); // Get user and farmId from AuthContext
  // --- State for AI Weather Agent ---
  const [currentWeather, setCurrentWeather] = useState<ProcessedCurrentWeather | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<ProcessedForecast | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<Error | null>(null);

  // --- State for Crop Scanner Agent ---
  const [cropScanResult, setCropScanResult] = useState<(ProcessedCropScanResult & { id: string; imageUrl: string }) | null>(null);
  const [isScanningCrop, setIsScanningCrop] = useState<boolean>(false);
  const [cropScanError, setCropScanError] = useState<Error | null>(null);

  // --- State for Yield Predictor Agent ---
  const [yieldPrediction, setYieldPrediction] = useState<YieldPredictionResult | null>(null);
  const [historicalYieldPredictions, setHistoricalYieldPredictions] = useState<StoredYieldPrediction[]>([]);
  const [isPredictingYield, setIsPredictingYield] = useState<boolean>(false);
  const [yieldPredictionError, setYieldPredictionError] = useState<Error | null>(null);

  // --- State for Smart Market Agent ---
  const [marketData, setMarketData] = useState<MarketDataOutput | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(false);
  const [marketDataError, setMarketDataError] = useState<Error | null>(null);

  // --- State for AI Farm Plan Agent ---
  const [farmPlan, setFarmPlan] = useState<FarmPlanOutput | null>(null);
  const [isLoadingFarmPlan, setIsLoadingFarmPlan] = useState<boolean>(false);
  const [farmPlanError, setFarmPlanError] = useState<Error | null>(null);

  // --- AI Weather Agent methods ---
  const fetchCurrentWeather = useCallback(async (
    latitude: number,
    longitude: number,
    farmId?: string,
    saveToDb: boolean = true
  ): Promise<ProcessedCurrentWeather | undefined> => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await getCurrentWeatherInternal(latitude, longitude, farmId || currentFarmId, saveToDb, user?.id); // Pass userId
      setCurrentWeather(data);
      return data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      setWeatherError(error instanceof Error ? error : new Error('Failed to fetch current weather'));
      throw error; // Re-throw to allow caller to handle
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  const fetchWeatherForecast = useCallback(async (
    latitude: number,
    longitude: number,
    farmId?: string,
    saveToDb: boolean = true
  ): Promise<ProcessedForecast | undefined> => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await getWeatherForecastInternal(latitude, longitude, farmId || currentFarmId, saveToDb, user?.id); // Pass userId
      setWeatherForecast(data);
      return data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      setWeatherError(error instanceof Error ? error : new Error('Failed to fetch weather forecast'));
      throw error; // Re-throw
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // --- Crop Scanner Agent methods ---
  const performCropScan = useCallback(async (scanInput: CropScanInput): Promise<(ProcessedCropScanResult & { id: string; imageUrl: string }) | undefined> => {
    setIsScanningCrop(true);
    setCropScanError(null);
    try {
      const result = await performCropScanInternal({ ...scanInput, userId: user?.id, farmId: scanInput.farmId || currentFarmId }); // Pass userId and farmId
      setCropScanResult(result);
      return result;
    } catch (error) {
      console.error('Error performing crop scan:', error);
      setCropScanError(error instanceof Error ? error : new Error('Failed to perform crop scan'));
      throw error; // Re-throw
    } finally {
      setIsScanningCrop(false);
    }
  }, []);

  // const fetchAIDrivenTasks = useCallback(async (currentFarmId: string) => {
  //   // Generate or fetch tasks based on AI analysis
  //   // Example:
  //   // const tasks = await FarmPlanAgent.generateDailyTasks(currentFarmId);
  //   return [{ id: '1', title: 'Water field A', priority: 'high' }]; // Placeholder
  // }, []);

  // const refreshAllInsights = useCallback(async () => {
  //   if (!user || !farmId) {
  //     // Or use a default/selected farmId from context/state
  //     setState(prev => ({ ...prev, error: new Error('User or Farm ID not available') }));
  //     return;
  //   }

  //   setState(prev => ({ ...prev, loading: true, error: null }));
  //   try {
  //     const [health, market, tasks] = await Promise.all([
  //       fetchFarmHealth(farmId),
  //       fetchSmartMarketInsights(farmId),
  //       fetchAIDrivenTasks(farmId),
  //     ]);

  //     setState({
  //       farmHealthSummary: health,
  //       smartMarketInsights: market,
  //       aiDrivenTasks: tasks,
  //       loading: false,
  //       error: null,
  //     });

  //   } catch (err) {
  //     console.error('Error refreshing AI insights:', err);
  //     setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err : new Error(String(err)) }));
  //   }
  // }, [user, currentFarmId]);

  // --- Smart Market Agent methods ---
  const getMarketInsights = useCallback(async (
    input: MarketDataInput
  ): Promise<MarketDataOutput | undefined> => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    try {
      // Ensure farmId from context is used if not provided in input, and userId from context
      const farmIdToUse = input.farmId || currentFarmId;
      const data = await fetchMarketListingsInternal({ 
        ...input, 
        userId: user?.id, 
        farmId: farmIdToUse 
      });
      setMarketData(data);
      return data;
    } catch (error) {
      console.error('Error fetching market insights:', error);
      setMarketDataError(error instanceof Error ? error : new Error('Failed to fetch market insights'));
      throw error; // Re-throw
    } finally {
      setIsLoadingMarketData(false);
    }
  }, [user, currentFarmId]);

  // --- AI Farm Plan Agent methods ---
  const getFarmPlan = useCallback(async (
    input: Omit<FarmPlanInput, 'userId' | 'farmId' | 'weatherContext' | 'marketContext'> & { farmId?: string } // Allow farmId override
  ): Promise<{ plan: FarmPlanOutput; inputUsed: FarmPlanInput } | undefined> => {
    setIsLoadingFarmPlan(true);
    setFarmPlanError(null);
    if (!user || (!input.farmId && !currentFarmId)) {
      const error = new Error('User and Farm ID are required to generate a farm plan.');
      setFarmPlanError(error);
      setIsLoadingFarmPlan(false);
      throw error;
    }
    try {
      const farmIdToUse = input.farmId || currentFarmId!;
      
      // Construct full input for the agent, including context from other agents
      const fullInput: FarmPlanInput = {
        ...input,
        userId: user.id,
        farmId: farmIdToUse,
        weatherContext: {
          current: currentWeather, // From WeatherAgent state
          forecast: weatherForecast?.list || null, // From WeatherAgent state. weatherForecast is ProcessedForecast, which has a 'list' property.
        },
        marketContext: {
          relevantListings: marketData?.listings, // From SmartMarketAgent state
        },
      };

      const plan = await generateFarmPlanInternal(fullInput);
      setFarmPlan(plan);
      return { plan, inputUsed: fullInput };
    } catch (error) {
      console.error('Error generating farm plan:', error);
      setFarmPlanError(error instanceof Error ? error : new Error('Failed to generate farm plan'));
      throw error; // Re-throw
    } finally {
      setIsLoadingFarmPlan(false);
    }
  }, [user, currentFarmId, currentWeather, weatherForecast, marketData]);

  const saveFarmPlan = useCallback(async (planToSave: FarmPlanOutput, inputForSave: FarmPlanInput): Promise<void> => {
    // Ensure userId and farmId are present in inputForSave, typically passed from the context where getFarmPlan was called
    if (!inputForSave.userId || !inputForSave.farmId) {
        throw new Error('User ID and Farm ID are required in FarmPlanInput to save a farm plan.');
    }
    try {
      await saveFarmPlanAndTasksInternal(planToSave, inputForSave);
      // Optionally, refresh related data or provide feedback
    } catch (error) {
      console.error('Error saving farm plan and tasks:', error);
      // Handle error appropriately, maybe set an error state
      throw error; // Re-throw
    }
  }, []);

  // --- Yield Predictor Agent methods ---
  const predictYield = useCallback(async (input: YieldPredictionInput): Promise<YieldPredictionResult | undefined> => {
    setIsPredictingYield(true);
    setYieldPredictionError(null);
    try {
      const prediction = await generateYieldPredictionInternal({ ...input, userId: user?.id, farmId: input.farmId || currentFarmId }); // Pass userId and farmId
      setYieldPrediction(prediction);
      // Optionally, immediately save or let the UI decide
      // if (input.fieldId && prediction) {
      //   await saveYieldPredictionInternal(input, prediction);
      //   // Refresh historical after saving if needed, or manage it in a separate UI flow
      //   const updatedHistorical = await getHistoricalYieldPredictionsInternal(input.fieldId, input.userId);
      //   setHistoricalYieldPredictions(updatedHistorical);
      // }
      return prediction;
    } catch (error) {
      console.error('Error generating yield prediction in hook:', error);
      setYieldPredictionError(error instanceof Error ? error : new Error('Failed to generate yield prediction'));
      throw error;
    } finally {
      setIsPredictingYield(false);
    }
  }, []);

  const saveYieldPredictionToDb = useCallback(async (predictionData: YieldPredictionInput, predictionResult: YieldPredictionResult): Promise<StoredYieldPrediction | undefined> => {
    if (!predictionData.fieldId) {
      console.error('Field ID is required to save yield prediction.');
      throw new Error('Field ID is required to save yield prediction.');
    }
    try {
      const savedPrediction = await saveYieldPredictionInternal({ ...predictionData, userId: user?.id, farmId: predictionData.farmId || currentFarmId }, predictionResult);
      // Add to historical predictions and sort, ensuring no duplicates by id if re-saving
      setHistoricalYieldPredictions(prev => 
        [savedPrediction, ...prev.filter(p => p.id !== savedPrediction.id)]
          .sort((a,b) => new Date(b.predictionDate).getTime() - new Date(a.predictionDate).getTime())
      );
      return savedPrediction;
    } catch (error) {
      console.error('Error saving yield prediction to DB in hook:', error);
      // Set an error state for the UI to pick up if desired
      setYieldPredictionError(error instanceof Error ? error : new Error('Failed to save yield prediction to database'));
      throw error;
    }
  }, []);

  const fetchHistoricalYieldPredictions = useCallback(async (fieldId: string, userId?: string, limit: number = 10): Promise<StoredYieldPrediction[] | undefined> => {
    setIsPredictingYield(true); // Reuse loading state or add a specific one
    setYieldPredictionError(null);
    try {
      const predictions = await getHistoricalYieldPredictionsInternal(fieldId, userId || user?.id, limit);
      setHistoricalYieldPredictions(predictions);
      return predictions;
    } catch (error) {
      console.error('Error fetching historical yield predictions in hook:', error);
      setYieldPredictionError(error instanceof Error ? error : new Error('Failed to fetch historical yield predictions'));
      throw error;
    } finally {
      setIsPredictingYield(false);
    }
  }, []);

  // const getFarmSpecificAdvice = async (currentFarmId: string) => {
  //   // Placeholder for more specific, on-demand advice
  //   return `Specific advice for farm ${currentFarmId} will be generated here.`;
  // };

  // return {
  //   ...state,
  //   refreshAllInsights,
  //   getFarmSpecificAdvice,
  // };

  return {
    // Weather Agent
    fetchCurrentWeather,
    fetchWeatherForecast,
    currentWeather,
    weatherForecast,
    isLoadingWeather,
    weatherError,

    // Crop Scanner Agent
    performCropScan: performCropScanInternal,
    cropScanResult,
    isScanningCrop,
    cropScanError,

    // Yield Predictor Agent
    predictYield,
    saveYieldPrediction: saveYieldPredictionToDb,
    fetchHistoricalYieldPredictions,
    yieldPrediction,
    historicalYieldPredictions,
    isPredictingYield,
    yieldPredictionError,

    // Smart Market Agent
    marketData,
    isLoadingMarketData,
    marketDataError,
    getMarketInsights,

    // AI Farm Plan Agent
    farmPlan,
    isLoadingFarmPlan,
    farmPlanError,
    getFarmPlan,
    saveFarmPlan,

    // Placeholder for future agents/methods if any were part of an earlier scaffold
    // farmHealthSummary: 'AI Farm Health Summary: Coming Soon!', // Example if needed
    // smartMarketInsights: { message: 'AI Smart Market Insights: Coming Soon!' }, // Example
    // aiDrivenTasks: [{ id: 'task-ai-1', title: 'AI Task: Plan irrigation schedule (Coming Soon)'}], // Example
    // refreshAllInsights: async () => console.log('refreshAllInsights called - TBD'), // Example
    // getFarmSpecificAdvice: async (farmId: string) => `Advice for ${farmId} - TBD`, // Example
  };
};

// Example usage in a component:
// const { farmHealthSummary, smartMarketInsights, aiDrivenTasks, loading, error, refreshAllInsights } = useAIAgentHub(currentFarm.id);
//
// if (loading) return <p>Loading AI insights...</p>;
// if (error) return <p>Error loading insights: {error.message}</p>;
//
// return (
//   <div>
//     <h2>Farm Health: {farmHealthSummary}</h2>
//     {/* Display market insights and tasks */}
//     <button onClick={refreshAllInsights}>Refresh AI Data</button>
//   </div>
// );
