/**
 * 🌾 CROPGENIUS – INTELLIGENT CROP RECOMMENDATION COMPONENT
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Crop Recommendation System
 * - AI-powered recommendations using CropDiseaseOracle
 * - Real-time field data integration with Supabase
 * - Market intelligence and economic viability analysis
 * - Personalized recommendations based on field conditions
 */

import { useState, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  Thermometer, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Brain,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { useCropRecommendations, type FarmContext, type EnhancedCropRecommendation } from '@/hooks/useCropRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CropRecommendationSkeleton from './CropRecommendation/CropRecommendationSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CropRecommendationProps {
  fieldId: string;
  farmContext: FarmContext;
  onSelectCrop?: (cropId: string, confidence: number, aiReasoning: string) => void;
  className?: string;
  showMarketData?: boolean;
  showDiseaseRisk?: boolean;
  showEconomicViability?: boolean;
}

const waterNeedIcons = {
  Low: <Droplets className="h-4 w-4 text-blue-400" />,
  Medium: <Droplets className="h-4 w-4 text-blue-500" />,
  High: <Droplets className="h-4 w-4 text-blue-700" />,
};

const sunExposureIcons = {
  'Full Sun': <Sun className="h-4 w-4 text-yellow-500" />,
  'Partial Shade': <Sun className="h-4 w-4 text-yellow-400" />,
  'Full Shade': <Sun className="h-4 w-4 text-gray-400" />,
};

/**
 * BILLIONAIRE-GRADE Crop Recommendation Component with AI Intelligence
 */
const CropRecommendation: React.FC<CropRecommendationProps> = ({
  fieldId,
  farmContext,
  onSelectCrop,
  className = '',
  showMarketData = true,
  showDiseaseRisk = true,
  showEconomicViability = true,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // Fetch AI-powered crop recommendations
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useCropRecommendations(fieldId, farmContext, {
    enabled: !!fieldId && !!farmContext.userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60, // 1 hour
  });

  // Handle crop selection with enhanced data
  const handleSelectCrop = (crop: EnhancedCropRecommendation) => {
    setSelectedCrop(crop.id);
    onSelectCrop?.(crop.id, crop.confidence, crop.aiReasoning);
  };

  // Loading state with sophisticated skeleton
  if (isLoading) {
    return <CropRecommendationSkeleton className={className} count={3} />;
  }

  // Error state with retry option
  if (error) {
    return (
      <div className={`space-y-4 ${className}`} data-testid="crop-recommendation-error">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>Failed to generate crop recommendations. Unable to analyze your field conditions.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`space-y-4 ${className}`} data-testid="crop-recommendation-empty">
        <Card className="p-8">
          <div className="text-center">
            <Sprout className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Crop Recommendations Available</h3>
            <p className="text-sm text-gray-500 mb-4">
              We couldn't generate recommendations for this field. Please ensure your field has complete information.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`} data-testid="crop-recommendation">
        {/* Header with AI indicator and refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Crop Recommendations</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {recommendations.length} recommendations
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center space-x-2"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((crop) => (
            <Card
              key={crop.id}
              className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                selectedCrop === crop.id ? 'ring-2 ring-green-500 shadow-lg' : ''
              }`}
              data-testid={`crop-card-${crop.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {crop.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={crop.confidence >= 80 ? 'default' : crop.confidence >= 60 ? 'secondary' : 'outline'}
                        className={
                          crop.confidence >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : crop.confidence >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {crop.confidence}% match
                      </Badge>
                      {showEconomicViability && crop.economicViability && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {crop.economicViability.profitabilityScore}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Profitability Score</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectCrop(crop)}
                    className="ml-2"
                    data-testid={`select-crop-${crop.id}`}
                  >
                    Select
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* AI Reasoning */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{crop.aiReasoning}</p>
                  </div>
                </div>

                {/* Basic Growing Conditions */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    {waterNeedIcons[crop.waterNeeds]}
                    <span className="text-gray-600">{crop.waterNeeds}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sunExposureIcons[crop.sunExposure]}
                    <span className="text-gray-600 text-xs">{crop.sunExposure}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-400" />
                    <span className="text-gray-600 text-xs">{crop.temperature}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-600 text-xs">{crop.growingSeason[0]}</span>
                  </div>
                </div>

                {/* Market Data */}
                {showMarketData && crop.marketOutlook && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Market Outlook</span>
                      <TrendingUp className={`h-4 w-4 ${
                        crop.marketOutlook.pricetrend === 'rising' ? 'text-green-600' :
                        crop.marketOutlook.pricetrend === 'falling' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-700">Price: </span>
                        <span className="font-medium">${crop.marketOutlook.currentPrice}/kg</span>
                      </div>
                      <div>
                        <span className="text-green-700">Demand: </span>
                        <span className="font-medium capitalize">{crop.marketOutlook.demandLevel}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disease Risk */}
                {showDiseaseRisk && crop.diseaseRisk && (
                  <div className={`p-3 rounded-lg ${
                    crop.diseaseRisk.level === 'high' ? 'bg-red-50' :
                    crop.diseaseRisk.level === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        crop.diseaseRisk.level === 'high' ? 'text-red-800' :
                        crop.diseaseRisk.level === 'medium' ? 'text-yellow-800' : 'text-green-800'
                      }`}>
                        Disease Risk: {crop.diseaseRisk.level}
                      </span>
                      <AlertTriangle className={`h-4 w-4 ${
                        crop.diseaseRisk.level === 'high' ? 'text-red-600' :
                        crop.diseaseRisk.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="text-xs text-gray-600">
                      Watch for: {crop.diseaseRisk.commonDiseases.slice(0, 2).join(', ')}
                    </div>
                  </div>
                )}

                {/* Expected Yield */}
                {crop.expectedYield && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Expected Yield</span>
                      <span className="text-sm text-gray-600">
                        {crop.expectedYield.min}-{crop.expectedYield.max} {crop.expectedYield.unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Companion Plants */}
                {crop.compatibility && crop.compatibility.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Companion Plants:</p>
                    <div className="flex flex-wrap gap-1">
                      {crop.compatibility.slice(0, 3).map((plant) => (
                        <Badge 
                          key={plant} 
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          {plant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Planting Window */}
                {crop.plantingWindow && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Best planting: </span>
                    {crop.plantingWindow.optimal}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer with data source info */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Info className="h-3 w-3" />
            <span>Recommendations powered by AI analysis of your field conditions and market data</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CropRecommendation;

// Named exports for additional components
export { CropRecommendationSkeleton } from './CropRecommendation/CropRecommendationSkeleton';
export { CropRecommendationExample } from './CropRecommendation/CropRecommendationExample';

// Re-export types for convenience
export type { 
  FarmContext, 
  EnhancedCropRecommendation 
} from '@/hooks/useCropRecommendations';
