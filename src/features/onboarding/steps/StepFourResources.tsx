import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProgressMeter } from '../ProgressMeter';
import { OnboardingBadge } from '../OnboardingBadge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const schema = z.object({
  hasIrrigation: z.boolean().default(false),
  hasMachinery: z.boolean().default(false),
  hasSoilTest: z.boolean().default(false),
  budgetBand: z.enum(['low', 'medium', 'high'], { required_error: 'Please select a budget range.' }),
});

type FormData = z.infer<typeof schema>;

export interface StepFourProps {
  hasIrrigation?: boolean;
  hasMachinery?: boolean;
  hasSoilTest?: boolean;
  budgetBand?: 'low' | 'medium' | 'high';
  onNext: (data: Partial<FormData>) => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export default function StepFourResources({ 
  hasIrrigation = false, 
  hasMachinery = false, 
  hasSoilTest = false, 
  budgetBand = 'medium',
  onNext, 
  onBack,
  isLastStep = false 
}: StepFourProps) {
  const defaultValues = { hasIrrigation, hasMachinery, hasSoilTest, budgetBand };
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      hasIrrigation: false,
      hasMachinery: false,
      hasSoilTest: false,
      ...defaultValues,
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Resources & Budget</h1>
        <p className="text-gray-500 mt-2">What are you working with? Honesty helps us give realistic advice.</p>
      </div>

      <OnboardingBadge currentStep={4} />
      <ProgressMeter progress={75} />

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div className="space-y-4">
            <Controller
              name="hasIrrigation"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="irrigation-switch">Do you have irrigation?</Label>
                    <Switch id="irrigation-switch" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
            <Controller
              name="hasMachinery"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="machinery-switch">Do you own/rent machinery?</Label>
                    <Switch id="machinery-switch" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
            <Controller
              name="hasSoilTest"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="soil-test-switch">Have you done a recent soil test?</Label>
                    <Switch id="soil-test-switch" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
        </div>

        <div>
          <Label className="text-center block mb-2">What's your approximate budget for this season?</Label>
          <Controller
            name="budgetBand"
            control={control}
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
                <div><RadioGroupItem value="low" id="low" className="peer sr-only" /><Label htmlFor="low" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Low</Label></div>
                <div><RadioGroupItem value="medium" id="medium" className="peer sr-only" /><Label htmlFor="medium" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Medium</Label></div>
                <div><RadioGroupItem value="high" id="high" className="peer sr-only" /><Label htmlFor="high" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">High</Label></div>
              </RadioGroup>
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
