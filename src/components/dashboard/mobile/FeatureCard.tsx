import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
  className = '',
  variant = 'default',
  disabled = false,
}) => {
  const variantClasses = {
    default: 'bg-white/80 hover:bg-white/90 border-gray-200',
    primary: 'bg-blue-50/80 hover:bg-blue-50/90 border-blue-200',
    success: 'bg-green-50/80 hover:bg-green-50/90 border-green-200',
    warning: 'bg-yellow-50/80 hover:bg-yellow-50/90 border-yellow-200',
    danger: 'bg-red-50/80 hover:bg-red-50/90 border-red-200',
  };

  const iconClasses = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <motion.div
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'relative p-4 rounded-2xl border backdrop-blur-sm transition-all',
        'shadow-sm hover:shadow-md active:shadow-sm',
        variantClasses[variant],
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          'p-2 rounded-lg',
          'flex-shrink-0',
          iconClasses[variant]
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
