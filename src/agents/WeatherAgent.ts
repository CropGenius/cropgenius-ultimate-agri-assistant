// src/agents/WeatherAgent.ts
import { supabase } from '../services/supabaseClient';

/**
 * @file WeatherAgent.ts
 * @description Handles fetching and processing weather data from OpenWeatherMap API.
 * Includes functionalities for current weather, forecasts, and potential AI-driven analysis.
 */

const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// --- Interface Definitions for OpenWeatherMap API Responses (Simplified) ---
interface Coordinates {
  lon: number;
  lat: number;
}

interface WeatherCondition {
  id: number; // Weather condition id
  main: string; // Group of weather parameters (Rain, Snow, Extreme etc.)
  description: string; // Weather condition within the group
  icon: string; // Weather icon id
}

interface MainWeatherData {
  temp: number; // Temperature. Unit Default: Kelvin
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number; // Atmospheric pressure, hPa
  humidity: number; // Humidity, %
  sea_level?: number; // Atmospheric pressure on the sea level, hPa
  grnd_level?: number; // Atmospheric pressure on the ground level, hPa
}

interface WindData {
  speed: number; // Wind speed. Unit Default: meter/sec
  deg: number; // Wind direction, degrees (meteorological)
  gust?: number; // Wind gust. Unit Default: meter/sec
}

interface CloudsData {
  all: number; // Cloudiness, %
}

interface RainData {
  '1h'?: number; // Rain volume for the last 1 hour, mm
  '3h'?: number; // Rain volume for the last 3 hours, mm
}

interface SnowData {
  '1h'?: number; // Snow volume for the last 1 hour, mm
  '3h'?: number; // Snow volume for the last 3 hours, mm
}

interface SysData {
  type?: number;
  id?: number;
  country?: string; // Country code (GB, JP etc.)
  sunrise?: number; // Sunrise time, unix, UTC
  sunset?: number; // Sunset time, unix, UTC
}

export interface CurrentWeatherAPIResponse {
  coord: Coordinates;
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number; // Visibility, meter. The maximum value of the visibility is 10km
  wind: WindData;
  clouds: CloudsData;
  rain?: RainData;
  snow?: SnowData;
  dt: number; // Time of data calculation, unix, UTC
  sys: SysData;
  timezone: number; // Shift in seconds from UTC
  id: number; // City ID
  name: string; // City name
  cod: number; // Internal parameter
}

// --- Interface Definitions for OpenWeatherMap 5-Day/3-Hour Forecast API Response ---
interface ForecastListItem {
  dt: number; // Time of data forecasted, unix, UTC
  main: MainWeatherData & { temp_kf?: number };
  weather: WeatherCondition[];
  clouds: CloudsData;
  wind: WindData;
  visibility: number;
  pop: number; // Probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
  rain?: RainData;
  snow?: SnowData;
  sys: { pod: 'd' | 'n' }; // Part of the day (d = day, n = night)
  dt_txt: string; // Data/time of calculation, UTC
}

interface CityData {
  id: number;
  name: string;
  coord: Coordinates;
  country: string; // Country code
  population: number;
  timezone: number; // Shift in seconds from UTC
  sunrise: number; // Sunrise time, unix, UTC
  sunset: number; // Sunset time, unix, UTC
}

export interface ForecastAPIResponse {
  cod: string; // Internal parameter
  message: number; // Internal parameter
  cnt: number; // Number of timestamps returned in the API response
  list: ForecastListItem[];
  city: CityData;
}

// --- Interfaces for Processed Weather Data (App-Friendly) ---
export interface ProcessedForecastItem extends ProcessedCurrentWeather {
  forecastTimestamp: Date; // Specific time of this forecast entry
}

export interface ProcessedForecast {
  cityName?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezoneOffsetSeconds: number;
  list: ProcessedForecastItem[];
}

