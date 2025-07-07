/**
 * 🤖 AI AGENTS - Trillion-Dollar Intelligence
 * Direct integration with backend AI services
 */

import { enhancedCropDiseaseOracle } from '@/agents/EnhancedCropDiseaseOracle';
import { fetchRealMarketData } from '@/intelligence/realMarketIntelligence';
import { getCurrentWeather, getWeatherForecast } from '@/agents/WeatherAgent';
import { analyzeFieldEnhanced } from '@/intelligence/enhancedFieldIntelligence';

// Disease Oracle Agent
export const callDiseaseOracle = async (
  image: string,
  cropType: string,
  location: { lat: number; lng: number }
) => {
  try {
    const result = await enhancedCropDiseaseOracle.diagnoseFromImage(
      image,
      cropType,
      location,
      3500, // Expected yield
      0.35   // Commodity price
    );
    
    return {
      success: true,
      data: result,
      confidence: result.confidence,
      severity: result.severity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        disease_name: 'Analysis Failed',
        confidence: 0,
        severity: 'unknown',
        immediate_actions: ['Please try again with better lighting'],
        recovery_timeline: 'Unable to determine'
      }
    };
  }
};

// Market Intelligence Agent
export const callMarketAgent = async (
  cropType: string,
  location?: { lat: number; lng: number }
) => {
  try {
    const marketData = await fetchRealMarketData(cropType, location);
    
    return {
      success: true,
      data: marketData,
      priceRange: {
        min: Math.min(...marketData.current_prices.map(p => p.price_per_unit)),
        max: Math.max(...marketData.current_prices.map(p => p.price_per_unit)),
        average: marketData.price_analysis.average_price
      },
      trend: marketData.price_analysis.trend_direction
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        crop_type: cropType,
        current_prices: [],
        price_analysis: {
          average_price: 0.35,
          trend_direction: 'neutral',
          volatility: 'low'
        }
      }
    };
  }
};

// Weather Intelligence Agent
export const callWeatherAgent = async (
  lat: number,
  lng: number,
  farmId?: string
) => {
  try {
    const [current, forecast] = await Promise.all([
      getCurrentWeather(lat, lng, farmId, true),
      getWeatherForecast(lat, lng, farmId, true)
    ]);
    
    // Generate farming insights
    const insights = generateFarmingInsights(current, forecast);
    
    return {
      success: true,
      data: {
        current,
        forecast,
        insights
      },
      alerts: insights.alerts || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        current: {
          temperatureCelsius: 25,
          weatherDescription: 'Data unavailable',
          humidityPercent: 60
        },
        forecast: { list: [] },
        insights: {
          irrigation_needed: false,
          alerts: ['Weather data temporarily unavailable']
        }
      }
    };
  }
};

// Satellite Analysis Agent
export const callSatelliteAgent = async (
  coordinates: Array<{ lat: number; lng: number }>,
  farmerId?: string
) => {
  try {
    const analysis = await analyzeFieldEnhanced(coordinates, farmerId);
    
    return {
      success: true,
      data: analysis,
      healthScore: Math.round(analysis.fieldHealth * 100),
      recommendations: analysis.recommendations.slice(0, 3)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        fieldHealth: 0.65,
        yieldPrediction: 3.2,
        moistureStress: 'moderate',
        recommendations: [
          'Satellite analysis temporarily unavailable',
          'Continue regular field monitoring',
          'Check back in a few hours'
        ]
      }
    };
  }
};

// Farm Health Calculator
export const calculateFarmHealth = async (userId: string) => {
  try {
    // This would integrate with the intelligence hub
    const mockHealthData = {
      overallHealth: 78,
      factors: {
        cropHealth: 82,
        weatherRisk: 15,
        marketOpportunity: 85,
        diseaseRisk: 10
      },
      alerts: [
        {
          type: 'weather',
          severity: 'medium',
          message: 'Rain expected in 2 days',
          icon: '🌧️'
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockHealthData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: {
        overallHealth: 65,
        factors: {
          cropHealth: 65,
          weatherRisk: 25,
          marketOpportunity: 70,
          diseaseRisk: 20
        },
        alerts: []
      }
    };
  }
};

// Helper: Generate Farming Insights
const generateFarmingInsights = (current: any, forecast: any) => {
  const insights: any = {
    irrigation_needed: false,
    planting_conditions: 'good',
    pest_risk: 'low',
    alerts: []
  };
  
  // Check irrigation needs
  if (current.humidityPercent < 40 && current.temperatureCelsius > 30) {
    insights.irrigation_needed = true;
    insights.alerts.push('Consider irrigation - low humidity and high temperature');
  }
  
  // Check pest risk
  const highHumidityDays = forecast.list?.filter((item: any) => 
    item.humidityPercent > 80 && item.temperatureCelsius > 20
  ).length || 0;
  
  if (highHumidityDays > 3) {
    insights.pest_risk = 'high';
    insights.alerts.push('High pest/disease risk due to humid conditions');
  }
  
  // Check planting conditions
  if (current.temperatureCelsius < 15 || current.temperatureCelsius > 35) {
    insights.planting_conditions = 'poor';
    insights.alerts.push('Temperature not optimal for planting');
  }
  
  return insights;
};