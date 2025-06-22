import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { YieldBadge } from '../YieldBadge';
import { ProgressMeter } from '../ProgressMeter';
import { OnboardingBadge } from '../OnboardingBadge';
import { useState } from 'react';

const schema = z.object({
  farmName: z.string().min(3, 'Farm name must be at least 3 characters'),
  totalArea: z.number().min(0.1, 'Area must be at least 0.1 hectares'),
});

type FormData = z.infer<typeof schema>;

export interface StepOneProps {
  farmName?: string;
  totalArea?: number;
  onNext: (data: Partial<FormData>) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export default function StepOneFarmVitals({ 
  farmName = '', 
  totalArea = 0, 
  onNext, 
  onBack,
  isLastStep = false 
}: StepOneProps) {
  const [area, setArea] = useState(totalArea);
  const defaultValues = { farmName, totalArea };
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });

  const onSubmit = (data: FormData) => {
    onNext(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-white rounded-2xl shadow-2xl space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Farm Genius!</h1>
        <p className="text-gray-500 mt-2">Let's set up your farm to unlock its true potential.</p>
      </div>

      <OnboardingBadge currentStep={1} />
      <ProgressMeter progress={15} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="farmName">What's your farm's name?</Label>
          <Input id="farmName" {...register('farmName')} placeholder="e.g., Green Valley Farms" />
          {errors.farmName && <p className="text-red-500 text-sm mt-1">{errors.farmName.message}</p>}
        </div>
        <div>
          <Label htmlFor="totalArea">Total Area (in Hectares)</Label>
          <Input
            id="totalArea"
            type="number"
            step="0.1"
            {...register('totalArea', { valueAsNumber: true })}
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            placeholder="e.g., 15.5"
          />
          {errors.totalArea && <p className="text-red-500 text-sm mt-1">{errors.totalArea.message}</p>}
        </div>
        
        <YieldBadge area={area} />

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
