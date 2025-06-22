import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProgressMeter } from '../ProgressMeter';
import { OnboardingBadge } from '../OnboardingBadge';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const availableCrops = ['Maize', 'Rice', 'Cassava', 'Yam', 'Sorghum', 'Millet'];

const schema = z.object({
  crops: z.array(z.string()).min(1, 'Please select at least one crop'),
  plantingDate: z.date({ required_error: 'Planting date is required.' }),
  harvestDate: z.date({ required_error: 'Harvest date is required.' }),
}).refine(data => data.harvestDate > data.plantingDate, {
  message: 'Harvest must be after planting',
  path: ['harvestDate'],
});

type FormData = z.infer<typeof schema>;

export interface StepTwoProps {
  crops?: string[];
  plantingDate?: Date | null;
  harvestDate?: Date | null;
  onNext: (data: Partial<FormData>) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export default function StepTwoCropSeasons({ 
  crops = [], 
  plantingDate, 
  harvestDate, 
  onNext, 
  onBack,
  isLastStep = false 
}: StepTwoProps) {
  const defaultValues = { 
    crops: Array.isArray(crops) ? crops : [],
    plantingDate: plantingDate || undefined,
    harvestDate: harvestDate || undefined
  };

  const {
    control,
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
        <h1 className="text-3xl font-bold text-gray-800">Crops & Seasons</h1>
        <p className="text-gray-500 mt-2">What are you planting this season? This helps us tailor advice.</p>
      </div>

      <OnboardingBadge currentStep={2} />
      <ProgressMeter progress={30} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label>What are your main crops?</Label>
          <Controller
            name="crops"
            control={control}
            render={({ field }) => (
              <ToggleGroup type="multiple" variant="outline" onValueChange={field.onChange} value={field.value} className="flex-wrap justify-center pt-2">
                {availableCrops.map(crop => (
                  <ToggleGroupItem key={crop} value={crop}>{crop}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
          {errors.crops && <p className="text-red-500 text-sm mt-1 text-center">{errors.crops.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="plantingDate"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col space-y-1">
                <Label>Planting Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.plantingDate && <p className="text-red-500 text-sm">{errors.plantingDate.message}</p>}
              </div>
            )}
          />
          <Controller
            name="harvestDate"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col space-y-1">
                <Label>Expected Harvest</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.harvestDate && <p className="text-red-500 text-sm">{errors.harvestDate.message}</p>}
              </div>
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
