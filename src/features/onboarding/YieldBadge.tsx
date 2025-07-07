import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface YieldBadgeProps {
  value: number;
  unit: string;
  className?: string;
  ariaLabel?: string;
}

const YIELD_VARIANTS = {
  low: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-green-100 text-green-800'
};

export function YieldBadge({ 
  value, 
  unit, 
  className = '',
  ariaLabel = 'Yield indicator'
}: YieldBadgeProps) {
  const yieldLevel = useMemo(() => {
    if (value >= 80) return 'high';
    if (value >= 40) return 'medium';
    return 'low';
  }, [value]);

  const getIcon = () => {
    switch (yieldLevel) {
      case 'low': return '↓';
      case 'medium': return '→';
      case 'high': return '↑';
      default: return '';
    }
  };

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`p-3 rounded-lg text-center ${className} ${YIELD_VARIANTS[yieldLevel]}`}
      data-testid="yield-badge"
    >
      <div className="flex items-center justify-center">
        <span className="text-2xl font-bold">{value}</span>
        <span className="mx-2 text-xl">{getIcon()}</span>
        <span className="text-lg">{unit}</span>
      </div>
    </motion.div>
  );
}
