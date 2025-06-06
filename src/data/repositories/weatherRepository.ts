// src/data/repositories/weatherRepository.ts
/**
 * Repository for weather data operations
 */

import { db } from '@/data/supabaseClient';
import { useApp } from '@/context/AppContext';

// Weather data entity type
export interface WeatherData {
  id: string;
  farm_id: string;
  field_id?: string;
  timestamp: string;
  temperature: number;
  feels_like?: number;
  humidity: number;
  pressure?: number;
  wind_speed: number;
  wind_direction?: number;
  precipitation?: number;
  precipitation_probability?: number;
  condition: string;
  condition_icon?: string;
  uv_index?: number;
  source: string;
  location_lat: number;
  location_lng: number;
  is_forecast: boolean;
  forecast_timestamp?: string;
  created_at?: string;
  updated_at?: string;
}

// Weather forecast type for forecast collections
export interface WeatherForecast {
  farm_id: string;
  field_id?: string;
  current: WeatherData;
  hourly: WeatherData[];
  daily: {
    date: string;
    min_temp: number;
    max_temp: number;
    avg_temp: number;
    humidity: number;
    wind_speed: number;
    precipitation_probability: number;
    condition: string;
    condition_icon: string;
  }[];
  timestamp: string;
  source: string;
}

// Weather alert type
export interface WeatherAlert {
  id: string;
  farm_id: string;
  alert_type: 'heat' | 'cold' | 'rain' | 'storm' | 'drought' | 'wind' | 'other';
  severity: 'warning' | 'watch' | 'advisory' | 'emergency';
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  source: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// WeatherRepository singleton
export const WeatherRepository = {
  /**
   * Get current weather for a farm
   */
  async getCurrentWeather(
    farmId: string,
    options: { fieldId?: string } = {}
  ): Promise<{ data: WeatherData | null; error: Error | null }> {
    const filters: Record<string, any> = {
      farm_id: farmId,
      is_forecast: false,
    };

    if (options.fieldId) {
      filters.field_id = options.fieldId;
    }

    const { data, error } = await db.raw
      .from('weather_data')
      .select('*')
      .match(filters)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return {
        data: null,
        error: new Error(`Error fetching current weather: ${error.message}`),
      };
    }

    return { data, error: null };
  },

  /**
   * Get weather forecast for a farm
   */
  async getWeatherForecast(
    farmId: string,
    options: {
      fieldId?: string;
      days?: number;
      hourly?: boolean;
    } = { days: 5, hourly: false }
  ): Promise<{ data: WeatherData[] | null; error: Error | null }> {
    const filters: Record<string, any> = {
      farm_id: farmId,
      is_forecast: true,
    };

    if (options.fieldId) {
      filters.field_id = options.fieldId;
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + (options.days || 5));

    const { data, error } = await db.raw
      .from('weather_data')
      .select('*')
      .match(filters)
      .gte('forecast_timestamp', now.toISOString())
      .lt('forecast_timestamp', endDate.toISOString())
      .order('forecast_timestamp', { ascending: true });

    if (error) {
      return {
        data: null,
        error: new Error(`Error fetching weather forecast: ${error.message}`),
      };
    }

    // If hourly data is not requested, filter to get only daily data
    // This is a basic implementation - ideally the database would have a view or function for this
    if (!options.hourly && data && data.length > 0) {
      const dailyData: Record<string, WeatherData> = {};

      // Group by date and keep the midday forecast for each day
      data.forEach((item: WeatherData) => {
        if (!item.forecast_timestamp) return;

        const date = item.forecast_timestamp.split('T')[0];
        const hour = new Date(item.forecast_timestamp).getHours();

        // For simplicity, prefer readings around noon for daily summary
        if (
          !dailyData[date] ||
          Math.abs(hour - 12) <
            Math.abs(
              new Date(dailyData[date].forecast_timestamp!).getHours() - 12
            )
        ) {
          dailyData[date] = item;
        }
      });

      return { data: Object.values(dailyData), error: null };
    }

    return { data, error: null };
  },

