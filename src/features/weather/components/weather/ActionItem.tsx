import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  Wheat,
  Droplet,
  ShieldAlert,
  Tractor,
  CircleDollarSign,
  XCircle,
  Zap,
  LineChart,
  Sprout,
} from 'lucide-react';
import MiniChart from './MiniChart';

interface ActionItemProps {
  action: {
    id: string;
    title: string;
    description: string;
    urgency: string;
    icon: string;
    expiresIn: string;
    efficiencyGain: number;
    yieldImpact: number;
    actionButton: {
      text: string;
      onClick: () => void;
    };
    chartData: {
      type: string;
      values: number[];
      labels: string[];
    };
  };
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
}

export default function ActionItem({
  action,
  isCompleted,
  onToggleComplete,
}: ActionItemProps) {
  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'droplet':
        return <Droplet className="h-5 w-5" />;
      case 'shield-alert':
        return <ShieldAlert className="h-5 w-5" />;
      case 'tractor':
        return <Tractor className="h-5 w-5" />;
      case 'circle-dollar-sign':
        return <CircleDollarSign className="h-5 w-5" />;
      case 'x-circle':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Wheat className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Important</Badge>;
      default:
        return <Badge className="bg-blue-500">Plan Ahead</Badge>;
    }
  };

  return (
    <div
      className={`flex flex-col space-y-3 p-3 rounded-lg border ${
        isCompleted
          ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-75'
          : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-full ${getUrgencyColor(action.urgency)} text-white`}
        >
          {getActionIcon(action.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4
              className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
            >
              {action.title}
            </h4>
            {!isCompleted && getUrgencyBadge(action.urgency)}
          </div>
          <p
            className={`text-sm mt-1 ${isCompleted ? 'text-muted-foreground' : ''}`}
          >
            {action.description}
          </p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Expires in: {action.expiresIn}</span>
            </div>
            <Button
              variant={isCompleted ? 'outline' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onToggleComplete(action.id)}
            >
              {isCompleted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Mark Complete
                  <CheckCircle className="h-3 w-3" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Visualization & Action Button */}
      {!isCompleted && (
        <div className="pt-1 border-t">
          {/* Mini Chart Visualization */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center">
                <LineChart className="h-3 w-3 mr-1" />
                {action.chartData.type === 'rainfall' &&
                  'Rainfall Forecast (mm)'}
                {action.chartData.type === 'temperature' &&
                  'Temperature Trend (°C)'}
                {action.chartData.type === 'humidity' && 'Humidity Levels (%)'}
                {action.chartData.type === 'price' && 'Market Price Trend (%)'}
                {action.chartData.type === 'harvest' &&
                  'Crop Maturity Index (%)'}
              </span>
              <span className="flex items-center">
                <Sprout className="h-3 w-3 mr-1 text-green-500" />
                Impact: +{action.yieldImpact}% Yield
              </span>
            </div>

            <MiniChart
              type={action.chartData.type}
              data={action.chartData.values}
              labels={action.chartData.labels}
            />
          </div>

          {/* Instant Action Button */}
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
            size="sm"
            onClick={action.actionButton.onClick}
          >
            <Zap className="h-4 w-4 mr-2" />
            {action.actionButton.text}
          </Button>
        </div>
      )}
    </div>
  );
}
