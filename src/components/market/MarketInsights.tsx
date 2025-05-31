import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, TrendUpDown, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  confidence: number;
}

interface MarketInsightsProps {
  insights: MarketInsight[];
  className?: string;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({
  insights,
  className = '',
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
      default:
        return <TrendUpDown className="w-4 h-4 text-blue-500" />;
    }
  };

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No market insights available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Market Insights</CardTitle>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Updated just now</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border-b pb-4 last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{insight.title}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getImpactColor(insight.impact)}>
                    {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                  </Badge>
                  <div className="flex items-center">
                    {getTrendIcon(insight.trend)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {insight.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Timeframe: {insight.timeframe}</span>
                <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