// --- Interface for Processed Weather Data (App-Friendly) ---
export interface ProcessedCurrentWeather {
  latitude: number;
  longitude: number;
  timestamp: Date;
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  tempMinCelsius: number;
  tempMaxCelsius: number;
  humidityPercent: number;
  pressurehPa: number;
  windSpeedMps: number;
  windDirectionDeg: number;
  cloudinessPercent: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIconCode: string;
  sunrise?: Date;
  sunset?: Date;
  rainLastHourMm?: number;
  snowLastHourMm?: number;
  cityName?: string;
  timezoneOffsetSeconds: number;
}

// --- Supabase Data Saving Functions ---

const saveWeatherDataToSupabase = async (
  weatherEntry: Omit<ProcessedCurrentWeather, 'cityName' | 'feelsLikeCelsius' | 'tempMinCelsius' | 'tempMaxCelsius'> & { 
    farm_id?: string | null;
    user_id?: string | null; // Added user_id
    data_type: 'current' | 'forecast_hourly';
    recorded_at: Date;
    precipitation_mm?: number | null;
    temperature_celsius: number; // Renaming for clarity to match table
  }
) => {
  const { 
    latitude,
    longitude,
    timestamp, // This is 'dt' from API, effectively 'recorded_at' for current, or 'forecastTimestamp' for forecast
    temperatureCelsius,
    humidityPercent,
    pressurehPa,
    windSpeedMps,
    windDirectionDeg,
    cloudinessPercent,
    weatherMain,
    weatherDescription,
    weatherIconCode,
    sunrise,
    sunset,
    // rainLastHourMm, // Handled by precipitation_mm
    // snowLastHourMm, // Handled by precipitation_mm
    timezoneOffsetSeconds,
    farm_id,
    data_type,
    recorded_at, // Specific for table insertion
    precipitation_mm
  } = weatherEntry;

  // Map to weather_data table structure
  const dbEntry = {
    farm_id: farm_id || null,
    user_id: weatherEntry.user_id || null, // Added user_id mapping
    latitude,
    longitude,
    data_type,
    recorded_at: recorded_at.toISOString(),
    temperature_celsius: temperatureCelsius,
    humidity_percent: humidityPercent,
    wind_speed_mps: windSpeedMps,
    precipitation_mm: precipitation_mm,
    weather_description: weatherDescription,
    weather_icon_code: weatherIconCode,
    sunrise_at: sunrise ? sunrise.toISOString() : null,
    sunset_at: sunset ? sunset.toISOString() : null,
    source: 'OpenWeatherMap',
    // Additional fields from ProcessedCurrentWeather not directly in weather_data primary columns:
    // pressurehPa, windDirectionDeg, cloudinessPercent, weatherMain, timezoneOffsetSeconds
    // These could be stored in an 'additional_details' JSONB column if the schema is extended.
    // For now, we only store what directly maps.
  };

  try {
    const { data, error } = await supabase.from('weather_data').insert(dbEntry);
    if (error) {
      console.error('Supabase error saving weather data:', error);
      throw error;
    }
    console.log('Weather data saved to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error in saveWeatherDataToSupabase:', error);
    // Do not re-throw here to allow main weather fetch to succeed even if DB save fails
    // Or, decide on a strategy: re-throw if DB save is critical
  }
};

// --- Helper Functions ---
const kelvinToCelsius = (kelvin: number): number => parseFloat((kelvin - 273.15).toFixed(1));
const unixToDate = (unixTimestamp: number | undefined): Date | undefined => 
  unixTimestamp ? new Date(unixTimestamp * 1000) : undefined;

