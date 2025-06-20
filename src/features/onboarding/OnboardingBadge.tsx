import { motion } from 'framer-motion';
import { Seedling, Sprout, Leaf, Flower2, Award } from 'lucide-react';

const badgeLevels = [
  { step: 1, icon: Seedling, title: 'Farm Seedling', color: 'text-green-500' },
  { step: 2, icon: Sprout, title: 'Crop Sprout', color: 'text-lime-600' },
  { step: 3, icon: Leaf, title: 'Growth Expert', color: 'text-emerald-600' },
  { step: 4, icon: Flower2, title: 'Resourceful Farmer', color: 'text-teal-600' },
  { step: 5, icon: Award, title: 'Harvest Hero', color: 'text-amber-500' },
];

interface OnboardingBadgeProps {
  currentStep: number;
}

export function OnboardingBadge({ currentStep }: OnboardingBadgeProps) {
  const currentBadge = badgeLevels.find(b => b.step === currentStep);

  if (!currentBadge) return null;

  const Icon = currentBadge.icon;

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center justify-center space-x-2 rounded-full bg-gray-100 px-4 py-2 my-4"
    >
      <Icon className={`w-6 h-6 ${currentBadge.color}`} />
      <span className="font-semibold text-gray-700">{currentBadge.title}</span>
    </motion.div>
  );
}
