import { FC } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { FarmPlanOutput } from '../agents/AIFarmPlanAgent';

interface FarmPlanDisplayProps {
  farmPlan: FarmPlanOutput;
  onSave: () => void;
}

const FarmPlanDisplay: FC<FarmPlanDisplayProps> = ({ farmPlan, onSave }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Generated Farm Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Summary:</h4>
          <p>{farmPlan.planSummary}</p>
        </div>

        {farmPlan.suggestedPlantingDates &&
          Object.keys(farmPlan.suggestedPlantingDates).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Suggested Planting Dates:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(farmPlan.suggestedPlantingDates).map(
                  ([crop, date]) => (
                    <li key={crop}>
                      {crop}: {new Date(date).toLocaleDateString()}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        {farmPlan.resourceWarnings &&
          farmPlan.resourceWarnings.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-amber-600">
                Resource Warnings:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {farmPlan.resourceWarnings.map((warning, index) => (
                  <li key={index} className="text-amber-700">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div style={{ marginTop: '15px' }}>
          <h4>Tasks:</h4>
          {farmPlan.tasks.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {farmPlan.tasks.map((task, index) => (
                <li key={index}>{task.description}</li>
              ))}
            </ul>
          ) : (
            <p>No tasks generated.</p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
          Save Plan and Tasks
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FarmPlanDisplay; 