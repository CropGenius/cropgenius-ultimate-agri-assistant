import { motion } from 'framer-motion';

interface ProgressMeterProps {
  progress: number; // A value between 0 and 100
}

export function ProgressMeter({ progress }: ProgressMeterProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div
        className="bg-gradient-to-r from-emerald-500 to-lime-600 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </div>
  );
}