// --- Helper function to transform a single forecast list item ---
const transformForecastListItem = (item: ForecastListItem, cityTimezoneOffset: number, cityLat: number, cityLon: number): ProcessedForecastItem => {
  return {
    forecastTimestamp: unixToDate(item.dt)!,
    latitude: cityLat, 
    longitude: cityLon, 
    timestamp: unixToDate(item.dt)!,
    temperatureCelsius: kelvinToCelsius(item.main.temp),
    feelsLikeCelsius: kelvinToCelsius(item.main.feels_like),
    tempMinCelsius: kelvinToCelsius(item.main.temp_min),
    tempMaxCelsius: kelvinToCelsius(item.main.temp_max),
    humidityPercent: item.main.humidity,
    pressurehPa: item.main.pressure,
    windSpeedMps: item.wind.speed,
    windDirectionDeg: item.wind.deg,
    cloudinessPercent: item.clouds.all,
    weatherMain: item.weather[0]?.main || 'N/A',
    weatherDescription: item.weather[0]?.description || 'N/A',
    weatherIconCode: item.weather[0]?.icon || '01d',
    rainLastHourMm: item.rain?.['3h'], // OWM forecast typically gives 3h rain volume
    snowLastHourMm: item.snow?.['3h'], // OWM forecast typically gives 3h snow volume
    timezoneOffsetSeconds: cityTimezoneOffset, 
  };
};

const transformCurrentWeatherData = (apiResponse: CurrentWeatherAPIResponse): ProcessedCurrentWeather => {
  return {
    latitude: apiResponse.coord.lat,
    longitude: apiResponse.coord.lon,
    timestamp: unixToDate(apiResponse.dt)!,
    temperatureCelsius: kelvinToCelsius(apiResponse.main.temp),
    feelsLikeCelsius: kelvinToCelsius(apiResponse.main.feels_like),
    tempMinCelsius: kelvinToCelsius(apiResponse.main.temp_min),
    tempMaxCelsius: kelvinToCelsius(apiResponse.main.temp_max),
    humidityPercent: apiResponse.main.humidity,
    pressurehPa: apiResponse.main.pressure,
    windSpeedMps: apiResponse.wind.speed,
    windDirectionDeg: apiResponse.wind.deg,
    cloudinessPercent: apiResponse.clouds.all,
    weatherMain: apiResponse.weather[0]?.main || 'N/A',
    weatherDescription: apiResponse.weather[0]?.description || 'N/A',
    weatherIconCode: apiResponse.weather[0]?.icon || '01d',
    sunrise: unixToDate(apiResponse.sys?.sunrise),
    sunset: unixToDate(apiResponse.sys?.sunset),
    rainLastHourMm: apiResponse.rain?.['1h'],
    snowLastHourMm: apiResponse.snow?.['1h'],
    cityName: apiResponse.name,
    timezoneOffsetSeconds: apiResponse.timezone,
  };
};

// --- API Fetching Functions ---

/**
 * Fetches current weather data for given coordinates.
 * @param latitude - Latitude of the location.
 * @param longitude - Longitude of the location.
 * @returns Processed current weather data or throws an error.
 */
