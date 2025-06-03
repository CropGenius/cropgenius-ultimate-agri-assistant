import { useState, useEffect } from 'react';
import { Sprout, Droplets, Sun, Thermometer, Calendar } from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  description: string;
  waterNeeds: 'Low' | 'Medium' | 'High';
  sunExposure: 'Full Sun' | 'Partial Shade' | 'Full Shade';
  temperature: string;
  growingSeason: string[];
  imageUrl?: string;
  compatibility?: string[];
}

interface CropRecommendationProps {
  crops: Crop[];
  onSelectCrop?: (cropId: string) => void;
  className?: string;
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

const CropRecommendation: React.FC<CropRecommendationProps> = ({
  crops = [],
  onSelectCrop,
  className = '',
}) => {
  if (crops.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-8">
          <Sprout className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No crop recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your field details to get personalized crop recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="crop-recommendation">
      <h2 className="text-lg font-medium text-gray-900">Recommended Crops</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            data-testid={`crop-card-${crop.id}`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{crop.name}</h3>
                <button
                  onClick={() => onSelectCrop?.(crop.id)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium focus:outline-none"
                  data-testid={`select-crop-${crop.id}`}
                >
                  Select
                </button>
              </div>
              
              <p className="mt-1 text-sm text-gray-500">{crop.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{waterNeedIcons[crop.waterNeeds]}</span>
                  <span>Water: {crop.waterNeeds}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{sunExposureIcons[crop.sunExposure]}</span>
                  <span>{crop.sunExposure}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Thermometer className="h-4 w-4 mr-2 text-red-400" />
                  <span>Temperature: {crop.temperature}</span>
                </div>
                <div className="flex items-start text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>Season: {crop.growingSeason.join(', ')}</span>
                </div>
              </div>
              
              {crop.compatibility && crop.compatibility.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Companion Plants:</p>
                  <div className="flex flex-wrap gap-1">
                    {crop.compatibility.map((plant) => (
                      <span 
                        key={plant} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {plant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropRecommendation;
