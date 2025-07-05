/**
 * REAL WEATHER INTELLIGENCE ENGINE
 * Connects to actual weather APIs with agricultural analysis
 */

interface WeatherForecast {
  date: string;
  temperature: { min: number; max: number };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

interface FarmingInsights {
  plantingRecommendations: PlantingRecommendation[];
  irrigationSchedule: IrrigationSchedule;
  pestRisk: PestRisk;
  harvestTiming: HarvestTiming;
  fieldWorkWindows: FieldWorkWindow[];
}

interface PlantingRecommendation {
  crop: string;
  optimalDate: string;
  soilCondition: string;
  confidence: number;
  reasoning: string;
}

interface IrrigationSchedule {
  nextIrrigation: string;
  amount: number;
  frequency: string;
  method: string;
}

interface PestRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  pests: string[];
  preventiveMeasures: string[];
}

interface HarvestTiming {
  crop: string;
  optimalWindow: { start: string; end: string };
  weatherRisk: string;
  qualityForecast: string;
}

interface FieldWorkWindow {
  activity: string;
  window: { start: string; end: string };
  conditions: string;
  priority: number;
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherIntelligenceEngine {

  async getFarmingForecast(location: { lat: number; lng: number }): Promise<{
    forecast: WeatherForecast[];
    farmingInsights: FarmingInsights;
    alerts: string[];
  }> {
    
    // REAL OpenWeatherMap API calls
    const [currentWeather, forecast, oneCall] = await Promise.all([
      this.getCurrentWeather(location),
      this.get5DayForecast(location),
      this.getOneCallData(location)
    ]);

    // Process weather data for agricultural insights
    const processedForecast = this.processWeatherData(forecast);
    const farmingInsights = this.generateFarmingInsights(processedForecast, currentWeather);
    const alerts = this.generateFarmingAlerts(processedForecast, currentWeather);

    return {
      forecast: processedForecast,
      farmingInsights,
      alerts
    };
  }

  private async getCurrentWeather(location: { lat: number; lng: number }) {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
  }

  private async get5DayForecast(location: { lat: number; lng: number }) {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }
    
    return await response.json();
  }

