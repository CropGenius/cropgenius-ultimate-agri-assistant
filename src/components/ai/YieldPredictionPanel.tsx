import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateYieldPrediction, YieldPredictionInput } from '@/agents/YieldPredictorAgent';
import { getCurrentWeather } from '@/agents/WeatherAgent';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

interface YieldPrediction {
  predictedYieldKgPerHa: number;
  confidenceScore: number;
  keyFactors: {
    weatherImpact: string;
    soilImpact: string;
    healthImpact: string;
    managementImpact: string;
  };
  recommendations: string[];
  harvestDateEstimate: string;
}

export const YieldPredictionPanel: React.FC<{ fieldId: string }> = ({ fieldId }) => {
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldData, setFieldData] = useState<any>(null);

  useEffect(() => {
    loadFieldData();
  }, [fieldId]);

  const loadFieldData = async () => {
    try {
      const { data } = await supabase
        .from('fields')
        .select(`
          *,
          farms!inner(location, user_id),
          crop_types(name)
        `)
        .eq('id', fieldId)
        .single();

      setFieldData(data);
    } catch (error) {
      console.error('Error loading field data:', error);
    }
  };

  const generatePrediction = async () => {
    if (!fieldData) return;

    setLoading(true);
    try {
      // Get weather data
      const [lat, lng] = fieldData.farms.location.split(',').map(Number);
      const weatherData = await getCurrentWeather(lat, lng);

      // Prepare prediction input
      const predictionInput: YieldPredictionInput = {
        fieldId: fieldData.id,
        cropType: fieldData.crop_types?.name || 'maize',
        plantingDate: new Date(fieldData.planted_at || Date.now()),
        weatherData: {
          current: weatherData,
          forecast: null
        },
        userId: fieldData.farms.user_id
      };

      const result = await generateYieldPrediction(predictionInput);
      setPrediction(result);
      toast.success('Yield prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate yield prediction');
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'slightly negative': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive': return '✅';
      case 'negative': return '❌';
      case 'slightly negative': return '⚠️';
      default: return '➡️';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Yield Prediction
          </CardTitle>
          <Button onClick={generatePrediction} disabled={loading || !fieldData}>
            {loading ? 'Analyzing...' : 'Generate Prediction'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="space-y-6">
            {/* Main Prediction */}
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                {prediction.predictedYieldKgPerHa.toLocaleString()} kg/ha
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Predicted Yield
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">Confidence:</span>
                  <Progress value={prediction.confidenceScore * 100} className="w-24" />
                  <span className="text-sm font-medium">
                    {Math.round(prediction.confidenceScore * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(prediction.keyFactors).map(([factor, impact]) => (
                <div key={factor} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {factor.replace('Impact', '')}
                    </span>
                    <div className={`flex items-center gap-1 ${getImpactColor(impact)}`}>
                      <span>{getImpactIcon(impact)}</span>
                      <span className="text-xs">{impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Harvest Date */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">🗓️ Estimated Harvest:</span>
                <Badge variant="secondary">
                  {new Date(prediction.harvestDateEstimate).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-medium">📋 Recommendations</h4>
              <div className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🔮</div>
            <p>Generate AI-powered yield predictions</p>
            <p className="text-xs mt-1">
              Based on weather, soil, and crop health data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};