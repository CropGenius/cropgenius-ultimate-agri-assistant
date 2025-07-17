/**
 * DemandIndicator Component
 * Advanced demand visualization with market intelligence and actionable insights
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemandIndicator as DemandIndicatorType } from '@/api/marketDataApi';

interface DemandIndicatorProps {
  data: DemandIndicatorType;
  showRecommendation?: boolean;
  showDetails?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface DemandLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface SupplyLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
}

const DEMAND_LEVEL_CONFIG: Record<string, DemandLevelConfig> = {
  low: {
    label: 'Low Demand',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: TrendingDown,
    description: 'Market showing reduced interest in this crop',
    urgency: 'low'
  },
  medium: {
    label: 'Medium Demand',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Activity,
    description: 'Steady market demand with normal activity',
    urgency: 'medium'
  },
  high: {
    label: 'High Demand',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: TrendingUp,
    description: 'Strong market demand with active buying',
    urgency: 'high'
  },
  critical: {
    label: 'Critical Demand',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: Zap,
    description: 'Urgent market demand with supply shortages',
    urgency: 'critical'
  }
};

const SUPPLY_LEVEL_CONFIG: Record<string, SupplyLevelConfig> = {
  low: {
    label: 'Low Supply',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Limited supply available in market',
    impact: 'positive'
  },
  medium: {
    label: 'Medium Supply',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Balanced supply levels',
    impact: 'neutral'
  },
  high: {
    label: 'High Supply',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Abundant supply in market',
    impact: 'negative'
  },
  oversupply: {
    label: 'Oversupply',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Market flooded with excess supply',
    impact: 'negative'
  }
};

export const DemandIndicator: React.FC<DemandIndicatorProps> = ({
  data,
  showRecommendation = true,
  showDetails = true,
  onRefresh,
  isLoading = false,
  className
}) => {
  const demandConfig = DEMAND_LEVEL_CONFIG[data.demand_level];
  const supplyConfig = SUPPLY_LEVEL_CONFIG[data.supply_level];
  
  // Calculate market health score (0-100)
  const marketHealthScore = React.useMemo(() => {
    let score = 50; // Base score
    
    // Demand factor
    switch (data.demand_level) {
      case 'critical':
        score += 30;
        break;
      case 'high':
        score += 20;
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score -= 10;
        break;
    }
    
    // Supply factor (inverse relationship)
    switch (data.supply_level) {
      case 'low':
        score += 20;
        break;
      case 'medium':
        score += 5;
        break;
      case 'high':
        score -= 10;
        break;
      case 'oversupply':
        score -= 20;
        break;
    }
    
    // Activity factor
    if (data.market_activity > 20) score += 10;
    else if (data.market_activity < 5) score -= 10;
    
    // Volatility factor (high volatility can be good or bad)
    if (data.price_volatility > 0.3) score -= 5;
    
    // Seasonal factor
    if (data.seasonal_factor > 1.1) score += 5;
    else if (data.seasonal_factor < 0.9) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }, [data]);

  // Get market health color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get market health description
  const getHealthDescription = (score: number) => {
    if (score >= 80) return 'Excellent market conditions';
    if (score >= 60) return 'Good market opportunity';
    if (score >= 40) return 'Moderate market conditions';
    return 'Challenging market conditions';
  };

  // Render demand level badge
  const renderDemandBadge = () => {
    const DemandIcon = demandConfig.icon;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('gap-2', demandConfig.bgColor)}>
              <DemandIcon className="h-3 w-3" />
              <span className={demandConfig.color}>{demandConfig.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{demandConfig.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render supply level badge
  const renderSupplyBadge = () => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('gap-2', supplyConfig.bgColor)}>
              <Target className="h-3 w-3" />
              <span className={supplyConfig.color}>{supplyConfig.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{supplyConfig.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render market metrics
  const renderMetrics = () => {
    if (!showDetails) return null;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Market Activity</span>
            <span className="text-sm font-medium">{data.market_activity}</span>
          </div>
          <Progress 
            value={Math.min(100, (data.market_activity / 50) * 100)} 
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price Volatility</span>
            <span className="text-sm font-medium">{(data.price_volatility * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(100, data.price_volatility * 200)} 
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Seasonal Factor</span>
            <span className="text-sm font-medium">{data.seasonal_factor.toFixed(2)}x</span>
          </div>
          <Progress 
            value={Math.min(100, data.seasonal_factor * 50)} 
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Market Health</span>
            <span className={cn('text-sm font-medium', getHealthColor(marketHealthScore))}>
              {marketHealthScore}/100
            </span>
          </div>
          <Progress 
            value={marketHealthScore} 
            className="h-2"
          />
        </div>
      </div>
    );
  };

  // Render recommendation
  const renderRecommendation = () => {
    if (!showRecommendation || !data.recommendation) return null;

    const urgency = demandConfig.urgency;
    const urgencyConfig = {
      low: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
      medium: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
      high: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
      critical: { icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
    };

    const config = urgencyConfig[urgency];
    const RecommendationIcon = config.icon;

    return (
      <div className={cn('p-4 rounded-lg border', config.bgColor)}>
        <div className="flex items-start gap-3">
          <RecommendationIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
          <div className="space-y-2">
            <h4 className={cn('font-medium', config.color)}>
              Market Recommendation
            </h4>
            <p className="text-sm text-gray-700">
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Demand Analysis
            </CardTitle>
            <CardDescription>
              {data.crop_name} market intelligence and demand indicators
            </CardDescription>
          </div>
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Market Health Score */}
        <div className="text-center">
          <div className={cn('text-3xl font-bold', getHealthColor(marketHealthScore))}>
            {marketHealthScore}/100
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {getHealthDescription(marketHealthScore)}
          </p>
        </div>

        <Separator />

        {/* Demand and Supply Levels */}
        <div className="flex items-center justify-center gap-4">
          {renderDemandBadge()}
          {renderSupplyBadge()}
        </div>

        {/* Market Metrics */}
        {renderMetrics()}

        {/* Recommendation */}
        {renderRecommendation()}

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};