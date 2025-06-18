import { motion } from 'framer-motion';
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  bgColorClass: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  bgColorClass,
}) => {
  return (
    <motion.div
      className={`rounded-2xl p-4 text-white shadow-lg backdrop-blur-md bg-white/10 border border-white/20`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 mb-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColorClass}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-200 mb-4">{description}</p>
      <button
        onClick={onAction}
        className="w-full py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
      >
        {actionText}
      </button>
    </motion.div>
  );
};
