import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { OnboardingData } from '@/types/onboarding';

/**
 * The step can be rendered in two different wizard implementations.
 * 1) The new wizard passes a `formData` object along with `isLoading`.
 * 2) The legacy wizard spreads the collected form fields directly as props
 *    (farmName, crops, etc.) together with the usual `onNext/onBack` props.
 * To stay compatible with both we declare all OnboardingData keys as optional
 * props in addition to an optional `formData` object.
 */
type StepSixBaseProps = Partial<OnboardingData> & {
  /** Called when user clicks the final "Enter Mission Control" button */
  onFinish?: () => Promise<void>;
  /** Fallback for legacy wizards that still use `onNext` instead of `onFinish` */
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  /** The collected form data when provided as an object (new wizard) */
  formData?: Partial<OnboardingData>;
};

type StepSixProps = StepSixBaseProps;

const getFirstTasks = (crops: string[] | undefined) => [
  `Analyze satellite imagery for your ${crops && crops.length > 0 ? crops[0] : 'fields'}.`,
  'Generate a 7-day hyper-local weather forecast.',
  `Recommend top 3 fertilizer blends for ${crops && crops.length > 0 ? crops.join(', ') : 'your chosen crops'}.`,
];

export default function StepSixGeniusPlan(props: StepSixProps) {
  const {
    onFinish,
    onNext,
    onBack,
    isLoading = false,
    formData,
    crops,
  } = props;

  // Resolve the crop list depending on which props variant we received
  const resolvedCrops: string[] | undefined = formData?.crops ?? crops;

  const firstTasks = getFirstTasks(resolvedCrops);

  // Prefer onFinish if provided, otherwise fall back to onNext (legacy)
  const finishHandler = async () => {
    try {
      if (onFinish) {
      await onFinish();
      } else if (onNext) {
        // Legacy wizard signature doesn't return a promise
        onNext();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const { width, height } = useWindowSize();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="p-8 bg-white rounded-2xl shadow-2xl space-y-6 text-center"
    >
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
      <div className="mx-auto bg-gradient-to-r from-emerald-500 to-lime-600 w-20 h-20 rounded-full flex items-center justify-center">
        <CheckCircle2 className="text-white w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Your Genius Plan is Ready!</h1>
      <p className="text-gray-500 mt-2">You've unlocked personalized intelligence. Here's what CropGenius will do first:</p>

      <div className="text-left bg-gray-50 p-4 rounded-lg space-y-2">
        {firstTasks.map((task, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.2 }}
            className="flex items-start"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 mt-1 flex-shrink-0" />
            <span>{task}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col space-y-3">
        <Button 
          onClick={finishHandler} 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-lime-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizing...
            </>
          ) : (
            'Enter Mission Control 🚀'
          )}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full mt-2"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    </motion.div>
  );
}
