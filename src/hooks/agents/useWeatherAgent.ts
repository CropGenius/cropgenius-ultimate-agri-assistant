// src/hooks/agents/useWeatherAgent.ts
/**
 * Weather Agent Hook
 *
 * Specialized hook for interacting with weather data.
 * Leverages WeatherRepository for data operations.
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useWeatherRepository, WeatherData } from '@/data/repositories';
import {
  getCurrentWeather as getCurrentWeatherInternal,
  getWeatherForecast as getWeatherForecastInternal,
  ProcessedCurrentWeather,
  ProcessedForecast,
  RealTimeWeather,
  WeatherForecast,
} from '@/agents/WeatherAgent';
import { diagnostics } from '@/core/services/diagnosticService';

const AGENT_NAME = 'WeatherAgent';
const AGENT_VERSION = '1.0';

export interface WeatherAgentState {
  currentWeather: ProcessedCurrentWeather | null;
  weatherForecast: ProcessedForecast | null;
  isLoading: boolean;
  error: Error | null;
}

export const useWeatherAgent = () => {
  // Get farm and user context
  const { user, state } = useApp();
  const { currentFarmId } = state;
  const userId = user?.id;

  // Get repository for data operations
  const weatherRepository = useWeatherRepository();

  // Agent state
  const [currentWeather, setCurrentWeather] =
    useState<ProcessedCurrentWeather | null>(null);
  const [weatherForecast, setWeatherForecast] =
    useState<ProcessedForecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch current weather by coordinates
   */
  const fetchCurrentWeather = useCallback(
    async (
      latitude: number,
      longitude: number,
      farmId?: string,
      saveToDb: boolean = true
    ): Promise<ProcessedCurrentWeather | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the agent to get processed weather data
        const data = await getCurrentWeatherInternal(
          latitude,
          longitude,
          farmId || currentFarmId,
          saveToDb,
          userId
        );

        setCurrentWeather(data);

        // If we should save to DB and we have necessary context
        if (saveToDb && userId && (farmId || currentFarmId)) {
          try {
            // Map the processed data to our repository model
            const weatherData: Omit<
              WeatherData,
              'id' | 'created_at' | 'updated_at'
            > = {
              farm_id: farmId || currentFarmId!,
              timestamp: new Date().toISOString(),
              temperature: data.temperature,
              feels_like: data.feelsLike,
              humidity: data.humidity,
              wind_speed: data.windSpeed,
              condition: data.condition,
              condition_icon: data.conditionIcon,
              source: 'openweathermap',
              location_lat: latitude,
              location_lng: longitude,
              is_forecast: false,
              pressure: data.pressure,
            };

            // Save to repository
            await weatherRepository.saveWeatherData(weatherData);
          } catch (repoError) {
            console.error(
              'Error saving weather data to repository:',
              repoError
            );
            // Don't fail the entire operation if just saving fails
          }
        }

        return data;
      } catch (error) {
        console.error('Error fetching current weather:', error);
        const weatherError =
          error instanceof Error
            ? error
            : new Error('Failed to fetch current weather');

        diagnostics.logError(weatherError, {
          source: 'WeatherAgent',
          operation: 'fetchCurrentWeather',
          context: { latitude, longitude, farmId: farmId || currentFarmId },
        });

        setError(weatherError);
        throw weatherError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [currentFarmId, userId, weatherRepository]
  );

  /**
   * Fetch weather forecast by coordinates
   */
  const fetchWeatherForecast = useCallback(
    async (
      latitude: number,
      longitude: number,
      farmId?: string,
      saveToDb: boolean = true
    ): Promise<ProcessedForecast | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the agent to get processed forecast data
        const data = await getWeatherForecastInternal(
          latitude,
          longitude,
          farmId || currentFarmId,
          saveToDb,
          userId
        );

        setWeatherForecast(data);

        // If we should save to DB and we have necessary context
        if (saveToDb && userId && (farmId || currentFarmId)) {
          try {
            // Map forecast items to our repository model and save batch
            const forecastItems: Omit<
              WeatherData,
              'id' | 'created_at' | 'updated_at'
            >[] = data.list.map((item) => ({
              farm_id: farmId || currentFarmId!,
              timestamp: new Date().toISOString(),
              temperature: item.temperature,
              humidity: item.humidity,
              wind_speed: item.windSpeed,
              condition: item.condition,
              condition_icon: item.conditionIcon,
              precipitation_probability: item.rainProbability,
              source: 'openweathermap',
              location_lat: latitude,
              location_lng: longitude,
              is_forecast: true,
              forecast_timestamp: item.timestamp,
            }));

            // Save batch to repository
            await weatherRepository.saveWeatherDataBatch(forecastItems);
          } catch (repoError) {
            console.error(
              'Error saving forecast data to repository:',
              repoError
            );
            // Don't fail the entire operation if just saving fails
          }
        }

        return data;
      } catch (error) {
        console.error('Error fetching weather forecast:', error);
        const forecastError =
          error instanceof Error
            ? error
            : new Error('Failed to fetch weather forecast');

        diagnostics.logError(forecastError, {
          source: 'WeatherAgent',
          operation: 'fetchWeatherForecast',
          context: { latitude, longitude, farmId: farmId || currentFarmId },
        });

        setError(forecastError);
        throw forecastError; // Re-throw for caller handling
      } finally {
        setIsLoading(false);
      }
    },
    [currentFarmId, userId, weatherRepository]
  );

  /**
   * Get active weather alerts for the current farm
   */
  const getActiveWeatherAlerts = useCallback(async () => {
    if (!currentFarmId) {
      return { data: [], error: new Error('No farm selected') };
    }

    return weatherRepository.getActiveAlerts(currentFarmId);
  }, [currentFarmId, weatherRepository]);

  /**
   * Get historical weather for the current farm
   */
  const getHistoricalWeather = useCallback(
    async (
      startDate: string,
      endDate: string,
      aggregation: 'hourly' | 'daily' | 'weekly' = 'daily'
    ) => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }

      return weatherRepository.getHistoricalWeather(currentFarmId, {
        startDate,
        endDate,
        aggregation,
      });
    },
    [currentFarmId, weatherRepository]
  );

  return {
    // State
    currentWeather,
    weatherForecast,
    isLoading,
    error,

    // Actions
    fetchCurrentWeather,
    fetchWeatherForecast,
    getActiveWeatherAlerts,
    getHistoricalWeather,
  };
};
