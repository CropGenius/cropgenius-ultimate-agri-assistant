/**
 * 🛰️ SATELLITE ALERT SERVICE - PRECISION AGRICULTURE ALERTS
 * Real-time water stress, nutrient deficiency, and harvest optimization alerts
 */

import { supabase } from '@/integrations/supabase/client';
import { analyzeFieldEnhanced } from '@/intelligence/enhancedFieldIntelligence';

export interface PrecisionAlert {
  id: string;
  field_id: string;
  alert_type: 'water_stress' | 'nutrient_deficiency' | 'harvest_timing' | 'variable_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  coordinates?: { lat: number; lng: number }[];
  action_required: boolean;
  created_at: string;
  resolved: boolean;
}

export interface VariableRateZone {
  coordinates: { lat: number; lng: number }[];
  ndvi_value: number;
  recommendation_type: 'fertilizer' | 'irrigation' | 'seeding';
  application_rate: number;
  savings_potential: number;
}

/**
 * WATER STRESS DETECTION - Critical irrigation alerts
 */
export async function checkWaterStress(fieldId: string, coordinates: { lat: number; lng: number }[]): Promise<PrecisionAlert[]> {
  try {
    const analysis = await analyzeFieldEnhanced(coordinates, fieldId);
    const alerts: PrecisionAlert[] = [];

    // Critical water stress (NDMI < 0.2)
    if (analysis.moistureStress === 'critical') {
      alerts.push({
        id: `water-critical-${fieldId}-${Date.now()}`,
        field_id: fieldId,
        alert_type: 'water_stress',
        severity: 'critical',
        message: '🚨 CRITICAL WATER STRESS: Immediate irrigation required within 24 hours. Crop failure risk high.',
        coordinates,
        action_required: true,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }
    
    // High water stress (NDMI < 0.4)
    else if (analysis.moistureStress === 'high') {
      alerts.push({
        id: `water-high-${fieldId}-${Date.now()}`,
        field_id: fieldId,
        alert_type: 'water_stress',
        severity: 'high',
        message: '⚠️ HIGH WATER STRESS: Increase irrigation frequency by 30%. Monitor soil moisture daily.',
        coordinates,
        action_required: true,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  } catch (error) {
    console.error('Water stress detection failed:', error);
    return [];
  }
}

/**
 * NUTRIENT DEFICIENCY DETECTION - NDVI-based fertilizer alerts
 */
export async function checkNutrientDeficiency(fieldId: string, coordinates: { lat: number; lng: number }[]): Promise<PrecisionAlert[]> {
  try {
    const analysis = await analyzeFieldEnhanced(coordinates, fieldId);
    const alerts: PrecisionAlert[] = [];

    // Low NDVI indicates potential nutrient deficiency
    if (analysis.vegetationIndices.ndvi < 0.4 && analysis.fieldHealth < 0.5) {
      alerts.push({
        id: `nutrient-${fieldId}-${Date.now()}`,
        field_id: fieldId,
        alert_type: 'nutrient_deficiency',
        severity: 'high',
        message: `🌱 NUTRIENT DEFICIENCY DETECTED: NDVI ${analysis.vegetationIndices.ndvi.toFixed(2)} indicates low vegetation health. Soil testing and fertilizer application recommended.`,
        coordinates,
        action_required: true,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  } catch (error) {
    console.error('Nutrient deficiency detection failed:', error);
    return [];
  }
}

/**
 * HARVEST TIMING OPTIMIZATION - NDVI trend analysis
 */
export async function checkHarvestTiming(fieldId: string, coordinates: { lat: number; lng: number }[], cropType: string): Promise<PrecisionAlert[]> {
  try {
    const analysis = await analyzeFieldEnhanced(coordinates, fieldId);
    const alerts: PrecisionAlert[] = [];

    // Optimal harvest timing based on NDVI and crop type
    const harvestThresholds = {
      'maize': { optimal: 0.3, late: 0.2 },
      'beans': { optimal: 0.25, late: 0.15 },
      'tomato': { optimal: 0.4, late: 0.3 },
      'cassava': { optimal: 0.2, late: 0.1 }
    };

    const threshold = harvestThresholds[cropType.toLowerCase() as keyof typeof harvestThresholds] || harvestThresholds.maize;

    if (analysis.vegetationIndices.ndvi <= threshold.optimal && analysis.vegetationIndices.ndvi > threshold.late) {
      alerts.push({
        id: `harvest-optimal-${fieldId}-${Date.now()}`,
        field_id: fieldId,
        alert_type: 'harvest_timing',
        severity: 'medium',
        message: `🌾 OPTIMAL HARVEST WINDOW: NDVI ${analysis.vegetationIndices.ndvi.toFixed(2)} indicates crop maturity. Harvest within 1-2 weeks for maximum yield.`,
        coordinates,
        action_required: true,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }
    else if (analysis.vegetationIndices.ndvi <= threshold.late) {
      alerts.push({
        id: `harvest-late-${fieldId}-${Date.now()}`,
        field_id: fieldId,
        alert_type: 'harvest_timing',
        severity: 'high',
        message: `⏰ LATE HARVEST ALERT: NDVI ${analysis.vegetationIndices.ndvi.toFixed(2)} indicates over-maturity. Harvest immediately to prevent yield loss.`,
        coordinates,
        action_required: true,
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  } catch (error) {
    console.error('Harvest timing check failed:', error);
    return [];
  }
}

/**
 * VARIABLE RATE MAPPING - Generate precision agriculture zones
 */
export async function generateVariableRateZones(fieldId: string, coordinates: { lat: number; lng: number }[]): Promise<VariableRateZone[]> {
  try {
    const analysis = await analyzeFieldEnhanced(coordinates, fieldId);
    const zones: VariableRateZone[] = [];

    // Generate zones based on problem areas
    for (const problemArea of analysis.problemAreas) {
      const zoneCoords = generateZoneCoordinates(problemArea.lat, problemArea.lng, 0.001); // ~100m radius
      
      // Fertilizer application zone
      if (problemArea.ndvi < 0.4) {
        zones.push({
          coordinates: zoneCoords,
          ndvi_value: problemArea.ndvi,
          recommendation_type: 'fertilizer',
          application_rate: 1.5, // 150% of standard rate
          savings_potential: 0.25 // 25% savings through precision application
        });
      }
      
      // Irrigation zone
      if (analysis.moistureStress === 'high' || analysis.moistureStress === 'critical') {
        zones.push({
          coordinates: zoneCoords,
          ndvi_value: problemArea.ndvi,
          recommendation_type: 'irrigation',
          application_rate: 1.3, // 130% of standard rate
          savings_potential: 0.30 // 30% water savings
        });
      }
    }

    return zones;
  } catch (error) {
    console.error('Variable rate zone generation failed:', error);
    return [];
  }
}

/**
 * COMPREHENSIVE FIELD MONITORING - Check all precision agriculture alerts
 */
export async function monitorFieldPrecisionAgriculture(fieldId: string, coordinates: { lat: number; lng: number }[], cropType: string): Promise<{
  alerts: PrecisionAlert[];
  variableRateZones: VariableRateZone[];
  recommendations: string[];
}> {
  try {
    // Run all precision agriculture checks
    const [waterAlerts, nutrientAlerts, harvestAlerts, variableRateZones] = await Promise.all([
      checkWaterStress(fieldId, coordinates),
      checkNutrientDeficiency(fieldId, coordinates),
      checkHarvestTiming(fieldId, coordinates, cropType),
      generateVariableRateZones(fieldId, coordinates)
    ]);

    const allAlerts = [...waterAlerts, ...nutrientAlerts, ...harvestAlerts];

    // Generate precision agriculture recommendations
    const recommendations = [];
    
    if (variableRateZones.length > 0) {
      const fertilizerZones = variableRateZones.filter(z => z.recommendation_type === 'fertilizer');
      const irrigationZones = variableRateZones.filter(z => z.recommendation_type === 'irrigation');
      
      if (fertilizerZones.length > 0) {
        const avgSavings = fertilizerZones.reduce((sum, z) => sum + z.savings_potential, 0) / fertilizerZones.length;
        recommendations.push(`🎯 VARIABLE RATE FERTILIZER: ${fertilizerZones.length} zones identified. Potential savings: ${(avgSavings * 100).toFixed(0)}%`);
      }
      
      if (irrigationZones.length > 0) {
        const avgSavings = irrigationZones.reduce((sum, z) => sum + z.savings_potential, 0) / irrigationZones.length;
        recommendations.push(`💧 PRECISION IRRIGATION: ${irrigationZones.length} zones identified. Water savings: ${(avgSavings * 100).toFixed(0)}%`);
      }
    }

    // Store alerts in database
    for (const alert of allAlerts) {
      await supabase.from('field_alerts').insert({
        field_id: alert.field_id,
        alert_type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        coordinates: alert.coordinates,
        action_required: alert.action_required,
        created_at: alert.created_at,
        resolved: alert.resolved
      });
    }

    return {
      alerts: allAlerts,
      variableRateZones,
      recommendations
    };

  } catch (error) {
    console.error('Precision agriculture monitoring failed:', error);
    return {
      alerts: [],
      variableRateZones: [],
      recommendations: ['Precision agriculture monitoring temporarily unavailable']
    };
  }
}

/**
 * Helper function to generate zone coordinates
 */
function generateZoneCoordinates(centerLat: number, centerLng: number, radius: number): { lat: number; lng: number }[] {
  const points = [];
  const numPoints = 8;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);
    points.push({ lat, lng });
  }
  
  // Close the polygon
  points.push(points[0]);
  
  return points;
}

/**
 * REAL-TIME ALERT DISPATCHER - Send alerts via multiple channels
 */
export async function dispatchPrecisionAlerts(alerts: PrecisionAlert[], userId: string): Promise<void> {
  try {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const highAlerts = alerts.filter(alert => alert.severity === 'high');

    // Critical alerts - immediate notification
    if (criticalAlerts.length > 0) {
      for (const alert of criticalAlerts) {
        // WhatsApp notification (if configured)
        try {
          await supabase.functions.invoke('send-satellite-whatsapp-alert', {
            body: {
              user_id: userId,
              field_id: alert.field_id,
              alert_type: alert.alert_type,
              severity: alert.severity,
              message: alert.message,
              coordinates: alert.coordinates
            }
          });
        } catch (error) {
          console.warn('WhatsApp alert failed:', error);
        }

        // SMS notification (if configured)
        try {
          await supabase.functions.invoke('send-sms-alert', {
            body: {
              user_id: userId,
              message: alert.message,
              alert_type: alert.alert_type
            }
          });
        } catch (error) {
          console.warn('SMS alert failed:', error);
        }
      }
    }

    // High priority alerts - app notification
    if (highAlerts.length > 0) {
      await supabase.from('user_notifications').insert(
        highAlerts.map(alert => ({
          user_id: userId,
          title: `Field Alert: ${alert.alert_type.replace('_', ' ')}`,
          message: alert.message,
          type: 'precision_agriculture',
          priority: alert.severity,
          created_at: new Date().toISOString(),
          read: false
        }))
      );
    }

  } catch (error) {
    console.error('Alert dispatch failed:', error);
  }
}