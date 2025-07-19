/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION SKELETON COMPONENT
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Loading Skeleton for Crop Recommendations
 * - Matches the exact layout of the final component
 * - Provides smooth loading experience
 * - Optimized for perceived performance
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CropRecommendationSkeletonProps {
  className?: string;
  count?: number;
}

export const CropRecommendationSkeleton: React.FC<CropRecommendationSkeletonProps> = ({
  className = '',
  count = 3,
}) => {
  return (
    <div className={`space-y-6 ${className}`} data-testid="crop-recommendation-skeleton">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* AI Reasoning Skeleton */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Skeleton className="h-4 w-4 rounded mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Growing Conditions Grid Skeleton */}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>

              {/* Market Data Skeleton */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>

              {/* Disease Risk Skeleton */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>

              {/* Expected Yield Skeleton */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Companion Plants Skeleton */}
              <div className="pt-3 border-t border-gray-100">
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-12 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Planting Window Skeleton */}
              <div className="flex items-center space-x-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  );
};

export default CropRecommendationSkeleton;