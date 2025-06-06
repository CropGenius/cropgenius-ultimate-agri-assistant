// src/components/FarmPlanner.tsx

import { useState, FC } from 'react';
import { useFarmPlanAgent } from '../hooks/agents/useFarmPlanAgent';
import { useWeatherAgent } from '../hooks/agents/useWeatherAgent';
import { useSmartMarketAgent } from '../hooks/agents/useSmartMarketAgent';
import { FarmPlanInput } from '../agents/AIFarmPlanAgent';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { WifiOff } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import FarmPlannerForm from './FarmPlannerForm';
import FarmPlanDisplay from './FarmPlanDisplay';
import { FarmPlanErrorBoundary } from './ErrorBoundary';

const FarmPlanner: FC = () => {
  // Get weather and market data to provide context for farm planning
  const weather = useWeatherAgent();
  const market = useSmartMarketAgent();
  
  // Create weather and market context for the farm plan agent
  const weatherContext = weather.currentWeather ? 
    { current: weather.currentWeather, forecast: weather.weatherForecast?.list || null } : undefined;
  const marketContext = market.marketData ? 
    { relevantListings: market.marketData.listings } : undefined;

  // Use the farm plan agent directly with context
  const {
    getFarmPlan,
    saveFarmPlan,
    farmPlan,
    isLoading: isLoadingFarmPlan,
    error: farmPlanError,
  } = useFarmPlanAgent({ weatherContext, marketContext });

  const [generatedPlanInput, setGeneratedPlanInput] = useState<FarmPlanInput | null>(null);

  const isOffline = useOfflineStatus();

  const handleGeneratePlan = async (formData: {
    cropTypes: string;
    currentSeason: string;
    userGoals: string;
  }) => {
    const crops = formData.cropTypes.split(',').map(crop => crop.trim()).filter(crop => crop.length > 0);
    if (crops.length === 0) {
      alert('Please enter at least one crop type.');
      return;
    }
    if (!formData.currentSeason.trim()) {
      alert('Please enter the current season.');
      return;
    }

    const inputForAgent: Omit<FarmPlanInput, 'userId' | 'farmId' | 'weatherContext' | 'marketContext'> = {
      cropTypes: crops,
      currentSeason: formData.currentSeason.trim(),
      userGoals: formData.userGoals.split('\n').map(goal => goal.trim()).filter(goal => goal.length > 0),
      // farmSizeAcres and soilData can be added later if available
    };

    try {
      // The hook will inject userId, farmId, and our provided weather and market context
      const result = await getFarmPlan(inputForAgent);
      if (result && result.plan) {
        setGeneratedPlanInput(result.inputUsed); // Store the exact input used by the agent
      } else {
        // Handle case where plan might not be generated or result is undefined
        setGeneratedPlanInput(null);
      }
    } catch (error) {
      // Error is already set in the hook's state (farmPlanError)
      console.error('Farm plan generation failed:', error);
    }
  };

  const handleSavePlan = async () => {
    if (!farmPlan || !generatedPlanInput) {
      alert('No farm plan generated or the input used for generation is missing. Cannot save.');
      return;
    }

    try {
      // generatedPlanInput holds the full context with userId and farmId from the hook
      await saveFarmPlan(farmPlan, generatedPlanInput);
      alert('Farm plan and tasks saved successfully!');
      // Optionally, clear the plan or redirect after saving
      // setGeneratedPlanInput(null); // Clear the stored input after successful save
      // setCropTypesInput(''); // Reset form fields
      // setCurrentSeasonInput('');
      // setUserGoalsInput('');
    } catch (error) {
      console.error('Failed to save farm plan:', error);
      alert(`Failed to save farm plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Render offline fallback UI if the user is offline
  if (isOffline) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-yellow-500" />
            Offline Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You're currently offline. Farm planning requires an internet connection to generate AI-powered plans.</p>
          <p className="text-sm text-muted-foreground">Previous plans are still available for viewing in your saved plans section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FarmPlanErrorBoundary>
      <div className="space-y-6">
        <FarmPlannerForm onSubmit={handleGeneratePlan} isLoading={isLoadingFarmPlan} />

        {farmPlanError && (
          <Card className="border-red-500 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-500">Error generating farm plan: {farmPlanError.message}</p>
            </CardContent>
          </Card>
        )}

        {farmPlan && <FarmPlanDisplay farmPlan={farmPlan} onSave={handleSavePlan} />}
      </div>
    </FarmPlanErrorBoundary>
  );
};

export default FarmPlanner;
