import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface YieldBadgeProps {
  area: number;
}

// A simple, optimistic calculation to provide instant feedback
const CROP_YIELD_FACTOR = 1.18; // Represents an 18% potential increase per hectare

export function YieldBadge({ area }: YieldBadgeProps) {
  const potentialYieldIncrease = useMemo(() => {
    if (!area || area <= 0) return 0;
    // This formula is for psychological effect, not scientific accuracy
    const yieldValue = (Math.log(area + 1) * CROP_YIELD_FACTOR * 10);
    return Math.min(Math.round(yieldValue), 99); // Cap at 99%
  }, [area]);

  if (potentialYieldIncrease === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="bg-lime-100 text-lime-800 p-3 rounded-lg text-center"
    >
      <p className="font-bold">
        Potential Yield ↑ <span className="text-2xl">{potentialYieldIncrease}%</span>
      </p>
      <p className="text-xs">Based on your farm size. More data unlocks more potential!</p>
    </motion.div>
  );
}
