import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProgressMeter } from '../ProgressMeter';
import { OnboardingBadge } from '../OnboardingBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  preferredLanguage: z.string().min(2, 'Language is required'),
  whatsappNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StepFiveProps {
  onNext: (data: FormData) => void;
  defaultValues: Partial<FormData>;
}

export default function StepFiveProfile({ onNext, defaultValues }: StepFiveProps) {
  const {
    control,
    register,
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
        <h1 className="text-3xl font-bold text-gray-800">Final Touches</h1>
        <p className="text-gray-500 mt-2">Let's personalize your experience and alerts.</p>
      </div>

      <OnboardingBadge currentStep={5} />
      <ProgressMeter progress={90} />

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div>
          <Label>Preferred Language</Label>
          <Controller
            name="preferredLanguage"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ha">Hausa</SelectItem>
                  <SelectItem value="yo">Yoruba</SelectItem>
                  <SelectItem value="ig">Igbo</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp Number (for alerts)</Label>
          <Input id="whatsapp" {...register('whatsappNumber')} placeholder="+234... (Optional)" />
        </div>

        <Button type="submit" disabled={!isValid} className="w-full bg-gradient-to-r from-emerald-500 to-lime-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform">
          Generate My Genius Plan! 🚀
        </Button>
      </form>
    </motion.div>
  );
}
