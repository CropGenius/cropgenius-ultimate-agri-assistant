// src/components/FarmPlanner.tsx

import React, { useState, useCallback } from 'react';
import { useAIAgentHub } from '../hooks/useAIAgentHub';
import { FarmPlanInput, FarmPlanOutput, FarmTask } from '../agents/AIFarmPlanAgent';

const FarmPlanner: React.FC = () => {
  const {
    getFarmPlan,
    saveFarmPlan,
    farmPlan,
    isLoadingFarmPlan,
    farmPlanError,
    // Assuming useAuth is integrated into useAIAgentHub and provides user/farmId implicitly or through context
    // If not, we'd need to get user and currentFarmId from useAuth here
  } = useAIAgentHub();

  const [cropTypesInput, setCropTypesInput] = useState<string>(''); // Comma-separated
  const [currentSeasonInput, setCurrentSeasonInput] = useState<string>('');
  const [userGoalsInput, setUserGoalsInput] = useState<string>('');
  const [generatedPlanInput, setGeneratedPlanInput] = useState<FarmPlanInput | null>(null);


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
      // The hook's getFarmPlan will inject userId, farmId, weather, and market context
      // and now returns an object { plan: FarmPlanOutput, inputUsed: FarmPlanInput }
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
      // generatedPlanInput now holds the exact input (including userId, farmId, weather/market context)
      // that was constructed by the hook and used by the agent.
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>AI Farm Planner</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div>
          <label htmlFor="cropTypes" style={{ marginRight: '10px' }}>Crop Types (comma-separated):</label>
          <input 
            type="text" 
            id="cropTypes" 
            value={cropTypesInput} 
            onChange={(e) => setCropTypesInput(e.target.value)} 
            placeholder="e.g., Maize, Beans, Tomato"
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="currentSeason" style={{ marginRight: '10px' }}>Current Season:</label>
          <input 
            type="text" 
            id="currentSeason" 
            value={currentSeasonInput} 
            onChange={(e) => setCurrentSeasonInput(e.target.value)} 
            placeholder="e.g., Long Rains 2024"
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="userGoals" style={{ display: 'block', marginBottom: '5px' }}>User Goals (one per line):</label>
          <textarea 
            id="userGoals" 
            value={userGoalsInput} 
            onChange={(e) => setUserGoalsInput(e.target.value)} 
            placeholder="e.g., Maximize yield\nImprove soil health"
            rows={3}
            style={{ width: '300px', padding: '8px' }}
          />
        </div>
        <button 
          onClick={handleGeneratePlan} 
          disabled={isLoadingFarmPlan}
          style={{ marginTop: '15px', padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
        >
          {isLoadingFarmPlan ? 'Generating Plan...' : 'Generate Farm Plan'}
        </button>
      </div>

      {farmPlanError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <p>Error generating farm plan: {farmPlanError.message}</p>
        </div>
      )}

      {farmPlan && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>Generated Farm Plan</h3>
          <p><strong>Summary:</strong> {farmPlan.planSummary}</p>

          {farmPlan.suggestedPlantingDates && Object.keys(farmPlan.suggestedPlantingDates).length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4>Suggested Planting Dates:</h4>
              <ul>
                {Object.entries(farmPlan.suggestedPlantingDates).map(([crop, date]) => (
                  <li key={crop}>{crop}: {new Date(date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}

          {farmPlan.resourceWarnings && farmPlan.resourceWarnings.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4>Resource Warnings:</h4>
              <ul>
                {farmPlan.resourceWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '15px' }}>
            <h4>Tasks:</h4>
            {farmPlan.tasks.length > 0 ? (
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {farmPlan.tasks.map((task, index) => (
                  <li key={task.id || index} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                    <strong>{task.title}</strong> ({task.priority}, {task.category})
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>{task.description}</p>
                    {task.dueDate && <p style={{ margin: '5px 0 0 0', fontSize: '0.8em' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tasks generated for this plan.</p>
            )}
          </div>

          <button 
            onClick={handleSavePlan} 
            // disabled={!generatedPlanInput} // Or some other condition to ensure plan is ready to be saved
            style={{ marginTop: '20px', padding: '10px 15px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white' }}
          >
            Save Plan and Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmPlanner;