  private async getOneCallData(location: { lat: number; lng: number }) {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/onecall?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely`
    );
    
    if (!response.ok) {
      throw new Error(`OneCall API error: ${response.status}`);
    }
    
    return await response.json();
  }

  private processWeatherData(forecastData: any): WeatherForecast[] {
    return forecastData.list.slice(0, 5).map((item: any) => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      temperature: {
        min: Math.round(item.main.temp_min),
        max: Math.round(item.main.temp_max)
      },
      humidity: item.main.humidity,
      rainfall: item.rain?.['3h'] || 0,
      windSpeed: item.wind.speed,
      condition: item.weather[0].main
    }));
  }

  private generateFarmingInsights(forecast: WeatherForecast[], currentWeather: any): FarmingInsights {
    return {
      plantingRecommendations: this.analyzePlantingConditions(forecast, currentWeather),
      irrigationSchedule: this.calculateIrrigationNeeds(forecast, currentWeather),
      pestRisk: this.assessPestRisk(forecast, currentWeather),
      harvestTiming: this.optimizeHarvestTiming(forecast),
      fieldWorkWindows: this.identifyFieldWorkOpportunities(forecast)
    };
  }

  private analyzePlantingConditions(forecast: WeatherForecast[], currentWeather: any): PlantingRecommendation[] {
    const recommendations: PlantingRecommendation[] = [];
    
    // Analyze soil temperature and moisture conditions
    const avgTemp = forecast.reduce((sum, day) => sum + (day.temperature.min + day.temperature.max) / 2, 0) / forecast.length;
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;

    // Maize planting analysis
    if (avgTemp >= 18 && avgTemp <= 30 && totalRainfall >= 10) {
      recommendations.push({
        crop: 'Maize',
        optimalDate: this.getOptimalPlantingDate(forecast, 'maize'),
        soilCondition: totalRainfall > 20 ? 'Well-moistened' : 'Adequate moisture',
        confidence: this.calculatePlantingConfidence(avgTemp, totalRainfall, 'maize'),
        reasoning: `Temperature range ${Math.round(avgTemp)}°C ideal for maize germination. Expected rainfall ${Math.round(totalRainfall)}mm provides good soil moisture.`
      });
    }

    // Bean planting analysis
    if (avgTemp >= 15 && avgTemp <= 25 && totalRainfall >= 15) {
      recommendations.push({
        crop: 'Beans',
        optimalDate: this.getOptimalPlantingDate(forecast, 'beans'),
        soilCondition: 'Good for planting',
        confidence: this.calculatePlantingConfidence(avgTemp, totalRainfall, 'beans'),
        reasoning: `Cool temperatures and adequate rainfall create ideal bean planting conditions.`
      });
    }

    return recommendations;
  }

  private calculateIrrigationNeeds(forecast: WeatherForecast[], currentWeather: any): IrrigationSchedule {
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;
    const avgTemp = forecast.reduce((sum, day) => sum + (day.temperature.min + day.temperature.max) / 2, 0) / forecast.length;

    // Calculate evapotranspiration rate
    const et0 = this.calculateEvapotranspiration(avgTemp, avgHumidity, forecast[0].windSpeed);
    const irrigationNeed = Math.max(0, et0 - totalRainfall);

    let nextIrrigation = 'Not needed';
    let amount = 0;
    let frequency = 'Monitor conditions';

    if (irrigationNeed > 10) {
      nextIrrigation = this.getNextIrrigationDate(forecast);
      amount = Math.round(irrigationNeed * 1.2); // Add 20% buffer
      frequency = totalRainfall < 5 ? 'Every 2-3 days' : 'Every 5-7 days';
    }

    return {
      nextIrrigation,
      amount,
      frequency,
      method: amount > 25 ? 'Drip irrigation recommended' : 'Sprinkler irrigation suitable'
    };
  }

  private assessPestRisk(forecast: WeatherForecast[], currentWeather: any): PestRisk {
    const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;
    const avgTemp = forecast.reduce((sum, day) => sum + (day.temperature.min + day.temperature.max) / 2, 0) / forecast.length;
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const pests: string[] = [];
    const preventiveMeasures: string[] = [];

    // High humidity + warm temperature = fungal disease risk
    if (avgHumidity > 80 && avgTemp > 25) {
      riskLevel = 'high';
      pests.push('Fungal diseases', 'Leaf blight', 'Rust');
      preventiveMeasures.push('Apply preventive fungicide', 'Improve field drainage', 'Increase plant spacing');
    }

    // Warm, dry conditions = insect pest risk
    if (avgHumidity < 60 && avgTemp > 28) {
      riskLevel = riskLevel === 'high' ? 'critical' : 'medium';
      pests.push('Aphids', 'Thrips', 'Spider mites');
      preventiveMeasures.push('Monitor for early signs', 'Use sticky traps', 'Apply neem oil');
    }

    // Wet conditions = bacterial disease risk
    if (totalRainfall > 50) {
      riskLevel = 'medium';
      pests.push('Bacterial wilt', 'Soft rot');
      preventiveMeasures.push('Avoid overhead irrigation', 'Remove infected plants', 'Apply copper-based bactericide');
    }

    return { level: riskLevel, pests, preventiveMeasures };
  }

  private optimizeHarvestTiming(forecast: WeatherForecast[]): HarvestTiming {
    // Analyze weather patterns for optimal harvest timing
    const dryDays = forecast.filter(day => day.rainfall < 2).length;
    const wetDays = forecast.length - dryDays;

    let optimalWindow = { start: '', end: '' };
    let weatherRisk = 'Low';
    let qualityForecast = 'Good';

    if (dryDays >= 3) {
      const dryPeriod = this.findLongestDryPeriod(forecast);
      optimalWindow = {
        start: dryPeriod.start,
        end: dryPeriod.end
      };
      weatherRisk = 'Low';
      qualityForecast = 'Excellent - dry conditions preserve quality';
    } else if (wetDays > 3) {
      weatherRisk = 'High';
      qualityForecast = 'Risk of quality degradation due to moisture';
      optimalWindow = {
        start: 'Wait for dry period',
        end: 'Monitor weather updates'
      };
    }

    return {
      crop: 'General',
      optimalWindow,
      weatherRisk,
      qualityForecast
    };
  }

  private identifyFieldWorkOpportunities(forecast: WeatherForecast[]): FieldWorkWindow[] {
    const opportunities: FieldWorkWindow[] = [];

    forecast.forEach((day, index) => {
      // Spraying opportunities (low wind, no rain)
      if (day.windSpeed < 3 && day.rainfall < 1) {
        opportunities.push({
          activity: 'Pesticide/Fertilizer Application',
          window: { start: day.date, end: day.date },
          conditions: `Low wind (${day.windSpeed}m/s), no rain expected`,
          priority: 8
        });
      }

      // Planting opportunities (adequate moisture, good temperature)
      if (day.rainfall > 5 && day.temperature.max < 30) {
        opportunities.push({
          activity: 'Planting/Seeding',
          window: { start: day.date, end: day.date },
          conditions: `Good soil moisture, optimal temperature`,
          priority: 9
        });
      }

      // Harvesting opportunities (dry conditions)
      if (day.rainfall < 1 && day.humidity < 70) {
        opportunities.push({
          activity: 'Harvesting',
          window: { start: day.date, end: day.date },
          conditions: `Dry conditions, low humidity`,
          priority: 7
        });
      }
    });

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  private generateFarmingAlerts(forecast: WeatherForecast[], currentWeather: any): string[] {
    const alerts: string[] = [];

    // Temperature alerts
    const maxTemp = Math.max(...forecast.map(day => day.temperature.max));
    const minTemp = Math.min(...forecast.map(day => day.temperature.min));

    if (maxTemp > 35) {
      alerts.push(`🌡️ HEAT ALERT: Temperatures reaching ${maxTemp}°C. Increase irrigation and provide shade for sensitive crops.`);
    }

    if (minTemp < 10) {
      alerts.push(`❄️ COLD ALERT: Temperatures dropping to ${minTemp}°C. Protect sensitive crops from frost damage.`);
    }

    // Rainfall alerts
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    const heavyRainDays = forecast.filter(day => day.rainfall > 20).length;

    if (totalRainfall > 100) {
      alerts.push(`🌧️ HEAVY RAIN ALERT: ${Math.round(totalRainfall)}mm expected over 5 days. Ensure proper drainage and delay field operations.`);
    }

    if (heavyRainDays > 0) {
      alerts.push(`⛈️ STORM ALERT: Heavy rainfall (>20mm) expected on ${heavyRainDays} day(s). Secure equipment and protect crops.`);
    }

    // Drought alerts
    if (totalRainfall < 5) {
      alerts.push(`🏜️ DROUGHT ALERT: Very low rainfall expected (${Math.round(totalRainfall)}mm). Implement water conservation measures.`);
    }

    // Wind alerts
    const maxWind = Math.max(...forecast.map(day => day.windSpeed));
    if (maxWind > 8) {
      alerts.push(`💨 WIND ALERT: Strong winds up to ${Math.round(maxWind)}m/s expected. Avoid spraying operations and secure structures.`);
    }

    return alerts;
  }

  // Helper methods
  private calculateEvapotranspiration(temp: number, humidity: number, windSpeed: number): number {
    // Simplified Penman-Monteith equation for daily ET0
    const delta = 4098 * (0.6108 * Math.exp(17.27 * temp / (temp + 237.3))) / Math.pow(temp + 237.3, 2);
    const gamma = 0.665; // Psychrometric constant
    const u2 = windSpeed * 4.87 / Math.log(67.8 * 10 - 5.42); // Wind speed at 2m height
    
    return Math.round((delta * temp + gamma * 900 / (temp + 273) * u2 * (0.01 * (100 - humidity))) / (delta + gamma * (1 + 0.34 * u2)));
  }

  private getOptimalPlantingDate(forecast: WeatherForecast[], crop: string): string {
    // Find the best planting date based on weather conditions
    for (let i = 0; i < forecast.length; i++) {
      const day = forecast[i];
      if (crop === 'maize' && day.temperature.min >= 15 && day.rainfall >= 5) {
        return day.date;
      }
      if (crop === 'beans' && day.temperature.max <= 25 && day.rainfall >= 10) {
        return day.date;
      }
    }
    return forecast[0].date;
  }

  private calculatePlantingConfidence(temp: number, rainfall: number, crop: string): number {
    let confidence = 50;
    
    if (crop === 'maize') {
      if (temp >= 20 && temp <= 25) confidence += 20;
      if (rainfall >= 15 && rainfall <= 30) confidence += 20;
      if (temp >= 18 && temp <= 30) confidence += 10;
    }
    
    return Math.min(95, confidence);
  }

  private getNextIrrigationDate(forecast: WeatherForecast[]): string {
    // Find the next day with low rainfall for irrigation
    for (const day of forecast) {
      if (day.rainfall < 2) {
        return day.date;
      }
    }
    return forecast[0].date;
  }

  private findLongestDryPeriod(forecast: WeatherForecast[]): { start: string; end: string } {
    let longestStart = forecast[0].date;
    let longestEnd = forecast[0].date;
    let currentStart = forecast[0].date;
    let maxLength = 0;
    let currentLength = 0;

    for (const day of forecast) {
      if (day.rainfall < 2) {
        if (currentLength === 0) currentStart = day.date;
        currentLength++;
      } else {
        if (currentLength > maxLength) {
          maxLength = currentLength;
          longestStart = currentStart;
          longestEnd = forecast[forecast.indexOf(day) - 1]?.date || day.date;
        }
        currentLength = 0;
      }
    }

    return { start: longestStart, end: longestEnd };
  }
}