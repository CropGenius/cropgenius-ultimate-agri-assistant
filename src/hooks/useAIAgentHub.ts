// src/hooks/useAIAgentHub.ts

/**
 * @file useAIAgentHub.ts
 * @description Central hook to coordinate AI agent activities and synthesize insights.
 * This hub will manage interactions between different AI agents (Weather, CropScan, Market, etc.)
 * and provide a unified interface for components to access AI-driven recommendations and data.
 */

// --- Modular AI Agent Hooks ---
import { useWeatherAgent } from './agents/useWeatherAgent';
import { useCropScanAgent } from './agents/useCropScanAgent';
import { useYieldPredictorAgent } from './agents/useYieldPredictorAgent';
import { useSmartMarketAgent } from './agents/useSmartMarketAgent';
import { useFarmPlanAgent } from './agents/useFarmPlanAgent';

// Optionally, add types for the unified hub interface

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
  // Compose all modular agent hooks
  const weather = useWeatherAgent();
  const cropScan = useCropScanAgent();
  const yieldPredictor = useYieldPredictorAgent();
  const smartMarket = useSmartMarketAgent();
  // Pass context from other agents to farm plan agent
  const farmPlan = useFarmPlanAgent({
    weatherContext: weather.currentWeather ? { current: weather.currentWeather, forecast: weather.weatherForecast?.list || null } : undefined,
    marketContext: smartMarket.marketData ? { relevantListings: smartMarket.marketData.listings } : undefined,
  });

  // Return unified interface
  return {
    // Weather Agent
    ...weather,
    // Crop Scanner Agent
    ...cropScan,
    // Yield Predictor Agent
    ...yieldPredictor,
    // Smart Market Agent
    ...smartMarket,
    // AI Farm Plan Agent
    ...farmPlan,
  };
};
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