  /**
   * Save weather data
   */
  async saveWeatherData(
    weatherData: Omit<WeatherData, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: WeatherData | null; error: Error | null }> {
    const result = await db.insert<WeatherData>('weather_data', weatherData, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Save multiple weather data points (e.g., for forecast)
   */
  async saveWeatherDataBatch(
    weatherDataBatch: Omit<WeatherData, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<{ data: WeatherData[] | null; error: Error | null }> {
    return db.insert<WeatherData>('weather_data', weatherDataBatch, {
      returnData: true,
    });
  },

  /**
   * Get active weather alerts for a farm
   */
  async getActiveAlerts(
    farmId: string
  ): Promise<{ data: WeatherAlert[] | null; error: Error | null }> {
    return db.find<WeatherAlert>({
      table: 'weather_alerts',
      filters: {
        farm_id: farmId,
        active: true,
      },
      order: { column: 'severity', ascending: false },
    });
  },

  /**
   * Create a weather alert
   */
  async createAlert(
    alert: Omit<WeatherAlert, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: WeatherAlert | null; error: Error | null }> {
    const result = await db.insert<WeatherAlert>('weather_alerts', alert, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Get historical weather for a date range
   */
  async getHistoricalWeather(
    farmId: string,
    options: {
      fieldId?: string;
      startDate: string;
      endDate: string;
      aggregation?: 'hourly' | 'daily' | 'weekly';
    }
  ): Promise<{ data: WeatherData[] | null; error: Error | null }> {
    const filters: Record<string, any> = {
      farm_id: farmId,
      is_forecast: false,
    };

    if (options.fieldId) {
      filters.field_id = options.fieldId;
    }

    // For simple queries without aggregation
    if (!options.aggregation || options.aggregation === 'hourly') {
      const { data, error } = await db.raw
        .from('weather_data')
        .select('*')
        .match(filters)
        .gte('timestamp', options.startDate)
        .lte('timestamp', options.endDate)
        .order('timestamp', { ascending: true });

      if (error) {
        return {
          data: null,
          error: new Error(
            `Error fetching historical weather: ${error.message}`
          ),
        };
      }

      return { data, error: null };
    }

    // For aggregated queries, we'd typically use database functions
    // This is a placeholder - would need actual SQL implementation
    try {
      const { data, error } = await db.rpc<WeatherData[]>(
        'get_aggregated_weather',
        {
          p_farm_id: farmId,
          p_field_id: options.fieldId,
          p_start_date: options.startDate,
          p_end_date: options.endDate,
          p_aggregation: options.aggregation,
        }
      );

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      // Fallback for when RPC isn't available
      console.warn('Weather aggregation RPC not implemented yet');
      return {
        data: null,
        error: new Error('Weather data aggregation not implemented yet'),
      };
    }
  },
};

/**
 * Hook for weather operations that automatically includes the current farm and field context
 */
export const useWeatherRepository = () => {
  const { state } = useApp();
  const { currentFarmId, selectedFieldId } = state;

  return {
    ...WeatherRepository,

    /**
     * Get current weather for the current farm
     */
    getCurrentFarmWeather: async (): Promise<{
      data: WeatherData | null;
      error: Error | null;
    }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return WeatherRepository.getCurrentWeather(currentFarmId, {
        fieldId: selectedFieldId,
      });
    },

    /**
     * Get weather forecast for the current farm
     */
    getCurrentFarmForecast: async (
      options?: Omit<
        Parameters<typeof WeatherRepository.getWeatherForecast>[1],
        'fieldId'
      >
    ): Promise<{ data: WeatherData[] | null; error: Error | null }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return WeatherRepository.getWeatherForecast(currentFarmId, {
        ...options,
        fieldId: selectedFieldId,
      });
    },

    /**
     * Get active weather alerts for the current farm
     */
    getCurrentFarmAlerts: async (): Promise<{
      data: WeatherAlert[] | null;
      error: Error | null;
    }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return WeatherRepository.getActiveAlerts(currentFarmId);
    },
  };
};
