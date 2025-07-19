/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION USAGE EXAMPLE
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Example showing how to integrate the resurrected
 * CropRecommendation component with real farm data and user context
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CropRecommendation from '../CropRecommendation';
import type { FarmContext } from '@/hooks/useCropRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Field {
  id: string;
  name: string;
  farm_id: string;
  soil_type?: string;
  crop_type?: string;
  size?: number;
  location_description?: string;
}

interface Farm {
  id: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
    country?: string;
    region?: string;
  };
}

/**
 * Example component showing proper integration with CropRecommendation
 */
export const CropRecommendationExample: React.FC = () => {
  const { user } = useAuth();
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's farms and fields
  useEffect(() => {
    if (!user?.id) return;

    const fetchFarmsAndFields = async () => {
      try {
        // Fetch farms
        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id);

        if (farmsError) throw farmsError;

        // Fetch fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('fields')
          .select('*')
          .eq('user_id', user.id);

        if (fieldsError) throw fieldsError;

        setFarms(farmsData || []);
        setFields(fieldsData || []);

        // Auto-select first field if available
        if (fieldsData && fieldsData.length > 0) {
          setSelectedFieldId(fieldsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching farms and fields:', error);
        toast.error('Failed to load your farm data');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmsAndFields();
  }, [user?.id]);

  // Build farm context when field selection changes
  useEffect(() => {
    if (!selectedFieldId || !user?.id) {
      setFarmContext(null);
      return;
    }

    const selectedField = fields.find(f => f.id === selectedFieldId);
    if (!selectedField) return;

    const selectedFarm = farms.find(f => f.id === selectedField.farm_id);

    // Build comprehensive farm context
    const context: FarmContext = {
      location: selectedFarm?.location || {
        lat: -1.2921, // Default to Nairobi, Kenya
        lng: 36.8219,
        country: 'Kenya',
        region: 'Central Kenya'
      },
      soilType: selectedField.soil_type || 'unknown',
      currentSeason: getCurrentSeason(),
      userId: user.id,
      farmId: selectedField.farm_id,
      currentCrops: selectedField.crop_type ? [selectedField.crop_type] : [],
      climateZone: 'tropical'
    };

    setFarmContext(context);
  }, [selectedFieldId, fields, farms, user?.id]);

  // Handle crop selection
  const handleCropSelection = (cropId: string, confidence: number, aiReasoning: string) => {
    toast.success('Crop Selected!', {
      description: `Selected crop with ${confidence}% confidence. ${aiReasoning.slice(0, 100)}...`,
    });

    // Here you could navigate to a crop planning page, save the selection, etc.
    console.log('Crop selected:', { cropId, confidence, aiReasoning });
  };

  // Get current season based on date
  const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'long_rains';
    if (month >= 10 && month <= 12) return 'short_rains';
    return 'dry_season';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading your farm data...</p>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view crop recommendations</p>
        </div>
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fields Found</h3>
          <p className="text-gray-500 mb-4">
            You need to add fields to your farm before getting crop recommendations.
          </p>
          <Button>Add Your First Field</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Field Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Field for Crop Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Field
              </label>
              <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.size ? `${field.size} acres` : 'Size unknown'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFieldId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Field Details</h4>
                {(() => {
                  const field = fields.find(f => f.id === selectedFieldId);
                  if (!field) return null;
                  
                  return (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Name:</span> {field.name}</p>
                      <p><span className="font-medium">Soil Type:</span> {field.soil_type || 'Unknown'}</p>
                      <p><span className="font-medium">Current Crop:</span> {field.crop_type || 'None'}</p>
                      <p><span className="font-medium">Size:</span> {field.size ? `${field.size} acres` : 'Unknown'}</p>
                      {field.location_description && (
                        <p><span className="font-medium">Location:</span> {field.location_description}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crop Recommendations */}
      {selectedFieldId && farmContext && (
        <CropRecommendation
          fieldId={selectedFieldId}
          farmContext={farmContext}
          onSelectCrop={handleCropSelection}
          showMarketData={true}
          showDiseaseRisk={true}
          showEconomicViability={true}
          className="mt-6"
        />
      )}

      {/* Integration Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Integration Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p><strong>✅ Real Data Integration:</strong> This component now fetches real field data from Supabase and uses it for AI recommendations.</p>
          <p><strong>🧠 AI-Powered:</strong> Recommendations are generated using the CropDiseaseOracle and field AI services.</p>
          <p><strong>📊 Market Intelligence:</strong> Shows real-time market data, disease risk, and economic viability.</p>
          <p><strong>🔄 Real-time Updates:</strong> Data refreshes automatically and can be manually refreshed.</p>
          <p><strong>📱 Mobile Optimized:</strong> Fully responsive design with touch-friendly interactions.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropRecommendationExample;