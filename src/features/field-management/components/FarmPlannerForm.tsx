import { useState, FC } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';

interface FarmPlannerFormProps {
  onSubmit: (formData: {
    cropTypes: string;
    currentSeason: string;
    userGoals: string;
  }) => void;
  isLoading: boolean;
}

const FarmPlannerForm: FC<FarmPlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [cropTypesInput, setCropTypesInput] = useState<string>('');
  const [currentSeasonInput, setCurrentSeasonInput] = useState<string>('');
  const [userGoalsInput, setUserGoalsInput] = useState<string>('');

  const handleSubmit = () => {
    onSubmit({
      cropTypes: cropTypesInput,
      currentSeason: currentSeasonInput,
      userGoals: userGoalsInput,
    });
  };

  return (
    <div className="space-y-6">
      <h2>AI Farm Planner</h2>
      <div className="mb-4">
        <div>
          <Label htmlFor="cropTypes" className="mr-2">
            Crop Types (comma-separated):
          </Label>
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
          <Label htmlFor="currentSeason" className="mr-2">
            Current Season:
          </Label>
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
          <Label htmlFor="userGoals" className="block mb-2">
            User Goals (one per line):
          </Label>
          <Textarea
            id="userGoals"
            value={userGoalsInput}
            onChange={(e) => setUserGoalsInput(e.target.value)}
            placeholder="e.g., Maximize yield\nImprove soil health"
            rows={3}
            className="w-full md:w-80"
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="mt-6">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Generating Plan...' : 'Generate Farm Plan'}
        </Button>
      </div>
    </div>
  );
};

export default FarmPlannerForm; 