import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProgressMeter } from '../ProgressMeter';
import { OnboardingBadge } from '../OnboardingBadge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const goals = ['Increase Yield', 'Reduce Costs', 'Improve Soil Health', 'Better Market Price'];
const painPoints = ['Pest & Disease', 'Unpredictable Weather', 'High Input Costs', 'Access to Market'];

const schema = z.object({
  primaryGoal: z.string({ required_error: 'Please select a primary goal.' }),
  primaryPainPoint: z.string({ required_error: 'Please select your biggest challenge.' }),
});

type FormData = z.infer<typeof schema>;

export interface StepThreeProps {
  primaryGoal?: string;
  primaryPainPoint?: string;
  onNext: (data: Partial<FormData>) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export default function StepThreeGoals({ 
  primaryGoal = '', 
  primaryPainPoint = '', 
  onNext, 
  onBack,
  isLastStep = false 
}: StepThreeProps) {
  const defaultValues = { primaryGoal, primaryPainPoint };
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-white rounded-2xl shadow-2xl space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Goals & Challenges</h1>
        <p className="text-gray-500 mt-2">What do you want to achieve? What stands in your way?</p>
      </div>

      <OnboardingBadge currentStep={3} />
      <ProgressMeter progress={50} />

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div>
          <Label className="text-center block mb-2">What is your #1 goal this season?</Label>
          <Controller
            name="primaryGoal"
            control={control}
            render={({ field }) => (
              <ToggleGroup type="single" variant="outline" onValueChange={field.onChange} value={field.value} className="flex-wrap justify-center">
                {goals.map(goal => (
                  <ToggleGroupItem key={goal} value={goal}>{goal}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </div>

        <div>
          <Label className="text-center block mb-2">What is your biggest challenge?</Label>
          <Controller
            name="primaryPainPoint"
            control={control}
            render={({ field }) => (
              <ToggleGroup type="single" variant="outline" onValueChange={field.onChange} value={field.value} className="flex-wrap justify-center">
                {painPoints.map(pain => (
                  <ToggleGroupItem key={pain} value={pain}>{pain}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </div>

        <div className="flex flex-col space-y-3">
          <Button 
            type="submit" 
            disabled={!isValid} 
            className="w-full bg-gradient-to-r from-emerald-500 to-lime-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform"
          >
            {isLastStep ? 'Complete Setup' : 'Next Genius Tip'} {!isLastStep && '➜'}
          </Button>
          
          {onBack && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="w-full"
            >
              ← Back
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
