import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  ArrowRight,
  Droplet,
  CloudLightning,
  Thermometer,
  CloudSun,
  Umbrella,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
// import { toast } from "sonner"; // Toast for critical weather removed for now
import { useAIAgentHub } from '@/hooks/useAIAgentHub';
import {
  ProcessedCurrentWeather,
  ProcessedForecastItem,
} from '@/agents/WeatherAgent';

// Define a new interface for the processed data to be displayed
interface DisplayableForecastItem {
  day: string; // "Today", "Tue", "Wed"
  temp: number; // Avg or Max temp for the day
  icon: 'sun' | 'cloud' | 'rain' | 'storm'; // Dominant icon
  rainChance: number; // Max rain chance for the day
}

interface DisplayableWeather {
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'storm';
  rainChance: number; // Probability of precipitation for current (approximated from first forecast item)
  humidity: number;
  windSpeed: number; // in km/h
  forecast: DisplayableForecastItem[];
}

export default function WeatherPreview() {
  const [displayWeather, setDisplayWeather] =
    useState<DisplayableWeather | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [animation, setAnimation] = useState(false);
  const [locationName, setLocationName] = useState('Your Farm');
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);

  const {
    fetchCurrentWeather,
    currentWeather,
    isLoadingCurrentWeather,
    currentWeatherError,
    fetchWeatherForecast,
    weatherForecast,
    isLoadingWeatherForecast,
    weatherForecastError,
  } = useAIAgentHub();

  const mapOwmIconToPreviewIcon = (
    iconCode: string,
    mainCondition: string
  ): 'sun' | 'cloud' | 'rain' | 'storm' => {
    if (iconCode.startsWith('01')) return 'sun'; // Clear sky
    if (iconCode.startsWith('02')) return 'sun'; // Few clouds (consider sun/cloud)
    if (iconCode.startsWith('03') || iconCode.startsWith('04')) return 'cloud'; // Scattered, broken, overcast clouds
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'rain'; // Shower rain, rain
    if (iconCode.startsWith('11')) return 'storm'; // Thunderstorm
    if (iconCode.startsWith('13')) return 'cloud'; // Snow (map to cloud for now)
    if (iconCode.startsWith('50')) return 'cloud'; // Mist
    // Fallback based on main condition for robustness
    if (mainCondition.toLowerCase().includes('rain')) return 'rain';
    if (
      mainCondition.toLowerCase().includes('storm') ||
      mainCondition.toLowerCase().includes('thunder')
    )
      return 'storm';
    if (mainCondition.toLowerCase().includes('cloud')) return 'cloud';
    return 'sun'; // Default
  };

  const processForecastData = (
    forecastItems: ProcessedForecastItem[]
  ): DisplayableForecastItem[] => {
    if (!forecastItems || forecastItems.length === 0) return [];

    const dailyData: {
      [key: string]: {
        temps: number[];
        icons: ('sun' | 'cloud' | 'rain' | 'storm')[];
        rainChances: number[];
        items: number;
      };
    } = {};

    forecastItems.forEach((item) => {
      const date = new Date(item.forecastTimestamp);
      const dayKey = date.toISOString().split('T')[0];

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { temps: [], icons: [], rainChances: [], items: 0 };
      }
      dailyData[dayKey].temps.push(item.temperatureCelsius);
      dailyData[dayKey].icons.push(
        mapOwmIconToPreviewIcon(item.weatherIconCode, item.weatherMain)
      );
      dailyData[dayKey].rainChances.push(item.pop * 100);
      dailyData[dayKey].items++;
    });

    const today = new Date().toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return Object.keys(dailyData)
      .slice(0, 5)
      .map((dayKey) => {
        const dayData = dailyData[dayKey];
        const date = new Date(dayKey + 'T00:00:00'); // Ensure consistent date object for day name
        let dayName = dayKey === today ? 'Today' : dayNames[date.getDay()];

        const avgTemp =
          dayData.temps.reduce((a, b) => a + b, 0) / dayData.items;
        // Prioritize storm > rain > cloud > sun for icon
        let dominantIcon: 'sun' | 'cloud' | 'rain' | 'storm' = 'sun';
        if (dayData.icons.includes('storm')) dominantIcon = 'storm';
        else if (dayData.icons.includes('rain')) dominantIcon = 'rain';
        else if (dayData.icons.includes('cloud')) dominantIcon = 'cloud';

        const maxRainChance = Math.max(...dayData.rainChances);

        return {
          day: dayName,
          temp: Math.round(avgTemp),
          icon: dominantIcon,
          rainChance: Math.round(maxRainChance),
        };
      });
  };

  useEffect(() => {
    const loadWeatherData = (lat: number, lon: number) => {
      setCurrentLatitude(lat);
      setCurrentLongitude(lon);
      fetchCurrentWeather(lat, lon, undefined, false); // farmId not crucial for preview, don't save by default from preview
      fetchWeatherForecast(lat, lon, undefined, false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Default to a fallback location (e.g., Nairobi)
          loadWeatherData(-1.2921, 36.8219);
          setLocationName('Nairobi (Default)');
        }
      );
    } else {
      // Geolocation not supported, use fallback
      loadWeatherData(-1.2921, 36.8219);
      setLocationName('Nairobi (Default)');
    }
  }, [fetchCurrentWeather, fetchWeatherForecast]);

  useEffect(() => {
    if (currentWeather && weatherForecast) {
      const processedDailyForecast = processForecastData(weatherForecast.list);
      const currentRainChance =
        processedDailyForecast.length > 0 &&
        processedDailyForecast[0].day === 'Today'
          ? processedDailyForecast[0].rainChance
          : weatherForecast.list[0]?.pop * 100 || 0;

      setDisplayWeather({
        temp: Math.round(currentWeather.temperatureCelsius),
        condition:
          currentWeather.weatherDescription.charAt(0).toUpperCase() +
          currentWeather.weatherDescription.slice(1),
        icon: mapOwmIconToPreviewIcon(
          currentWeather.weatherIconCode,
          currentWeather.weatherMain
        ),
        rainChance: Math.round(currentRainChance),
        humidity: Math.round(currentWeather.humidityPercent),
        windSpeed: parseFloat((currentWeather.windSpeedMps * 3.6).toFixed(1)), // m/s to km/h
        forecast: processedDailyForecast,
      });
      setLocationName(currentWeather.cityName || 'Detected Location');
      setAnimation(true);
      setTimeout(() => setAnimation(false), 1500);
    } else if (
      currentWeather &&
      !weatherForecast &&
      !isLoadingWeatherForecast
    ) {
      // Handle case where only current weather is available initially
      setDisplayWeather({
        temp: Math.round(currentWeather.temperatureCelsius),
        condition:
          currentWeather.weatherDescription.charAt(0).toUpperCase() +
          currentWeather.weatherDescription.slice(1),
        icon: mapOwmIconToPreviewIcon(
          currentWeather.weatherIconCode,
          currentWeather.weatherMain
        ),
        rainChance: 0, // No forecast yet to derive this
        humidity: Math.round(currentWeather.humidityPercent),
        windSpeed: parseFloat((currentWeather.windSpeedMps * 3.6).toFixed(1)),
        forecast: [],
      });
      setLocationName(currentWeather.cityName || 'Detected Location');
    }
  }, [currentWeather, weatherForecast, isLoadingWeatherForecast]);

  const getWeatherIcon = (icon: string, size: number = 10) => {
    const iconSize = `${size / 4}rem`;

    switch (icon) {
      case 'rain':
        return (
          <CloudRain
            style={{ height: iconSize, width: iconSize }}
            className="text-blue-500"
          />
        );
      case 'cloud':
        return (
          <CloudSun
            style={{ height: iconSize, width: iconSize }}
            className="text-slate-400"
          />
        );
      case 'storm':
        return (
          <CloudLightning
            style={{ height: iconSize, width: iconSize }}
            className="text-purple-500"
          />
        );
      default:
        return (
          <Sun
            style={{ height: iconSize, width: iconSize }}
            className="text-amber-500"
          />
        );
    }
  };

  const refreshWeather = () => {
    if (currentLatitude !== null && currentLongitude !== null) {
      // Clear old data to show loading state properly
      setDisplayWeather(null);
      fetchCurrentWeather(currentLatitude, currentLongitude, undefined, false);
      fetchWeatherForecast(currentLatitude, currentLongitude, undefined, false);
    } else {
      // Attempt to re-trigger geolocation if lat/lon are not set
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLatitude(position.coords.latitude);
            setCurrentLongitude(position.coords.longitude);
            fetchCurrentWeather(
              position.coords.latitude,
              position.coords.longitude,
              undefined,
              false
            );
            fetchWeatherForecast(
              position.coords.latitude,
              position.coords.longitude,
              undefined,
              false
            );
          },
          () => {
            /* Handle error or use default */
          }
        );
      }
    }
  };

  return (
    <Card
      className={`h-full border-2 hover:border-primary/50 transition-all ${animation ? 'animate-pulse' : ''}`}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
        <CardTitle className="flex justify-between items-center">
          <span>AI Weather Intelligence</span>
          <Badge className="text-xs animate-pulse bg-green-600 hover:bg-green-700">
            LIVE
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>Hyperlocal forecast for {locationName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={refreshWeather}
          >
            <Cloud className="h-3 w-3" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoadingCurrentWeather ||
          isLoadingWeatherForecast ||
          !displayWeather) &&
        !(currentWeatherError || weatherForecastError) ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="h-16 w-16 rounded-full bg-gray-100 animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-100 animate-pulse"></div>
          </div>
        ) : currentWeatherError || weatherForecastError ? (
          <div className="flex flex-col items-center justify-center h-32 text-red-500">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="text-sm text-center">
              Could not load weather data.
              {currentWeatherError && (
                <span className="block text-xs">
                  {currentWeatherError.message}
                </span>
              )}
              {weatherForecastError && (
                <span className="block text-xs">
                  {weatherForecastError.message}
                </span>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWeather}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : displayWeather ? (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {getWeatherIcon(displayWeather.icon, 10)}
                <div className="absolute inset-0 rounded-full bg-blue-200/20 dark:bg-blue-500/10 blur-xl -z-10"></div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tighter flex items-start">
                  {displayWeather.temp}°C
                  <span className="text-sm text-muted-foreground ml-1 mt-1">
                    {displayWeather.condition}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Wind: {displayWeather.windSpeed} km/h
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <span className="text-sm">{displayWeather.humidity}%</span>
                </div>
                <Progress value={displayWeather.humidity} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span>Rain</span>
                  </div>
                  <span className="text-sm">{displayWeather.rainChance}%</span>
                </div>
                <Progress value={displayWeather.rainChance} className="h-2" />
              </div>
            </div>

            <div className="mb-4 overflow-x-auto">
              <div className="flex space-x-1 pb-1 min-w-max">
                {displayWeather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg flex-1 min-w-24 text-center cursor-pointer transition-all ${
                      activeDay === index
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => setActiveDay(index)}
                  >
                    <div className="font-medium text-xs">{day.day}</div>
                    <div className="my-1">{getWeatherIcon(day.icon, 6)}</div>
                    <div className="text-sm font-semibold">{day.temp}°</div>
                    <div className="text-xs flex justify-center items-center gap-1">
                      <Umbrella className="h-3 w-3" />
                      {day.rainChance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* AI Recommendation section removed as it's not directly from the agent output yet */}

            <Link to="/weather" className="mt-4">
              <Button variant="outline" size="sm" className="w-full group">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Full Weather Intelligence
                  <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>Unable to load weather data</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={refreshWeather}
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
