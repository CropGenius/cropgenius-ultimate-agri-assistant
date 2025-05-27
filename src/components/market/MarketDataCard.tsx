import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface MarketDataCardProps {
  title: string;
  currentPrice: number;
  changePct: number;
  trend: 'up' | 'down' | 'stable';
  currency: string;
  lastUpdated: string;
  minPrice?: number;
  maxPrice?: number;
  confidence?: number;
  source?: string;
  className?: string;
  children?: React.ReactNode;
}

export const MarketDataCard: React.FC<MarketDataCardProps> = ({
  title,
  currentPrice,
  changePct,
  trend,
  currency,
  lastUpdated,
  minPrice,
  maxPrice,
  confidence = 0.9,
  source = 'Market Data',
  className = '',
  children,
}) => {
  const priceFormatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(currentPrice);

  const changeFormatted = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const isStable = trend === 'stable';

  const priceRange = minPrice !== undefined && maxPrice !== undefined ? 
    ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100 : 0;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-2xl font-bold">{priceFormatted}</span>
              <div 
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isUp ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  isDown ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}
              >
                {isUp && <ArrowUp className="w-3 h-3 mr-1" />}
                {isDown && <ArrowDown className="w-3 h-3 mr-1" />}
                {isStable && <ArrowRight className="w-3 h-3 mr-1" />}
                {changeFormatted}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {minPrice !== undefined && maxPrice !== undefined && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Price Range</span>
              <span>{minPrice.toFixed(2)} - {maxPrice.toFixed(2)} {currency}</span>
            </div>
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <Progress value={priceRange} className="h-2" />
                </div>
                <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {priceRange.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
        
        {confidence && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Data Confidence</span>
              <span>{(confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={confidence * 100} className="h-2" />
          </div>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default MarketDataCard;
