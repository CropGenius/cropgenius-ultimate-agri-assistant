// src/components/FarmPlanner.tsx

import { useState, FC } from 'react';
import { useFarmPlanAgent } from '../hooks/agents/useFarmPlanAgent';
import { useWeatherAgent } from '../hooks/agents/useWeatherAgent';
import { useSmartMarketAgent } from '../hooks/agents/useSmartMarketAgent';
import { FarmPlanInput, FarmPlanOutput } from '../agents/AIFarmPlanAgent';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFarm } from '../hooks/useFarm';
import { toast } from 'sonner';
import diagnostics from '../utils/diagnosticService';
import { FarmPlanErrorBoundary } from './ErrorBoundary';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

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

  const [cropTypesInput, setCropTypesInput] = useState<string>(''); // Comma-separated
  const [currentSeasonInput, setCurrentSeasonInput] = useState<string>('');
  const [userGoalsInput, setUserGoalsInput] = useState<string>('');
  const [generatedPlanInput, setGeneratedPlanInput] = useState<FarmPlanInput | null>(null);

  const isOffline = useOfflineStatus();

  const handleGeneratePlan = async () => {
    const crops = cropTypesInput.split(',').map(crop => crop.trim()).filter(crop => crop.length > 0);
    if (crops.length === 0) {
      alert('Please enter at least one crop type.');
      return;
    }
    if (!currentSeasonInput.trim()) {
      alert('Please enter the current season.');
      return;
    }

    const inputForAgent: Omit<FarmPlanInput, 'userId' | 'farmId' | 'weatherContext' | 'marketContext'> = {
      cropTypes: crops,
      currentSeason: currentSeasonInput.trim(),
      userGoals: userGoalsInput.split('\n').map(goal => goal.trim()).filter(goal => goal.length > 0),
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
        <h2>AI Farm Planner</h2>
        
        <div className="mb-4">
          <div>
            <Label htmlFor="cropTypes" className="mr-2">Crop Types (comma-separated):</Label>
            <Input 
              type="text" 
              id="cropTypes" 
              value={cropTypesInput} 
              onChange={(e) => setCropTypesInput(e.target.value)} 
              placeholder="e.g., Maize, Beans, Tomato"
              className="w-full md:w-80"
            />
        </div>
        <div className="mt-4">
          <Label htmlFor="currentSeason" className="mr-2">Current Season:</Label>
          <Input 
            type="text" 
            id="currentSeason" 
            value={currentSeasonInput} 
            onChange={(e) => setCurrentSeasonInput(e.target.value)} 
            placeholder="e.g., Long Rains 2024"
            className="w-full md:w-80"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="userGoals" className="block mb-2">User Goals (one per line):</Label>
          <Textarea 
            id="userGoals" 
            value={userGoalsInput} 
            onChange={(e) => setUserGoalsInput(e.target.value)} 
            placeholder="e.g., Maximize yield\nImprove soil health"
            rows={3}
            className="w-full md:w-80"
          />
        </div>
        <Button 
          onClick={handleGeneratePlan} 
          disabled={isLoadingFarmPlan}
          className="mt-6"
        >
          {isLoadingFarmPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoadingFarmPlan ? 'Generating Plan...' : 'Generate Farm Plan'}
        </Button>
      </div>

      {farmPlanError && (
        <Card className="border-red-500 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-500">Error generating farm plan: {farmPlanError.message}</p>
          </CardContent>
        </Card>
      )}

      {farmPlan && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Farm Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p>{farmPlan.planSummary}</p>
            </div>

            {farmPlan.suggestedPlantingDates && Object.keys(farmPlan.suggestedPlantingDates).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Suggested Planting Dates:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(farmPlan.suggestedPlantingDates).map(([crop, date]) => (
                    <li key={crop}>{crop}: {new Date(date).toLocaleDateString()}</li>
                  ))}
                </ul>
              </div>
          )}

            {farmPlan.resourceWarnings && farmPlan.resourceWarnings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-amber-600">Resource Warnings:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {farmPlan.resourceWarnings.map((warning, index) => (
                    <li key={index} className="text-amber-700">{warning}</li>
                  ))}
                </ul>
              </div>
          )}
          
          <div style={{ marginTop: '15px' }}>
            <h4>Tasks:</h4>
            {farmPlan.tasks.length > 0 ? (
          </div>

          <CardFooter>
            <Button 
              onClick={handleSavePlan} 
              className="bg-green-600 hover:bg-green-700"
            >
              Save Plan and Tasks
            </Button>
          </CardFooter>
        </Card>
      )}
      </div>
    </FarmPlanErrorBoundary>
  );
};

export default FarmPlanner;
