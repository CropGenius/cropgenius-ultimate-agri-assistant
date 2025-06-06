import React, { useEffect } from 'react';
import { useFieldBrain } from '@/hooks/useFieldBrain';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FieldBrainMiniPanelProps {
  fieldId?: string;
  className?: string;
}

const FieldBrainMiniPanel = ({
  fieldId,
  className,
}: FieldBrainMiniPanelProps) => {
  const { isInitialized, getSuggestedAction, getFieldHealth, setFieldContext } =
    useFieldBrain();
  const navigate = useNavigate();

  // Set field context when fieldId changes
  useEffect(() => {
    if (isInitialized && fieldId) {
      setFieldContext(fieldId);
    }
  }, [isInitialized, fieldId, setFieldContext]);

  // Get the suggested action and field health
  const suggestedAction = getSuggestedAction();
  const fieldHealth = getFieldHealth();

  // Determine urgency color
  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50';
      case 'medium':
        return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50';
    }
  };

  // Determine health icon
  const HealthIcon =
    fieldHealth.score > 80
      ? CheckCircle
      : fieldHealth.score > 60
        ? AlertCircle
        : AlertTriangle;

  // Determine health color
  const getHealthColor = (score: number) => {
    if (score > 80) return 'text-green-500 dark:text-green-400';
    if (score > 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <Card
      className={cn(
        'overflow-hidden shadow-md hover:shadow-lg transition-all',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Field Health Indicator */}
        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
          <div className="flex items-center">
            <HealthIcon
              className={cn('h-5 w-5 mr-2', getHealthColor(fieldHealth.score))}
            />
            <span className="text-sm font-medium">Field Health</span>
          </div>
          <div className="text-sm font-bold">{fieldHealth.score}%</div>
        </div>

        {/* Suggested Action */}
        <div
          className={cn(
            'p-3 border-l-4 text-sm',
            getUrgencyColor(suggestedAction.urgency)
          )}
        >
          <p className="font-medium">Suggested Action:</p>
          <p className="mt-1">{suggestedAction.action}</p>
        </div>

        {/* Quick Access Button */}
        <div className="p-3 bg-muted/20">
          <Button
            variant="outline"
            className="w-full text-sm h-8 flex items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate('/chat')}
          >
            Ask FieldBrain AI
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldBrainMiniPanel;