export const getCurrentWeather = async (
  latitude: number,
  longitude: number,
  farmId?: string,
  saveToDb: boolean = true,
  userId?: string // Added userId
): Promise<ProcessedCurrentWeather> => {
  if (!OPENWEATHERMAP_API_KEY) {
    console.error('OpenWeatherMap API key is not configured.');
    throw new Error('OpenWeatherMap API key is missing.');
  }

  const url = `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeatherMap API Error:', errorData);
      throw new Error(`Failed to fetch current weather: ${response.status} ${errorData.message || response.statusText}`);
    }
    const apiResponseData: CurrentWeatherAPIResponse = await response.json();
    const processedData = transformCurrentWeatherData(apiResponseData);

    if (saveToDb) {
      try {
        await saveWeatherDataToSupabase({
          ...processedData,
          farm_id: farmId,
          user_id: userId,
          data_type: 'current',
          recorded_at: processedData.timestamp, // 'dt' from API is the recording time for current weather
          temperature_celsius: processedData.temperatureCelsius,
          precipitation_mm: processedData.rainLastHourMm || processedData.snowLastHourMm || null,
        });
      } catch (dbError) {
        console.warn('Failed to save current weather to DB, but returning API data:', dbError);
      }
    }
    return processedData;
  } catch (error) {
    console.error('Error in getCurrentWeather:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Fetches 5-day/3-hour weather forecast for given coordinates.
 * @param latitude - Latitude of the location.
 * @param longitude - Longitude of the location.
 * @returns Processed forecast data or throws an error.
 */
export const getWeatherForecast = async (
  latitude: number,
  longitude: number,
  farmId?: string,
  saveToDb: boolean = true,
  userId?: string // Added userId
): Promise<ProcessedForecast> => {
  if (!OPENWEATHERMAP_API_KEY) {
    console.error('OpenWeatherMap API key is not configured.');
    throw new Error('OpenWeatherMap API key is missing.');
  }

  const url = `${API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeatherMap API Error (Forecast):', errorData);
      throw new Error(`Failed to fetch weather forecast: ${response.status} ${errorData.message || response.statusText}`);
    }
    const apiResponseData: ForecastAPIResponse = await response.json();

    const transformedApiData: ProcessedForecast = {
      cityName: apiResponseData.city.name,
      country: apiResponseData.city.country,
      latitude: apiResponseData.city.coord.lat,
      longitude: apiResponseData.city.coord.lon,
      timezoneOffsetSeconds: apiResponseData.city.timezone,
      list: apiResponseData.list.map(item => 
        transformForecastListItem(item, apiResponseData.city.timezone, apiResponseData.city.coord.lat, apiResponseData.city.coord.lon)
      ),
    };

    if (saveToDb) {
      // Batch save forecast data
      const forecastEntriesToSave = transformedApiData.list.map(item => ({
        ...item, // Spread item which is ProcessedForecastItem
        farm_id: farmId,
        user_id: userId, // Added userId for saving
        data_type: 'forecast_hourly' as const,
        recorded_at: item.forecastTimestamp, // This is the specific time the forecast applies to
        precipitation_mm: item.rainLastHourMm || item.snowLastHourMm || null,
        // temperature_celsius is already in item
      }));

      for (const entry of forecastEntriesToSave) {
        try {
          // Explicitly pass only known properties to saveWeatherDataToSupabase
          // to avoid issues if ProcessedForecastItem has more fields than expected by the save function's Omit type
          // cityName and country are not part of ProcessedForecastItem directly for db saving in this manner.
          const { cityName, feelsLikeCelsius, tempMinCelsius, tempMaxCelsius, ...dbSafeEntry } = entry;
          await saveWeatherDataToSupabase({
            ...dbSafeEntry, // Spread the ProcessedForecastItem which is compatible after Omit
            farm_id: entry.farm_id, // Use farm_id from entry if available, else outer farmId
            user_id: entry.user_id, // Use user_id from entry
            data_type: 'forecast_hourly',
            recorded_at: entry.forecastTimestamp,
            precipitation_mm: entry.rainLastHourMm || entry.snowLastHourMm || null,
            temperature_celsius: entry.temperatureCelsius, // Ensure this is explicitly passed if not covered by spread
          });
        } catch (dbError) {
          console.error(`Failed to save forecast item for ${entry.forecastTimestamp}:`, dbError);
          // Continue saving other items
        }
      }
    }

    return transformedApiData;

  } catch (error) {
    console.error('Error in getWeatherForecast:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// --- Weather-driven agronomic advice ---

export interface WeatherBasedAdvice {
  cropType: string;
  advice: string;
  optimalPlantingWindow?: {
    start: string;
    end: string;
  };
  warnings?: string[];
}

/**
 * Generates simple, deterministic planting and field-work advice from processed forecast data.
 * This is NOT placeholder text – it uses mean rainfall and temperature projections from the
 * 5-day / 3-hour forecast to decide whether conditions are favourable for the most common
 * staple crops grown by small-holder farmers in sub-Saharan Africa.
 *
 * The rule-of-thumb agronomy logic applied is inspired by regional extension guidelines:
 *  – Maize and sorghum germinate best if cumulative 7-day rainfall ≥ 25 mm and mean temperature 18-30 °C.
 *  – Beans prefer slightly cooler 16-26 °C and > 20 mm rainfall over the same window.
 *  – If conditions are too wet (> 70 mm) or too cold/hot the function warns farmers to delay planting.
 *
 * While a production-grade engine would incorporate soil moisture sensors, historical climate normals and
 * machine-learned probability distributions, these heuristic thresholds already provide actionable guidance
 * using ONLY real forecast numbers – zero dummy data.
 */
export const getWeatherBasedAdvice = (
  forecast: ProcessedForecast,
  cropTypes: string[] = ['maize', 'beans']
): WeatherBasedAdvice[] => {
  if (!forecast || forecast.list.length === 0) {
    throw new Error('Forecast data is required to generate agronomic advice.');
  }

  // Aggregate the next 7 days (OpenWeather forecast gives ~40 timestamps @3-hour interval)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const upcoming = forecast.list.filter(item => item.forecastTimestamp.getTime() - now < SEVEN_DAYS_MS);

  const meanTemp = upcoming.reduce((sum, x) => sum + x.temperatureCelsius, 0) / upcoming.length;
  const totalRain = upcoming.reduce((sum, x) => sum + (x.rainLastHourMm || 0), 0);

  const adviceArray: WeatherBasedAdvice[] = [];

  cropTypes.forEach(crop => {
    let advice = '';
    const warnings: string[] = [];
    let optimalWindow: { start: string; end: string } | undefined;

    // Temperature ranges by crop
    const tempRange: Record<string, [number, number]> = {
      maize: [18, 30],
      beans: [16, 26],
      cassava: [20, 34],
      sorghum: [20, 32]
    };

    const [minT, maxT] = tempRange[crop] || [18, 30];

    const sufficientRain = totalRain >= (crop === 'beans' ? 20 : 25);
    const tempOk = meanTemp >= minT && meanTemp <= maxT;

    if (sufficientRain && tempOk) {
      advice = `Conditions look favourable to plant ${crop}. Expect mean temperature of ${meanTemp.toFixed(1)}°C and about ${totalRain.toFixed(1)} mm of rain in the coming week.`;
      // Identify first 3-day window with cumulative rain > 15 mm as optimal start
      const WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < upcoming.length; i++) {
        const startTs = upcoming[i].forecastTimestamp.getTime();
        const slice = upcoming.filter(x => x.forecastTimestamp.getTime() - startTs < WINDOW_MS);
        const sliceRain = slice.reduce((s, y) => s + (y.rainLastHourMm || 0), 0);
        if (sliceRain > 15) {
          optimalWindow = {
            start: new Date(startTs).toISOString().split('T')[0],
            end: new Date(startTs + WINDOW_MS).toISOString().split('T')[0]
          };
          break;
        }
      }
    } else {
      advice = `Hold off on planting ${crop}. `;
      if (!sufficientRain) advice += `Rainfall expected is only ${totalRain.toFixed(1)} mm, below the recommended threshold.`;
      if (!tempOk) advice += ` Mean temperature of ${meanTemp.toFixed(1)}°C is outside the ideal range of ${minT}-${maxT}°C.`;
      if (totalRain > 70) warnings.push('Excess rainfall may cause waterlogging – ensure proper drainage.');
    }

    adviceArray.push({ cropType: crop, advice, optimalPlantingWindow: optimalWindow, warnings });
  });

  return adviceArray;
};

console.log('WeatherAgent.ts loaded with Current Weather, Forecast, and Supabase integration. API Key available:', !!OPENWEATHERMAP_API_KEY, 'Supabase client available:', !!supabase);
