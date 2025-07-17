/**
 * ConfidenceScore Component
 * Displays confidence score with color coding based on percentage
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number;
  showIcon?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  score,
  showIcon = true,
  showProgress = false,
  size = 'md',
  className
}) => {
  // Determine color based on confidence score
  const getScoreColor = (score: number) => {
    if (score > 95) return 'green';
    if (score >= 85) return 'yellow';
    return 'red';
  };
  
  const getScoreVariant = (color: string) => {
    switch (color) {
      case 'green':
        return 'default'; // Green background
      case 'yellow':
        return 'secondary'; // Yellow/amber background
      case 'red':
        return 'destructive'; // Red background
      default:
        return 'secondary';
    }
  };
  
  const getScoreIcon = (color: string) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    switch (color) {
      case 'green':
        return <CheckCircle2 className={cn(iconSize, 'text-green-600')} />;
      case 'yellow':
        return <AlertTriangle className={cn(iconSize, 'text-amber-600')} />;
      case 'red':
        return <XCircle className={cn(iconSize, 'text-red-600')} />;
      default:
        return null;
    }
  };
  
  const getProgressColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-amber-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const color = getScoreColor(score);
  const variant = getScoreVariant(color);
  const icon = getScoreIcon(color);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Badge 
        variant={variant}
        className={cn(
          'flex items-center gap-2 w-fit',
          sizeClasses[size]
        )}
      >
        {showIcon && icon}
        <span className="font-medium">
          {score}% Confidence
        </span>
      </Badge>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress 
            value={score} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
};