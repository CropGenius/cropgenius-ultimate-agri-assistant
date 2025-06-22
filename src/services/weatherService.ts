import { WeatherData, WeatherForecast } from '@/types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export interface WeatherParams {
  lat: number;
  lon: number;
  exclude?: string;
  units?: 'standard' | 'metric' | 'imperial';
  lang?: string;
}

export const fetchWeatherData = async (params: WeatherParams): Promise<WeatherData> => {
  try {
    const { lat, lon, exclude, units = 'metric', lang = 'en' } = params;
    
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: API_KEY,
      units,
      lang,
      ...(exclude && { exclude }),
    });

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      temperature: data.current.temp,
      humidity: data.current.humidity,
      rainfall: data.current.rain?.['1h'] || 0,
      windSpeed: data.current.wind_speed,
      forecast: data.daily.slice(0, 5).map((day: any): WeatherForecast => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: { 
          min: day.temp.min, 
          max: day.temp.max 
        },
        humidity: day.humidity,
        rainfall: day.rain || 0,
        conditions: day.weather[0].description,
      })),
      farmingInsights: generateFarmingInsights(data),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

const generateFarmingInsights = (data: any) => {
  const insights: any = {
    plantingRecommendations: [],
    irrigationSchedule: [],
    pestRisk: {
      level: 'low',
      pests: [],
      preventionMeasures: [],
    },
    harvestTiming: '',
    fieldWorkWindows: [],
  };

  if (data.daily[0].temp.max > 30) {
    insights.plantingRecommendations.push('Consider planting drought-resistant crops');
  } else if (data.daily[0].temp.min < 10) {
    insights.plantingRecommendations.push('Consider using cold frames for temperature-sensitive crops');
  }

  if (data.daily[0].rain < 5) {
    insights.irrigationSchedule.push({
      date: new Date().toISOString().split('T')[0],
      amount: 10,
      duration: 30,
      fieldId: 'default',
    });
  }

  return insights;
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
