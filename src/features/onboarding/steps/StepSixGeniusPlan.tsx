import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface StepSixProps {
  onFinish: () => void;
  formData: any;
}

const firstTasks = (formData: any) => [
  `Analyze satellite imagery for your ${formData.crops && formData.crops.length > 0 ? formData.crops[0] : 'fields'}.`,
  'Generate a 7-day hyper-local weather forecast.',
  `Recommend top 3 fertilizer blends for ${formData.crops && formData.crops.length > 0 ? formData.crops.join(', ') : 'your chosen crops'}.`,
];

export default function StepSixGeniusPlan({ onFinish, formData }: StepSixProps) {
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
        {firstTasks(formData).map((task, index) => (
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

      <Button onClick={onFinish} className="w-full bg-gradient-to-r from-emerald-500 to-lime-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform text-lg">
        Enter Mission Control 🚀
      </Button>
    </motion.div>
  );
}
